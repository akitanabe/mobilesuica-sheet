// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
    },
  ],
  modules: ['~/modules/vuetify/module', 'h3-session/nuxt'],
  session: {
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  },
  typescript: { shim: false, typeCheck: true },
});
