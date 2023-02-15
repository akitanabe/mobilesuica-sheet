const kanaMap = {
  ｶﾞ: 'ガ',
  ｷﾞ: 'ギ',
  ｸﾞ: 'グ',
  ｹﾞ: 'ゲ',
  ｺﾞ: 'ゴ',
  ｻﾞ: 'ザ',
  ｼﾞ: 'ジ',
  ｽﾞ: 'ズ',
  ｾﾞ: 'ゼ',
  ｿﾞ: 'ゾ',
  ﾀﾞ: 'ダ',
  ﾁﾞ: 'ヂ',
  ﾂﾞ: 'ヅ',
  ﾃﾞ: 'デ',
  ﾄﾞ: 'ド',
  ﾊﾞ: 'バ',
  ﾋﾞ: 'ビ',
  ﾌﾞ: 'ブ',
  ﾍﾞ: 'ベ',
  ﾎﾞ: 'ボ',
  ﾊﾟ: 'パ',
  ﾋﾟ: 'ピ',
  ﾌﾟ: 'プ',
  ﾍﾟ: 'ペ',
  ﾎﾟ: 'ポ',
  ｳﾞ: 'ヴ',
  ﾜﾞ: 'ヷ',
  ｦﾞ: 'ヺ',
  ｱ: 'ア',
  ｲ: 'イ',
  ｳ: 'ウ',
  ｴ: 'エ',
  ｵ: 'オ',
  ｶ: 'カ',
  ｷ: 'キ',
  ｸ: 'ク',
  ｹ: 'ケ',
  ｺ: 'コ',
  ｻ: 'サ',
  ｼ: 'シ',
  ｽ: 'ス',
  ｾ: 'セ',
  ｿ: 'ソ',
  ﾀ: 'タ',
  ﾁ: 'チ',
  ﾂ: 'ツ',
  ﾃ: 'テ',
  ﾄ: 'ト',
  ﾅ: 'ナ',
  ﾆ: 'ニ',
  ﾇ: 'ヌ',
  ﾈ: 'ネ',
  ﾉ: 'ノ',
  ﾊ: 'ハ',
  ﾋ: 'ヒ',
  ﾌ: 'フ',
  ﾍ: 'ヘ',
  ﾎ: 'ホ',
  ﾏ: 'マ',
  ﾐ: 'ミ',
  ﾑ: 'ム',
  ﾒ: 'メ',
  ﾓ: 'モ',
  ﾔ: 'ヤ',
  ﾕ: 'ユ',
  ﾖ: 'ヨ',
  ﾗ: 'ラ',
  ﾘ: 'リ',
  ﾙ: 'ル',
  ﾚ: 'レ',
  ﾛ: 'ロ',
  ﾜ: 'ワ',
  ｦ: 'ヲ',
  ﾝ: 'ン',
  ｧ: 'ァ',
  ｨ: 'ィ',
  ｩ: 'ゥ',
  ｪ: 'ェ',
  ｫ: 'ォ',
  ｯ: 'ッ',
  ｬ: 'ャ',
  ｭ: 'ュ',
  ｮ: 'ョ',
  ｰ: 'ー',
} as Record<string, string>;

function toZenkakuKana(str: string): string {
  return Array.from(str).reduce((zenkaku, char) => {
    return zenkaku + (kanaMap[char] ?? char);
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
    return toZenkakuKana(rawdata);
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