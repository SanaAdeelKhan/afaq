const BASE_URL = "https://apis.quran.foundation/auth/v1";

function getToken() {
  return localStorage.getItem("afaq_access_token");
}

function getClientId() {
  return import.meta.env.VITE_CLIENT_ID;
}

function headers() {
  return {
    "Content-Type": "application/json",
    "x-auth-token": getToken(),
    "x-client-id": getClientId(),
  };
}

export async function fetchBookmarks() {
  const res = await fetch(`${BASE_URL}/bookmarks`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  return res.json();
}

export async function addBookmark(verseKey) {
  const res = await fetch(`${BASE_URL}/bookmarks`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ verse_key: verseKey }),
  });
  if (!res.ok) throw new Error("Failed to add bookmark");
  return res.json();
}

export async function fetchStreak() {
  const res = await fetch(`${BASE_URL}/streak`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch streak");
  return res.json();
}

export async function saveReflection(verseKey, text) {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ verse_key: verseKey, note: text }),
  });
  if (!res.ok) throw new Error("Failed to save reflection");
  return res.json();
}

export async function fetchCollections() {
  const res = await fetch(`${BASE_URL}/collections`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch collections");
  return res.json();
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("afaq_access_token");
  localStorage.removeItem("afaq_refresh_token");
  window.location.href = "/";
}
