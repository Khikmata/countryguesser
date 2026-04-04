export type GameModeId = 'one-life' | 'marathon'

export type MarathonMissKind = 'wrong' | 'skipped'

export interface DeckCompleteOneLife {
  mode: 'one-life'
  score: number
  rank: number
  total: number
  message: string
}

export interface DeckCompleteMarathon {
  mode: 'marathon'
  score: number
  accuracyPct: number
  bestStreakThisRun: number
  missed: { name: string; kind: MarathonMissKind }[]
}

export type DeckCompleteSnapshot = DeckCompleteOneLife | DeckCompleteMarathon
