/* eslint-disable import/no-named-as-default-member */
import { EventEmitter } from 'events';
// eslint-disable-next-line import/default
import client from 'cheerio-httpcli';

const mobileSuicaBaseUrl = 'https://www.mobilesuica.com';

const notify = new EventEmitter();

client.download.on('ready', async (stream) => {
  const buffer = await stream.toBuffer();

  notify.emit('downloaded', buffer.toString('base64'));
});

function downloadCaptchaImage(response: client.FetchResult) {
  const $img = response.$('#WebCaptcha1').find('.igc_TrendyCaptchaImage');

  $img.first().download();

  return new Promise<string>((resolve) => {
    notify.once('downloaded', (base64: string) => resolve(base64));
  });
}

export default defineEventHandler(async (_event) => {
  const result = await client.fetch(`${mobileSuicaBaseUrl}/index.aspx`);

  try {
    const captcha = await downloadCaptchaImage(result);
    return captcha;
  } catch (e) {
    return 'error';
  }
});
