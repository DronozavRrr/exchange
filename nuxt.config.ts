// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
        JWT_TOKEN_COOKIE_NAME: process.env.JWT_TOKEN_COOKIE_NAME,
        JWT_REFRESH_TOKEN_NAME: process.env.JWT_REFRESH_TOKEN_NAME,
    }
  },
  modules: ['@pinia/nuxt'],
});
