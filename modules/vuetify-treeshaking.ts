import { defineNuxtModule } from '@nuxt/kit';
import vuetify from 'vite-plugin-vuetify';

export default defineNuxtModule({
  meta: {
    name: '@nuxtjs/vuetify-treeshaking',
    configKey: 'vuetify-treeshaking',
    compatibility: { nuxt: '^3.0.0' },
  },
  setup(_moduleOptions, nuxt) {
    nuxt.hooks.hook('vite:extendConfig', (config) => {
      config.plugins?.push(vuetify());
    });
  },
});
