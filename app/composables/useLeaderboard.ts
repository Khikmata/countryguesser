import type { GameModeId } from "~/types/game";

export interface LeaderboardEntry {
  id: string;
  score: number;
  at: number;
}

const LS_BY_MODE: Record<GameModeId, string> = {
  "one-life": "gf-leaderboard-one-life-v1",
  marathon: "gf-leaderboard-marathon-v1",
};

const MAX_ENTRIES = 20;

function loadRaw(mode: GameModeId): LeaderboardEntry[] {
  if (!import.meta.client) return [];
  try {
    const raw = localStorage.getItem(LS_BY_MODE[mode]);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is LeaderboardEntry =>
        e &&
        typeof e === "object" &&
        typeof (e as LeaderboardEntry).id === "string" &&
        typeof (e as LeaderboardEntry).score === "number" &&
        typeof (e as LeaderboardEntry).at === "number",
    );
  } catch {
    return [];
  }
}

function save(mode: GameModeId, entries: LeaderboardEntry[]) {
  if (!import.meta.client) return;
  localStorage.setItem(LS_BY_MODE[mode], JSON.stringify(entries));
}

export function useLeaderboard() {
  function getEntries(mode: GameModeId): LeaderboardEntry[] {
    return loadRaw(mode)
      .sort((a, b) => b.score - a.score || b.at - a.at)
      .slice(0, MAX_ENTRIES);
  }

  /** Record a score and return 1-based rank among entries for this mode (after insert). */
  function recordScore(
    score: number,
    mode: GameModeId,
  ): { rank: number; total: number } {
    if (!import.meta.client) return { rank: 1, total: 1 };
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `e-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const next = [...loadRaw(mode), { id, score, at: Date.now() }]
      .sort((a, b) => b.score - a.score || b.at - a.at)
      .slice(0, MAX_ENTRIES);
    save(mode, next);
    const rank = next.findIndex((e) => e.id === id) + 1;
    return { rank, total: next.length };
  }

  /** Marathon board: only add a row when this beats the current #1 score (keeps list from spamming). */
  function tryRecordMarathonBest(
    score: number,
  ): { rank: number; total: number } | null {
    if (!import.meta.client) return null;
    const entries = loadRaw("marathon");
    const topScore = entries.length
      ? Math.max(...entries.map((e) => e.score))
      : 0;
    if (score <= topScore) return null;
    return recordScore(score, "marathon");
  }

  function getTop(mode: GameModeId, limit = 50): LeaderboardEntry[] {
    return getEntries(mode).slice(0, limit);
  }

  function rankForScore(
    score: number,
    mode: GameModeId,
  ): { rank: number; total: number } {
    const entries = getEntries(mode);
    const better = entries.filter((e) => e.score > score).length;
    return { rank: better + 1, total: entries.length };
  }

  return {
    getEntries,
    getTop,
    recordScore,
    tryRecordMarathonBest,
    rankForScore,
  };
}
