import { load } from 'cheerio';
import {
  MobileSuicaLoginParams,
  MobileSuicaSessionAuth,
  MobileSuicaSessionLogin,
  ResultError,
  ResultSuccess,
  UserInputBody,
} from './types';
import MobilesuicaClient from '@/server/utils/mobilesuica-client';

const mobileSuicaBaseUrl = 'https://www.mobilesuica.com';

async function login(
  url: string,
  client: MobilesuicaClient,
  params: MobileSuicaLoginParams,
  { email, password, captcha }: UserInputBody
): Promise<void> {
  const formdata: MobileSuicaLoginParams = {
    ...params,
    ...{
      MailAddress: email,
      Password: password,
      WebCaptcha1__editor: captcha,
      WebCaptcha1__editor_clientState: `|0|01${captcha}||[[[[]],[],[]],[{},[]],"01${captcha}"]`,
    },
  };

  const res = await client.post(url, formdata);

  const $ = load(res.body);

  if ($('title').text() !== 'JR東日本：モバイルSuica＞会員メニュー') {
    throw new Error('MobileSuica login failed.');
  }
}

async function transitionIndex(
  url: string,
  client: MobilesuicaClient
): Promise<string> {
  const res = await client.get(url);

  const $ = load(res.body);

  const title = $('title').text();

  if (title !== 'JR東日本：モバイルSuica＞会員メニュー') {
    throw new Error('MobileSuica transition failed.');
  }

  // hrefから遷移先を取得する
  const href = $('#btn_sfHistory').find('a').attr('href') ?? '';

  const matches = href.match(/^javascript:StartApplication\('(.+)'\)/);

  return (matches && matches[1]) ?? '';
}

async function transitionSuicaChangeTransfer(
  url: string,
  client: MobilesuicaClient
): Promise<string> {
  const res = await client.post(url);

  const $ = load(res.body);

  if ($('title').text() !== '業務機能へ転送遷移') {
    throw new Error('MobileSuica transition Failed.');
  }

  // 遷移先はjavascript内に書かれているので直接指定する
  return `${mobileSuicaBaseUrl}/iq/ir/SuicaDisp.aspx?returnId=SFRCMMEPC03`;
}

async function transitionSuicaDisp(url: string, client: MobilesuicaClient) {
  const res = await client.post(url);

  const $ = load(res.body);

  if (
    $('title').text() !== 'JR東日本：モバイルSuica＞SF（電子マネー）利用履歴'
  ) {
    throw new Error('MobileSuica transition Failed.');
  }
}

// Index => SuicaChangeTransfer => SuicaDisp
async function transition(client: MobilesuicaClient): Promise<void> {
  const indexUrl = `${mobileSuicaBaseUrl}/Index.aspx`;

  const suicaChangeTransferUrl = await transitionIndex(indexUrl, client);

  const suicaDispUrl = await transitionSuicaChangeTransfer(
    suicaChangeTransferUrl,
    client
  );

  await transitionSuicaDisp(suicaDispUrl, client);
}

export default defineEventHandler(async (event) => {
  const { session } = event.context;

  try {
    const res: ResultSuccess = { ok: true };

    if (session.login === undefined) {
      throw new Error('Should reflesh captcha image.');
    }

    const body = await readBody<UserInputBody>(event);

    const { cookies, params, url } = event.context.session
      .login as MobileSuicaSessionLogin;

    const client = new MobilesuicaClient({}, cookies);

    await login(url, client, params, body);

    await transition(client);

    const auth: MobileSuicaSessionAuth = {
      cookies: client.getCookies(),
      user: { email: body.email, password: body.password },
    };

    session.auth = auth;

    return res;
  } catch (e) {
    const res: ResultError = { ok: false, message: '' };
    if (e instanceof Error) {
      res.message = e.message;
    }

    return res;
  }
});
