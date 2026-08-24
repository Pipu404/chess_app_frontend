export const PUZZLE_STATS_KEY = "chess-puzzle-stats";
export const PUZZLE_STATS_EVENT = "chess-puzzle-stats-change";

export const EMPTY_PUZZLE_STATS = {
  attempts: 0,
  solved: 0,
  currentStreak: 0,
  bestStreak: 0,
  completedPuzzleIds: [],
};

export function readPuzzleStats(serializedStats) {
  if (!serializedStats) return EMPTY_PUZZLE_STATS;

  try {
    const stats = JSON.parse(serializedStats);
    return {
      attempts: Number.isInteger(stats.attempts) ? stats.attempts : 0,
      solved: Number.isInteger(stats.solved) ? stats.solved : 0,
      currentStreak: Number.isInteger(stats.currentStreak) ? stats.currentStreak : 0,
      bestStreak: Number.isInteger(stats.bestStreak) ? stats.bestStreak : 0,
      completedPuzzleIds: Array.isArray(stats.completedPuzzleIds) ? stats.completedPuzzleIds : [],
    };
  } catch {
    return EMPTY_PUZZLE_STATS;
  }
}

export function recordPuzzleAttempt(puzzleId, solved) {
  const current = readPuzzleStats(localStorage.getItem(PUZZLE_STATS_KEY));
  const nextStreak = solved ? current.currentStreak + 1 : 0;
  const next = {
    attempts: current.attempts + 1,
    solved: current.solved + (solved ? 1 : 0),
    currentStreak: nextStreak,
    bestStreak: Math.max(current.bestStreak, nextStreak),
    completedPuzzleIds: solved
      ? [...new Set([...current.completedPuzzleIds, puzzleId])]
      : current.completedPuzzleIds,
  };

  localStorage.setItem(PUZZLE_STATS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PUZZLE_STATS_EVENT));
  return next;
}
