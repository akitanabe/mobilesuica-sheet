import { CheerioAPI, load } from 'cheerio';
import { extractCheerioVal } from './cheerio-helpers';
import MobilesuicaClient from './mobilesuica-client';

type SuicaDataPostParams =
  | {
      baseVariable: string;
      specifyYearMonth: string;
      specifyDay: string;
      SEARCH: '検索';
    }
  | {};

function getExcludeLastDayData(tabledata: string[][], lastday: string) {
  return tabledata.filter(([day]) => {
    return day !== lastday;
  });
}

function getFormData($: CheerioAPI, lastday: string): SuicaDataPostParams {
  const baseVariable = extractCheerioVal($, "input[name='baseVariable']");
  const [lastY, lastM, lastD] = lastday.split('/');

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

function convertTableData(specifyYearMonth: string) {
  const [specifyYear, specifyMonth] = specifyYearMonth.split('/');

  if (specifyYear === undefined || specifyMonth === undefined) {
    throw new Error('SuicaData Fetch failed. specifyYearMonth is not defined.');
  }

  return function ([monthDay, ...data]: string[]): string[] {
    const [month, day] = monthDay?.split('/');

    const year =
      month > specifyMonth
        ? (parseInt(specifyYear, 10) - 1).toString()
        : specifyYear;

    const ymd = `${year}/${month}/${day}`;

    return [ymd, ...data];
  };
}

function getSuicaTableData($: CheerioAPI) {
  const tabledata: string[][] = [];
  const specifyYearMonth = $('#Select1').val() ?? '';

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

  // 先頭はヘッダ行なので飛ばす
  return tabledata
    .slice(1)
    .map(
      convertTableData(
        Array.isArray(specifyYearMonth)
          ? specifyYearMonth.at(0) ?? ''
          : specifyYearMonth
      )
    );
}

type SuicaData = string[][];

async function fetchSuicaData(
  url: string,
  client: MobilesuicaClient,
  formdata: SuicaDataPostParams = {},
  stack: SuicaData[] = []
): Promise<SuicaData> {
  const res = await client.post(url, formdata);

  const $ = load(res.body);

  if (
    $('title').text() !== 'JR東日本：モバイルSuica＞SF（電子マネー）利用履歴'
  ) {
    throw new Error('SuicaData fetch failed.');
  }

  const tabledata = getSuicaTableData($);
  const lastday = tabledata.at(-1)?.at(0) ?? '';

  if (tabledata.length > 100 && lastday !== '') {
    const formdata = getFormData($, lastday);
    sleep(1000);
    return await fetchSuicaData(url, client, formdata, [
      ...stack,
      getExcludeLastDayData(tabledata, lastday),
    ]);
  }

  return [...stack, tabledata].flat();
}

export default fetchSuicaData;
