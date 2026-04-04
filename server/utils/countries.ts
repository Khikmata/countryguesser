import type { H3Event } from "#imports";

export const getCountries = defineCachedFunction(async (_event: H3Event) => {
    console.log('[api/countries] Fetching remote countries...')
    const data = await $fetch<unknown[]>('https://restcountries.com/v3.1/all?fields=name,flags,capital,currencies', {})
      console.log('[api/countries] Fetched remote data', data.length, 'countries')
    return data;
})