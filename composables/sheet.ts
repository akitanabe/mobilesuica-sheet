import { SuicaData } from '~~/server/api/types';

const debounce = <T extends (...args: any[]) => unknown>(
  callback: T,
  delay = 250
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    // eslint-disable-next-line n/no-callback-literal
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};

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

const filterWords = ref<string[]>([]);

const filterRegexp = computed(
  () => new RegExp(filterWords.value.filter((word) => word !== '').join('|'))
);

const addFilterWords = () => {
  filterWords.value.push('');
};

const setFilterWords = debounce((word: string, i: number) => {
  const _filterWords = [...filterWords.value];
  _filterWords[i] = word;

  filterWords.value = _filterWords;
}, 500);

const removeFilterWords = (i: number) => {
  filterWords.value.splice(i, 1);
};

const displaydata = computed<SuicaData[]>(() => {
  const suicadata = sheetsdata.value[selected.value] ?? [];

  if (
    filterWords.value.length === 0 ||
    filterWords.value.every((words) => words === '')
  ) {
    return suicadata;
  }

  return suicadata.filter((suicadata) => {
    return !suicadata.some((words) =>
      filterRegexp.value.test(`${words}`.normalize('NFKC'))
    );
  });
});

function toSheetsData(suicadata: SuicaData[]): SheetsData {
  return suicadata.reduce<SheetsData>((dispdata, data) => {
    const [Y, m] = data[0].split('-');
    const key = `${Y}-${m}`;

    if (dispdata[key] === undefined) {
      dispdata[key] = [];
    }

    dispdata[key].push([...data]);

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
  return {
    displaydata,
    months,
    selected,
    setSheetsData,
    cols,
    filterWords,
    addFilterWords,
    removeFilterWords,
    setFilterWords,
  };
};
