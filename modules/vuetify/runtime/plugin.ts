import { createVuetify } from 'vuetify';
import { defineNuxtPlugin } from '#app';

const vuetify = createVuetify({
  ssr: true,
});

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(vuetify);

  return { provide: { vuetify } };
});
