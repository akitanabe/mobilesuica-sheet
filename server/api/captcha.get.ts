import { CheerioAPI, load as $load } from 'cheerio';
import { extractCheerioVal } from '../utils/cheerio-helpers';
import type { MobileSuicaLoginParams, MobileSuicaSessionLogin } from './types';
import MobilesuicaClient from '@/server/utils/mobilesuica-client';

const mobileSuicaBaseUrl = 'https://www.mobilesuica.com';

function downloadCaptchaImage(
  client: MobilesuicaClient,
  $: CheerioAPI
): Promise<string> {
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
        resolve(Buffer.concat(chunks).toString('base64'));
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

export default defineEventHandler(async (event) => {
  const client = new MobilesuicaClient();

  try {
    const res = await client.get(`${mobileSuicaBaseUrl}/index.aspx`);
    const $ = $load(res.body);

    // ログイン時にPOSTするURLの取得
    const postPath = $('#form1').attr('action') ?? '';
    const postUrl = `${mobileSuicaBaseUrl}/${postPath}`;

    // ログインに必要なパラメータを取得
    const mobileSuicaLoginParams = getMobileSuicaLoginParams($);

    const mobileSuicaSessionLoing: MobileSuicaSessionLogin = {
      cookies: client.getCookies(),
      params: mobileSuicaLoginParams,
      url: postUrl,
    };

    event.context.session.login = mobileSuicaSessionLoing;

    // キャプチャを取得
    return await downloadCaptchaImage(client, $);
  } catch (e) {
    return 'error';
  }
});
