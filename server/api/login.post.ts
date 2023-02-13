import { load } from 'cheerio';
import fetchSuicaData from '../utils/fetch-suicadata';
import { MobileSuicaLoginParams, MobileSuicaSessionLogin } from './types';
import MobilesuicaClient from '@/server/utils/mobilesuica-client';

type UserInputParams = {
  email: string;
  password: string;
  captcha: string;
};

const mobileSuicaBaseUrl = 'https://www.mobilesuica.com';

async function login(
  url: string,
  client: MobilesuicaClient,
  params: MobileSuicaLoginParams,
  { email, password, captcha }: UserInputParams
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
async function transition(client: MobilesuicaClient): Promise<string> {
  const indexUrl = `${mobileSuicaBaseUrl}/Index.aspx`;

  const suicaChangeTransferUrl = await transitionIndex(indexUrl, client);

  const suicaDispUrl = await transitionSuicaChangeTransfer(
    suicaChangeTransferUrl,
    client
  );

  await transitionSuicaDisp(suicaDispUrl, client);

  return suicaDispUrl;
}

export default defineEventHandler(async (event) => {
  if (event.context.session.login === undefined) {
    throw new Error('Should reflesh captcha image.');
  }

  const user = await readBody<UserInputParams>(event);

  const { cookies, params, url } = event.context.session
    .login as MobileSuicaSessionLogin;
  const client = new MobilesuicaClient({}, cookies);

  try {
    await login(url, client, params, user);

    const suicaDispUrl = await transition(client);

    const suicaData = await fetchSuicaData(suicaDispUrl, client);

    return JSON.stringify(suicaData);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
});
