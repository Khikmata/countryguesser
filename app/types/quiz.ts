export interface Country {
  id: string;
  name: string;
  capital: string;
  continent: string;
  region: string;
  subregion: string | null;
  flagPng: string;
  flagSvg: string;
  population: number;
  area: number;
  languages: string[];
  currencies: string[];
  code?: string;
  currency?: string;
  currencyCode?: string; // e.g., "USD"
  lat?: number;
  lng?: number;
  timezone?: string; // e.g., "UTC+1"
}
