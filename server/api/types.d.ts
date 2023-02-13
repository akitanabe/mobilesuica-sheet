import type { Cookies } from '@/server/utils/mobilesuica-client';

type MobileSuicaLoginParams = {
  __EVENTTARGET: string;
  __EVENTARGUMENT: string;
  __VIEWSTATE: string;
  __VIEWSTATEGENERATOR: string;
  __VIEWSTATEENCRYPTED: string;
  baseVariable: string;
  baseVarLogoutBtn: string;
  MailAddress: string;
  Password: string;
  WebCaptcha1_clientState: string;
  WebCaptcha1__editor_clientState: string;
  WebCaptcha1__editor: string;
  LOGIN: string;
};

type MobileSuicaSessionLogin = {
  cookies: Cookies;
  params: MobileSuicaLoginParams;
  url: string;
};

export { MobileSuicaLoginParams, MobileSuicaSessionLogin };
