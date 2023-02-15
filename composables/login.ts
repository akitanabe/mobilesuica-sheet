import { Ref } from 'vue';
import { SuicaData } from '~~/server/api/types';

const loginType: Ref<'MobileSuica' | 'MyJR-EAST'> = ref('MobileSuica');
const password = ref('');
const email = ref('');

const captcha = ref('');
const captchaImage = ref('');

const loading = ref(false);

const setCaptchaImage = () => {
  if (loading.value) {
    return;
  }

  captchaImage.value = '';
  loading.value = true;

  $fetch('/api/captcha').then((base64) => {
    captchaImage.value = `data:image/gif;base64,${base64}`;
    loading.value = false;
  });
};

type Result = { ok: boolean; data: SuicaData[] };

const login = async () => {
  if (loading.value) {
    return;
  }

  loading.value = true;
  const user = {
    email: email.value,
    password: password.value,
    captcha: captcha.value,
  };

  const res = await $fetch<Result>('/api/login', {
    method: 'POST',
    body: user,
  });

  loading.value = false;

  if (res.ok) {
    navigateTo('/sheet');
  }
};

export const useLogin = () => {
  return {
    loginType,
    email,
    password,
    captcha,
    captchaImage,
    loading,
    setCaptchaImage,
    login,
  };
};
