"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  PUZZLE_STATS_EVENT,
  PUZZLE_STATS_KEY,
  readPuzzleStats,
} from "@/lib/puzzleStats";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(PUZZLE_STATS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PUZZLE_STATS_EVENT, callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(PUZZLE_STATS_KEY);
}

function getServerSnapshot() {
  return null;
}

export function usePuzzleStats() {
  const serializedStats = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => readPuzzleStats(serializedStats), [serializedStats]);
}
