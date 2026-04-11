// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: ["@nuxt/ui", "@nuxt/fonts", "@vueuse/nuxt", "@nuxt/a11y", "@nuxt/eslint"],
  colorMode: {
    preference: "system",
  },
  fonts: {
    defaults: {
      weights: [500, 600, 700, 800],
      styles: ["normal"],
      subsets: ["latin"],
    },
  },
  hooks: {
    "build:manifest": (manifest) => {
      // find the app entry, css list
      const css = manifest["node_modules/nuxt/dist/app/entry.js"]?.css;
      if (css) {
        // start from the end of the array and go to the beginning
        for (let i = css.length - 1; i >= 0; i--) {
          // if it starts with 'entry', remove it from the list
          if (css?.[i]?.startsWith("entry")) css.splice(i, 1);
        }
      }
    },
  },
  app: {
    head: {
      title: "Countryguesser",
      htmlAttrs: { lang: "en" },
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        {
          name: "description",
          content:
            "Guess countries from flags — a fast, free geography quiz with One life and Marathon modes, capitals bonus, and local leaderboards.",
        },
        { name: "theme-color", content: "#f0f9ff" },
      ],
    },
  },
  css: ["~/assets/css/main.css"],
  // Server-only: set NUXT_COUNTRIES_USE_REMOTE=false if restcountries.com is unreachable (VPN/firewall).
  runtimeConfig: {
    countriesUseRemote: true,
  },
});
