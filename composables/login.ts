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

export const useLogin = () => {
  return { loginType, email, password, captcha, captchaImage, setCaptchaImage };
};
