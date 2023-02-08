import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit';
import vitePluginVuetify from 'vite-plugin-vuetify';

export default defineNuxtModule({
  meta: {
    name: '@nuxtjs/vuetify',
    configKey: 'vuetify',
    compatibility: { nuxt: '^3.0.0' },
  },
  setup(_moduleOptions, nuxt) {
    const resolver = createResolver(import.meta.url);

    nuxt.options.build.transpile.push('vuetify');

    nuxt.options.css.push(
      'vuetify/lib/styles/main.sass',
      '@mdi/font/css/materialdesignicons.css'
    );

    addPlugin(resolver.resolve('./runtime/plugin'));

    nuxt.hooks.hook('vite:extendConfig', (config) => {
      config.plugins?.push(vitePluginVuetify());
    });
  },
});
