// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: ["@nuxt/ui", "@nuxt/image", "@vueuse/nuxt", "@nuxt/a11y", "@nuxt/eslint"],
  colorMode: {
    preference: "system",
  },
  app: {
    head: {
      title: "Countryguesser",
      htmlAttrs: { lang: "en" },
      link: [
        { rel: "preconnect", href: "https://fonts.bunny.net" },
        {
          rel: "stylesheet",
          href: "https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap",
        },
      ],
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
  image: {
    // domains: ['flagcdn.com', 'upload.wikimedia.org'],
    provider: "none",
  },
  // Server-only: set NUXT_COUNTRIES_USE_REMOTE=false if restcountries.com is unreachable (VPN/firewall).
  runtimeConfig: {
    countriesUseRemote: false,
  },
});
