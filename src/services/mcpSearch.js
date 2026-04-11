const SEARCH_URL = "https://api.quran.com/api/v4/search";
const VERSE_URL  = "https://api.quran.com/api/v4/verses/by_key";

export async function semanticSearch(query) {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&size=6&language=en`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();

  const results = data?.search?.results || [];
  if (!results.length) return null;

  return results.map(r => ({
    verseKey:    r.verse_key,
    arabic:      r.text,
    translation: r.translations?.[0]?.text?.replace(/<[^>]+>/g, "") || "",
    surahName:   r.verse_key?.split(":")?.[0],
  }));
}

export async function fetchVerseDetail(verseKey) {
  const url = `${VERSE_URL}/${verseKey}?translations=131&fields=text_uthmani`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Verse fetch failed");
  return res.json();
}
