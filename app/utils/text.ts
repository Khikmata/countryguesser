export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface MatchSegment {
  text: string
  highlight: boolean
}

/** Case-insensitive substring highlight */
export function segmentsSimple(text: string, query: string): MatchSegment[] {
  const q = query.trim()
  if (!q) return [{ text, highlight: false }]
  const lower = text.toLocaleLowerCase()
  const lq = q.toLocaleLowerCase()
  const idx = lower.indexOf(lq)
  if (idx < 0) return [{ text, highlight: false }]
  const parts: MatchSegment[] = []
  if (idx > 0) parts.push({ text: text.slice(0, idx), highlight: false })
  parts.push({ text: text.slice(idx, idx + q.length), highlight: true })
  if (idx + q.length < text.length) {
    parts.push({ text: text.slice(idx + q.length), highlight: false })
  }
  return parts
}

/** Reveal leading letters; spaces stay visible; rest become middle dots (hint UI). */
export function maskCountryNameHint(name: string, hintLevel: 1 | 2): string {
  const chars = [...name]
  const nonSpace = chars.filter((c) => c !== ' ').length
  const fraction = hintLevel === 1 ? 0.22 : 0.52
  const target = Math.max(hintLevel, Math.ceil(nonSpace * fraction))
  let shown = 0
  return chars
    .map((ch) => {
      if (ch === ' ') return ' '
      if (shown < target) {
        shown++
        return ch
      }
      return '·'
    })
    .join('')
}
