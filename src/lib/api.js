const configuredApiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

function isLocalNetworkHost(hostname) {
  return hostname === "localhost"
    || hostname === "127.0.0.1"
    || /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
}

export function getApiBaseUrl() {
  if (typeof window !== "undefined" && isLocalNetworkHost(window.location.hostname)) {
    return `http://${window.location.hostname}:5000`;
  }
  return configuredApiBaseUrl;
}

export const API_BASE_URL = configuredApiBaseUrl;

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function requestJson(path, options = {}) {
  let response;

  try {
    response = await fetch(apiUrl(path), {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection and try again.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    if (response.ok) {
      throw new ApiError("The server returned an invalid response. Please try again.", response.status);
    }
  }

  if (!response.ok) {
    const fallbackMessage = response.status >= 500
      ? "The server could not complete the request. Please try again later."
      : "The request could not be completed. Please check your details.";
    throw new ApiError(data?.msg || fallbackMessage, response.status);
  }

  return data;
}

export function getJson(path) {
  return requestJson(path);
}

export function postJson(path, body) {
  return requestJson(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteJson(path) {
  return requestJson(path, { method: "DELETE" });
}

export function patchJson(path, body = {}) {
  return requestJson(path, { method: "PATCH", body: JSON.stringify(body) });
}
