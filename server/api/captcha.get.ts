import { load } from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import { extractCheerioVal } from '../utils/cheerio-helpers';
import type { MobileSuicaLoginParams, SessionData } from './types';
import MobilesuicaClient from '@/server/utils/mobilesuica-client';

const mobileSuicaBaseUrl = 'https://www.mobilesuica.com';

function downloadCaptchaImage(
  client: MobilesuicaClient,
  $: CheerioAPI
): Promise<Buffer> {
  const captchaPath =
    $('#WebCaptcha1').find('.igc_TrendyCaptchaImage').first().attr('src') ?? '';

  const captchaUrl = `${mobileSuicaBaseUrl}/${captchaPath}`;

  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    client
      .stream(captchaUrl)
      .on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      })
      .on('error', (err) => reject(err))
      .on('end', () => {
        resolve(Buffer.concat(chunks));
      });
  });
}

type MobileSuicaLoginKeys = keyof MobileSuicaLoginParams;

function getMobileSuicaLoginParams($: CheerioAPI): MobileSuicaLoginParams {
  const mobileSuicaLoginParams: MobileSuicaLoginParams = {
    __EVENTARGUMENT: '',
    __EVENTTARGET: '',
    __VIEWSTATE: '',
    __VIEWSTATEENCRYPTED: '',
    __VIEWSTATEGENERATOR: '',
    baseVariable: '',
    baseVarLogoutBtn: 'off',
    LOGIN: 'ログイン',
    MailAddress: '',
    Password: '',
    WebCaptcha1__editor: '',
    WebCaptcha1__editor_clientState: '',
    WebCaptcha1_clientState: '[[[[null]],[],[]],[{},[]],null]',
  };

  const hiddenInputNames: MobileSuicaLoginKeys[] = [
    '__EVENTARGUMENT',
    '__EVENTTARGET',
    '__VIEWSTATE',
    '__VIEWSTATEENCRYPTED',
    '__VIEWSTATEGENERATOR',
    'baseVariable',
  ];

  return hiddenInputNames.reduce((mobileSuicaLoginParams, name) => {
    mobileSuicaLoginParams[name] = extractCheerioVal(
      $,
      `input[name='${name}']`
    );

    return mobileSuicaLoginParams;
  }, mobileSuicaLoginParams);
}

function getMobileSuicaLoginPostUrl($: CheerioAPI): string {
  const postPath = $('#form1').attr('action') ?? '';
  return `${mobileSuicaBaseUrl}/${postPath}`;
}

export default defineEventHandler(async (event) => {
  const client = new MobilesuicaClient();
  const runtimeConfig = useRuntimeConfig();

  const session = await useSession<SessionData>(event, {
    password: runtimeConfig.secret,
  });

  try {
    const res = await client.get(`${mobileSuicaBaseUrl}/index.aspx`);
    const $ = load(res.body);

    // ログイン時にPOSTするURLの取得
    const postUrl = getMobileSuicaLoginPostUrl($);

    // ログインに必要なパラメータを取得
    const mobileSuicaLoginParams = getMobileSuicaLoginParams($);

    await session.update((data) => {
      data.login = {
        cookies: client.getCookies(),
        params: mobileSuicaLoginParams,
        url: postUrl,
      };
      return data;
    });

    // キャプチャを取得
    const captcha = await downloadCaptchaImage(client, $);

    event.node.res.setHeader('Content-Type', 'image/gif');
    event.node.res.setHeader('Content-Length', captcha.length);

    return captcha;
  } catch (e) {
    return 'error';
  }
});
