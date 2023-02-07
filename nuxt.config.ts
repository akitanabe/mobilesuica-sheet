import vuetifyTreeshaking from './modules/vuetify-treeshaking';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
    },
  ],
  modules: [vuetifyTreeshaking],
  typescript: { shim: false, typeCheck: true },
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.css',
  ],
  build: { transpile: ['vuetify'] },
});
