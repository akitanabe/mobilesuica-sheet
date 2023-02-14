import { Ref } from 'vue';
import { SuicaData } from '~~/server/api/types';

const loginType: Ref<'MobileSuica' | 'MyJR-EAST'> = ref('MobileSuica');
const password = ref('');
const email = ref('');

const captcha = ref('');
const captchaImage = ref('');

const setCaptchaImage = () => {
  $fetch('/api/captcha').then((base64) => {
    captchaImage.value = `data:image/gif;base64,${base64}`;
  });
};

type Result = { ok: boolean; data: SuicaData[] };

const login = async () => {
  const user = {
    email: email.value,
    password: password.value,
    captcha: captcha.value,
  };

  const res = await $fetch<Result>('/api/login', {
    method: 'POST',
    body: user,
  });

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
    setCaptchaImage,
    login,
  };
};
