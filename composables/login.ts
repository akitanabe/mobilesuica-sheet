import { Ref } from 'vue';

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

const login = async () => {
  const user = {
    email: email.value,
    password: password.value,
    captcha: captcha.value,
  };

  $fetch('/api/login', { method: 'POST', body: user });
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
