import { CheerioAPI, load as $load } from 'cheerio';
import { extractCheerioVal } from '../utils/cheerio-helpers';
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

type MobileSuicaLoginParams = {
  __EVENTTARGET: string;
  __EVENTARGUMENT: string;
  __VIEWSTATE: string;
  __VIEWSTATEGENERATOR: string;
  __VIEWSTATEENCRYPTED: string;
  baseVariable: string;
  baseVarLogoutBtn: string;
  MailAddress: string;
  Password: string;
  WebCaptcha1_clientState: string;
  WebCaptcha1__editor_clientState: string;
  WebCaptcha1__editor: string;
  LOGIN: string;
};

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

    const captcha = await downloadCaptchaImage(client, $);

    const postPath = $('#form1').attr('action') ?? '';
    const postUrl = `${mobileSuicaBaseUrl}/${postPath}`;
    const mobileSuicaLoginParams = getMobileSuicaLoginParams($);

    event.context.session.login = {
      cookies: client.getCookies(),
      params: mobileSuicaLoginParams,
      url: postUrl,
    };

    return captcha;
  } catch (e) {
    return 'error';
  }
});
