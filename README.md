# Nuxt country guesser

made by using default nuxt ecosystem libraries and https://restcountries.com/ API

## Setup

Make sure to install dependencies:

```bash
git clone https://github.com/Khikmata/countryguesser countryguesser
cd countryguesser
npm install
```

## Run locally

Start the development server on `http://localhost:3000` by running:

```bash
npm run dev
```

#### IF YOU ARE HAVING PROBLEMS WITH COUNTRY FETCHING, CHANGE countriesUseRemote from true to false:

```ts
  // nuxt.config.ts

  runtimeConfig: {
    countriesUseRemote: false,
  },
```

## Production

Production is on a vercel hosting on a link below
<a>
https://countryguesser-olive.vercel.app/
</a>
