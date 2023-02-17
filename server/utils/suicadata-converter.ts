function toZenkakuKana(str: string): string {
  return Array.from(str).reduce((zenkaku, char) => {
    return zenkaku + char.normalize('NFKC');
  }, '');
}

function convertDate(specifyYearMonth: string): (rawdata: string) => string {
  const [specifyYear, specifyMonth] = specifyYearMonth.split('/');

  if (specifyYear === undefined || specifyMonth === undefined) {
    throw new Error('SuicaData Fetch failed. specifyYearMonth is not defined.');
  }

  return function (rawdata: string): string {
    const [month, day] = rawdata.split('/');

    const year =
      month > specifyMonth
        ? (parseInt(specifyYear, 10) - 1).toString()
        : specifyYear;

    return `${year}-${month}-${day}`;
  };
}

function convertType() {
  return function (rawdata: string): string {
    return rawdata;
  };
}

function convertLocation() {
  return function (rawdata: string): string {
    return rawdata.replace(/\s$/, '');
  };
}

function convertBalance() {
  return function (rawdata: string): number {
    return parseInt(rawdata.replace(/^\\|,/g, ''), 10);
  };
}

function convertPrice() {
  return function (rawdata: string): number {
    return parseInt(rawdata.replace(/,/g, ''), 10);
  };
}

function createSuicaDataConverter(specifyYearMonth: string) {
  const converter = [
    convertDate(specifyYearMonth),
    convertType(),
    convertLocation(),
    convertType(),
    convertLocation(),
    convertBalance(),
    convertPrice(),
  ];

  return function (rawdata: string, i: number) {
    return converter[i](rawdata);
  };
}

export default createSuicaDataConverter;
