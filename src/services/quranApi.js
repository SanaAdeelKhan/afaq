const BASE_URL = "https://api.quran.com/api/v4";
const AUDIO_BASE = "https://verses.quran.com";

const RECITATION_ID = 7; // Mishary Rashid Al-Afasy
const TRANSLATION_ID = 131; // Dr. Mustafa Khattab
const TAFSIR_ID = 169; // Tafsir Ibn Kathir English

export async function fetchVerse(verseKey) {
  const url = `${BASE_URL}/verses/by_key/${verseKey}?words=true&translations=${TRANSLATION_ID}&audio=${RECITATION_ID}&tafsirs=${TAFSIR_ID}&fields=text_uthmani`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch verse ${verseKey}`);
  return res.json();
}

export async function fetchAudio(verseKey) {
  const url = `${BASE_URL}/recitations/${RECITATION_ID}/by_ayah/${verseKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch audio for ${verseKey}`);
  const data = await res.json();
  const audioFile = data?.audio_files?.[0]?.url;
  if (!audioFile) return null;
  return audioFile.startsWith("http") ? audioFile : `${AUDIO_BASE}/${audioFile}`;
}

export async function fetchTafsir(verseKey) {
  const url = `${BASE_URL}/tafsirs/${TAFSIR_ID}/by_ayah/${verseKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch tafsir for ${verseKey}`);
  return res.json();
}
