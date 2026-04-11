# Nuxt country guesser

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
git clone https://github.com/Khikmata/countryguesser countryguesser
npm install
```

## Run locally

Start the development server on `http://localhost:3000` by running:

```bash
npm run dev
```

#### IF YOU ARE HAVING PROBLEMS WITH COUNTRY FETCHING, CHANGE THE RUNTIME CONFIG IN:

```ts
// nuxt.config.ts

  runtimeConfig: {
    countriesUseRemote: true,
  },
```

## Production

Production is on a vercel hosting on a link below
<a>
https://countryguesser-olive.vercel.app/
</a>
