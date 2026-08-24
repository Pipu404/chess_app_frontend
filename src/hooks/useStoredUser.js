"use client";

import { useMemo, useSyncExternalStore } from "react";

function subscribeToStorage(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getUserSnapshot() {
  return localStorage.getItem("user");
}

function getServerSnapshot() {
  return null;
}

export function useStoredUser() {
  const serializedUser = useSyncExternalStore(
    subscribeToStorage,
    getUserSnapshot,
    getServerSnapshot,
  );

  return useMemo(() => {
    if (!serializedUser) return null;

    try {
      return JSON.parse(serializedUser);
    } catch {
      return null;
    }
  }, [serializedUser]);
}
