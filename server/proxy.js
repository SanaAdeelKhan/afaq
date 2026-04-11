import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const MCP = 'https://mcp.quran.ai';

function parseSSE(text) {
  for (const line of text.split('\n')) {
    if (line.startsWith('data:')) {
      try { return JSON.parse(line.slice(5).trim()); } catch {}
    }
  }
  try { return JSON.parse(text); } catch {}
  return null;
}

async function getSession() {
  const r1 = await fetch(MCP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'afaq', version: '1.0.0' } }
    })
  });
  const sid = r1.headers.get('mcp-session-id');
  await r1.text();
  if (!sid) throw new Error('No session ID');
  await fetch(MCP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream', 'mcp-session-id': sid },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} })
  });
  return sid;
}

async function tool(sid, name, args) {
  const r = await fetch(MCP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream', 'mcp-session-id': sid },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name, arguments: args } })
  });
  const text = await r.text();
  const json = parseSSE(text);
  if (json?.error) throw new Error(json.error.message);
  if (json?.result?.isError) throw new Error(json.result.content?.[0]?.text || 'Tool error');
  return json?.result?.content?.[0]?.text || '';
}

// Clean tafsir response
function cleanTafsir(raw) {
  try {
    const p = JSON.parse(raw);
    const results = p?.results;
    if (!results) return stripHtml(raw);
    const edition = Object.keys(results)[0];
    const entries = results[edition];
    if (!Array.isArray(entries)) return stripHtml(raw);
    return entries.map(e => stripHtml(e.text || '')).join('\n\n').slice(0, 800);
  } catch {
    return stripHtml(raw).slice(0, 800);
  }
}

// Parse search results into structured array
function parseSearch(raw) {
  try {
    const p = JSON.parse(raw);
    const results = p?.results || [];
    return results.map(r => ({
      verseKey: r.ayah_key,
      surah: r.surah,
      ayah: r.ayah,
      arabic: r.text,
      translation: r.translations?.[0]?.text || '',
      edition: r.translations?.[0]?.edition?.author || ''
    }));
  } catch {
    return [];
  }
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// ── ROUTES ──

app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'No query' });
  try {
    const sid = await getSession();
    const raw = await tool(sid, 'search_quran', { query, translations: 'en-abdel-haleem' });
    const results = parseSearch(raw);
    res.json({ results, query });
  } catch (err) {
    console.error('search:', err.message);
    res.status(502).json({ error: err.message });
  }
});

app.post('/api/tafsir', async (req, res) => {
  const { verseKey, edition } = req.body;
  if (!verseKey) return res.status(400).json({ error: 'No verseKey' });
  try {
    const sid = await getSession();
    const raw = await tool(sid, 'fetch_tafsir', { ayahs: verseKey, editions: edition || 'en-ibn-kathir' });
    res.json({ text: cleanTafsir(raw) });
  } catch (err) {
    console.error('tafsir:', err.message);
    res.status(502).json({ error: err.message });
  }
});

app.post('/api/translation', async (req, res) => {
  const { verseKey } = req.body;
  if (!verseKey) return res.status(400).json({ error: 'No verseKey' });
  try {
    const sid = await getSession();
    const raw = await tool(sid, 'fetch_translation', { ayahs: verseKey, editions: 'en-abdel-haleem' });
    res.json({ text: cleanTafsir(raw) });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.post('/api/morphology', async (req, res) => {
  const { verseKey } = req.body;
  if (!verseKey) return res.status(400).json({ error: 'No verseKey' });
  try {
    const sid = await getSession();
    const raw = await tool(sid, 'fetch_word_morphology', { ayah_key: verseKey });
    res.json({ text: cleanTafsir(raw) });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/tools', async (req, res) => {
  try {
    const sid = await getSession();
    const r = await fetch(MCP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream', 'mcp-session-id': sid },
      body: JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/list', params: {} })
    });
    const text = await r.text();
    const json = parseSSE(text);
    res.json({ tools: json?.result?.tools?.map(t => t.name) || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('🕌 Afaq MCP proxy at http://localhost:3001'));
