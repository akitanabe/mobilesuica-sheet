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

type MobileSuicaSessionAuth = {
  cookies: Cookies;
  user: { email: string; password: string };
};

type UserInputBody = {
  email: string;
  password: string;
  captcha: string;
};

type SuicaDataPostParams =
  | {
      baseVariable: string;
      specifyYearMonth: string;
      specifyDay: string;
      SEARCH: '検索';
    }
  | {};

type SDdate = string;
type SDtypeIn = string;
type SDlocationIn = string;
type SDtypeOut = string;
type SDlocationOut = string;
type SDbalance = number;
type SDprice = number;

type SuicaData = [
  SDdate,
  SDtypeIn,
  SDlocationIn,
  SDtypeOut,
  SDlocationOut,
  SDbalance,
  SDprice
];

export {
  MobileSuicaLoginParams,
  MobileSuicaSessionLogin,
  MobileSuicaSessionAuth,
  UserInputBody,
  SuicaDataPostParams,
  SuicaData,
};
