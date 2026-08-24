"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getAuthSnapshot,
  getServerAuthSnapshot,
  loadAuthSession,
  subscribeAuth,
} from "@/lib/authStore";

export function useAuth() {
  const auth = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  useEffect(() => { loadAuthSession(); }, []);
  return auth;
}
