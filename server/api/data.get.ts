import { CheerioAPI, load } from 'cheerio';
import { extractCheerioVal } from '../utils/cheerio-helpers';
import MobilesuicaClient from '../utils/mobilesuica-client';
import createSuicaDataConverter from '../utils/suicadata-converter';
import {
  MobileSuicaSessionAuth,
  ResultError,
  ResultSuccess,
  SuicaData,
  SuicaDataPostParams,
} from './types';

function getFormData(
  baseVariable: string,
  lastday: string
): SuicaDataPostParams {
  const [lastY, lastM, lastD] = lastday.split('-');

  return {
    baseVariable,
    specifyYearMonth: `${lastY}/${lastM}`,
    specifyDay: lastD,
    SEARCH: '検索',
  };
}

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, time);
  });
};

function getExcludeLastDayData(tabledata: SuicaData[], lastday: string) {
  return tabledata.filter(([day]) => {
    return day !== lastday;
  });
}

function getSuicaTableData($: CheerioAPI) {
  const tabledata: string[][] = [];
  const specifyYearMonth = extractCheerioVal($, '#Select1');

  $('.historyTable')
    .find('table')
    .find('tr')
    .each((i, tr) => {
      const row: string[] = [];
      $(tr)
        .find('td')
        .each(function (j, td) {
          row[j] = $(td).text();
        });

      // 先頭は表示ボックス列なので飛ばす
      tabledata[i] = row.slice(1);
    });

  const converter = createSuicaDataConverter(specifyYearMonth);
  return (
    tabledata
      // 先頭はヘッダ行なので飛ばす
      .slice(1)
      .map((rowdata) => rowdata.map(converter) as SuicaData)
  );
}

const suicaDispUrl = 'https://www.mobilesuica.com/iq/ir/SuicaDisp.aspx';

async function fetchSuicaData(
  url: string,
  client: MobilesuicaClient,
  formdata: SuicaDataPostParams = {},
  stack: SuicaData[][] = []
): Promise<SuicaData[]> {
  const res = await client.post(url, formdata);

  const $ = load(res.body);

  if (
    $('title').text() !== 'JR東日本：モバイルSuica＞SF（電子マネー）利用履歴'
  ) {
    throw new Error('SuicaData fetch failed.');
  }

  const suicadata = getSuicaTableData($);
  const lastday = suicadata.at(-1)?.at(0);

  if (suicadata.length > 100 && typeof lastday === 'string' && lastday !== '') {
    const baseVariable = extractCheerioVal($, "input[name='baseVariable']");
    const formdata = getFormData(baseVariable, lastday);

    sleep(1000);

    return await fetchSuicaData(url, client, formdata, [
      ...stack,
      getExcludeLastDayData(suicadata, lastday),
    ]);
  }

  return [...stack, suicadata].flat();
}

export default defineEventHandler(async (event) => {
  const { session } = event.context;

  try {
    const res: ResultSuccess = { ok: true };
    if (session.auth === undefined) {
      throw new Error('SuicaData Authoraization failed.');
    }

    const auth = session.auth as MobileSuicaSessionAuth;

    if (auth.data) {
      res.data = auth.data;
    } else {
      const client = new MobilesuicaClient({}, { ...auth.cookies });

      const data = await fetchSuicaData(suicaDispUrl, client);

      auth.data = data;
      res.data = data;
    }

    return res;
  } catch (e) {
    const res: ResultError = { ok: false, message: '' };
    if (e instanceof Error) {
      res.message = e.message;
    }

    return res;
  }
});
