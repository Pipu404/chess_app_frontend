import { getJson, postJson } from "@/lib/api";

const listeners = new Set();
const serverSnapshot = { status: "loading", user: null };
let snapshot = serverSnapshot;
let requestPromise = null;
let authVersion = 0;

function emit(nextSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

export function subscribeAuth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthSnapshot() {
  return snapshot;
}

export function getServerAuthSnapshot() {
  return serverSnapshot;
}

export function loadAuthSession() {
  if (requestPromise) return requestPromise;
  const requestVersion = authVersion;
  requestPromise = getJson("/api/auth/me")
    .then((data) => {
      if (requestVersion === authVersion) emit({ status: "authenticated", user: data.user });
    })
    .catch(() => {
      if (requestVersion === authVersion) emit({ status: "anonymous", user: null });
    })
    .finally(() => { requestPromise = null; });
  return requestPromise;
}

export function setAuthenticatedUser(user) {
  authVersion += 1;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  emit({ status: "authenticated", user });
}

export async function logoutSession() {
  authVersion += 1;
  try {
    await postJson("/api/auth/logout", {});
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    emit({ status: "anonymous", user: null });
  }
}
