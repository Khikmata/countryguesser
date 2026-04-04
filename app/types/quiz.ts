export interface Country {
  id: string
  name: string
  capital: string
  continent: string
  region: string
  subregion: string | null
  flagPng: string
  flagSvg: string
  population: number
  area: number
  languages: string[]
  currencies: string[]
}
