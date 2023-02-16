import { SuicaData } from '~~/server/api/types';

type SheetsData = { [key: string]: SuicaData[] };

const sheetsdata = ref<SheetsData>({ '': [] });

const months = computed(() => Object.keys(sheetsdata.value));

const selected = ref('');

const cols = [
  '月日',
  '種別',
  '利用場所',
  '種別',
  '利用場所',
  '残高',
  '入金・利用額',
];

function toSheetsData(suicadata: SuicaData[]): SheetsData {
  return suicadata.reduce<SheetsData>((dispdata, data) => {
    const [Y, m] = data[0].split('-');
    const key = `${Y}-${m}`;

    if (dispdata[key] === undefined) {
      dispdata[key] = [];
    }

    dispdata[key].push(data);

    return dispdata;
  }, {});
}

async function setSheetsData() {
  const { data: res } = await useFetch('/api/data');

  if (res.value?.ok && res.value.data) {
    sheetsdata.value = toSheetsData(res.value.data);
  } else {
    navigateTo('/');
  }
}

export const useSheet = () => {
  return { sheetsdata, months, selected, setSheetsData, cols };
};
