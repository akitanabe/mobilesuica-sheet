import { Ref } from 'vue';
import { ResultSuccess } from '@/server/api/types';

const loginType: Ref<'MobileSuica' | 'MyJR-EAST'> = ref('MobileSuica');
const password = ref('');
const email = ref('');

const captcha = ref('');
const captchaImage = ref('');

const loading = ref(false);

const setCaptchaImage = async () => {
  if (loading.value) {
    return;
  }

  if (captchaImage.value !== '') {
    URL.revokeObjectURL(captchaImage.value);
  }

  captchaImage.value = '';
  loading.value = true;

  const image = await $fetch<Blob>('/api/captcha', { responseType: 'blob' });
  captchaImage.value = URL.createObjectURL(image);

  loading.value = false;
};

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

  const res = await $fetch<ResultSuccess>('/api/login', {
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
