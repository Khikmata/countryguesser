import type { H3Event } from "#imports";

const REMOTE =
  "https://restcountries.com/v3.1/all?fields=name,flags,capital,currencies";

export const getCountries = defineCachedFunction(async (_event: H3Event) => {
  console.log("[api/countries] Fetching remote countries...");
  const data = await $fetch<unknown[]>(REMOTE, {});
  console.log("[api/countries] Fetched remote data", data.length, "countries");
  return data;
});
