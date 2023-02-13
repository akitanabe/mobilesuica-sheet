import { got } from 'got';
import type { ExtendOptions, Got, Response, Request } from 'got';
// eslint-disable-next-line import/default
import iconv from 'iconv-lite';

const ua = {
  chrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
};

// Set-Cookieヘッダが付いたレスポンスヘッダをCookieにセットする
type Headers = [string, string];
function getSetCookies(headers: Response['rawHeaders']): string[] {
  return headers
    .reduce<Headers[]>((headers, item, i) => {
      if (i % 2 === 1) {
        const prev = headers.at(-1);

        if (prev !== undefined) {
          prev[1] = item;
        }
      } else {
        headers.push([item, '']);
      }

      return headers;
    }, [])
    .filter(([key]) => key === 'Set-Cookie')
    .map(([_key, value]) => value.split(';').at(0) ?? '');
}

// SJISでURLエンコードする(encodeURIはUTF-8ベース)
function encodeURIForSjis(text: string): string {
  const buffer = iconv.encode(text, 'sjis');

  return Array.from(buffer).reduce((encodedStr, charCode) => {
    // From https://github.com/trilobyte-berlin/node-iconv-urlencode
    // https://github.com/trilobyte-berlin/node-iconv-urlencode/blob/master/lib/iconv-urlencode.js#L33

    // 0x20 - space
    if (charCode === 32) {
      encodedStr += '+';
    }
    // the following are taken as is
    // 0x2a, 0x2d, 0x2e - * - .
    else if (charCode === 42 || charCode === 45 || charCode === 46) {
      encodedStr += String.fromCharCode(charCode);
    }
    // 0x30 -> 0x39 - 0 - 9
    else if (charCode >= 48 && charCode <= 57) {
      encodedStr += String.fromCharCode(charCode);
    }
    // 0x41 -> 0x5a - us-ascii uppercase letters
    else if (charCode >= 65 && charCode <= 90) {
      encodedStr += String.fromCharCode(charCode);
    }
    // 0x5f - _
    else if (charCode === 95) {
      encodedStr += String.fromCharCode(charCode);
    }
    // 0x61 -> 0x7a - us-ascii lowercase letters
    else if (charCode >= 97 && charCode <= 122) {
      encodedStr += String.fromCharCode(charCode);
    } else {
      encodedStr += `%${charCode.toString(16).toUpperCase()}`;
    }

    return encodedStr;
  }, '');
}

// 入力されたCookieを上書きする
export type Cookies = Record<string, string>;
function toNewCookies(newCookies: Cookies, cookie: string): Cookies {
  const [key, value] = cookie.split('=');

  if (key && value) {
    newCookies[key] = value;
  }

  return newCookies;
}

type SearchParams = Record<string, string> | [string, string][];
function serialize(params: SearchParams): string {
  const kvarr = !Array.isArray(params) ? Object.entries(params) : params;

  return kvarr
    .map(([key, value]) => {
      const sjisKey = encodeURIForSjis(key);
      const sjisValue = encodeURIForSjis(value);

      return `${sjisKey}=${sjisValue}`;
    })
    .join('&');
}

class MobilesuicaClient {
  constructor(options: ExtendOptions = {}, cookies: Cookies = {}) {
    this.cookies = { ...cookies };
    this.defaults = { ...options };
  }

  private defaults: ExtendOptions;

  private cookies: Cookies;

  private browser: keyof typeof ua = 'chrome';

  private buildClient(onceOptions: ExtendOptions = {}): Got {
    const headers = { ...this.defaults.headers, ...onceOptions.headers };

    headers['User-Agent'] = ua[this.browser];
    headers.Cookie = Object.entries(this.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    return got.extend({ ...this.defaults, ...onceOptions, headers });
  }

  async get(url: string, params: SearchParams = {}): Promise<Response<string>> {
    const urlobj = new URL(url);

    const client = this.buildClient();

    const searchParams = [urlobj.search, serialize(params)].join('&');

    const res = await client.get(urlobj.href, {
      searchParams,
    });

    this.postRequest(res);

    return res;
  }

  async post(
    url: string,
    formdata: SearchParams = {}
  ): Promise<Response<string>> {
    const urlobj = new URL(url);

    const client = this.buildClient({
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const formdataStr = serialize(formdata);

    const res = await client.post(urlobj.href, {
      body: formdataStr,
    });

    this.postRequest(res);

    return res;
  }

  stream(url: string, params: SearchParams = {}): Request {
    const urlobj = new URL(url);

    const client = this.buildClient();

    const searchParams = [urlobj.search, serialize(params)].join('&');

    const req = client.stream(urlobj.href, { searchParams });

    return req;
  }

  private postRequest(res: Response) {
    // Cookieを更新
    this.cookies = getSetCookies(res.rawHeaders).reduce(toNewCookies, {
      ...this.cookies,
    });

    // SJISでエンコードされているのでUTF-8へ変換
    res.body = iconv.decode(res.rawBody, 'sjis');
  }

  getCookies(): Cookies {
    return this.cookies;
  }
}

export default MobilesuicaClient;
