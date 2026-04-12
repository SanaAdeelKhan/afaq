const PROXY = 'http://localhost:3001';

export async function mcpSearch(query) {
  const res = await fetch(`${PROXY}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function mcpTafsir(verseKey, edition = 'en-ibn-kathir') {
  const res = await fetch(`${PROXY}/api/tafsir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verseKey, edition })
  });
  if (!res.ok) throw new Error('Tafsir failed');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text || '';
}

export async function mcpTranslation(verseKey) {
  const res = await fetch(`${PROXY}/api/translation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verseKey })
  });
  if (!res.ok) throw new Error('Translation failed');
  const data = await res.json();
  return data.text || '';
}

export async function mcpMorphology(verseKey) {
  const res = await fetch(`${PROXY}/api/morphology`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verseKey })
  });
  if (!res.ok) throw new Error('Morphology failed');
  const data = await res.json();
  return data.text || '';
}
