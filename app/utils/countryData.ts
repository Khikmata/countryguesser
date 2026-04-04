import type { Country } from "~/types/quiz";

interface RestCountry {
  name?: { common?: string };
  capital?: string[];
  flags?: { png?: string; svg?: string };
  cca2?: string;
}

export function mapRestCountry(raw: RestCountry): Country | null {
  const name = raw.name?.common;
  const id = raw.cca2;
  const cap = raw.capital?.[0];
  const png = raw.flags?.png;
  if (!name || !id || !cap || !png) return null;

  return {
    id,
    name,
    capital: cap,
    continent: "",
    region: "",
    subregion: null,
    flagPng: png,
    flagSvg: raw.flags?.svg ?? png,
    population: 0,
    area: 0,
    languages: [],
    currencies: [],
  };
}
