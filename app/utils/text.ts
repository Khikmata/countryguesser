export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface MatchSegment {
  text: string;
  highlight: boolean;
}

/** Case-insensitive substring highlight */
export function segmentsSimple(text: string, query: string): MatchSegment[] {
  const q = query.trim();
  if (!q) return [{ text, highlight: false }];
  const lower = text.toLocaleLowerCase();
  const lq = q.toLocaleLowerCase();
  const idx = lower.indexOf(lq);
  if (idx < 0) return [{ text, highlight: false }];
  const parts: MatchSegment[] = [];
  if (idx > 0) parts.push({ text: text.slice(0, idx), highlight: false });
  parts.push({ text: text.slice(idx, idx + q.length), highlight: true });
  if (idx + q.length < text.length) {
    parts.push({ text: text.slice(idx + q.length), highlight: false });
  }
  return parts;
}

/** First hint: no letters — only structure (words + letter count). */
export function letterCountHint(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "0 letters";
  const words = trimmed.split(/\s+/).filter(Boolean);
  const letters = [...text].filter((c) => c !== " ").length;
  if (words.length > 1) {
    return `${words.length} words · ${letters} letters`;
  }
  return `${letters} letter${letters === 1 ? "" : "s"}`;
}

/**
 * Second hint: show only some leading letters; spaces preserved; rest as middle dots.
 * (Weaker than the old two-step letter reveal.)
 */
export function maskPartialReveal(text: string, fraction = 0.34): string {
  const chars = [...text];
  const nonSpace = chars.filter((c) => c !== " ").length;
  const target = Math.max(2, Math.ceil(nonSpace * fraction));
  let shown = 0;
  return chars
    .map((ch) => {
      if (ch === " ") return " ";
      if (shown < target) {
        shown++;
        return ch;
      }
      return "·";
    })
    .join("");
}
