import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sanaadeelkhan.github.io',
    /\.onrender\.com$/
  ],
  credentials: true
}));

app.use(express.json());

const MCP = 'https://mcp.quran.ai';
const PORT = process.env.PORT || 3001;

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

function stripHtml(html) { return (html||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }

function cleanTafsir(raw) {
  try {
    const p = JSON.parse(raw);
    const results = p?.results;
    if (!results) return stripHtml(raw);
    const edition = Object.keys(results)[0];
    const entries = results[edition];
    if (!Array.isArray(entries)) return stripHtml(raw);
    return entries.map(e => stripHtml(e.text||'')).join('\n\n').slice(0,800);
  } catch { return stripHtml(raw).slice(0,800); }
}

function parseSearch(raw) {
  try {
    const p = JSON.parse(raw);
    return (p?.results||[]).map(r => ({
      verseKey:r.ayah_key, surah:r.surah, ayah:r.ayah,
      arabic:r.text, translation:r.translations?.[0]?.text||'',
      edition:r.translations?.[0]?.edition?.author||''
    }));
  } catch { return []; }
}

async function groq(system, messages, maxTokens = 1500) {
  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) throw new Error('GROQ_API_KEY not set');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${KEY}` },
    body: JSON.stringify({
      model:'llama-3.3-70b-versatile',
      max_tokens: maxTokens,
      temperature: 0.7,
      messages:[{ role:'system', content:system }, ...messages]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || '';
}

// ── ROUTES ──

app.get('/health', (_, res) => res.json({ status:'ok', time: new Date().toISOString() }));

app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error:'No query' });
  try {
    const sid = await getSession();
    const raw = await tool(sid, 'search_quran', { query, translations:'en-abdel-haleem' });
    res.json({ results: parseSearch(raw), query });
  } catch(err) { res.status(502).json({ error:err.message }); }
});

app.post('/api/tafsir', async (req, res) => {
  const { verseKey, edition } = req.body;
  if (!verseKey) return res.status(400).json({ error:'No verseKey' });
  try {
    const sid = await getSession();
    const raw = await tool(sid, 'fetch_tafsir', { ayahs:verseKey, editions:edition||'en-ibn-kathir' });
    res.json({ text: cleanTafsir(raw) });
  } catch(err) { res.status(502).json({ error:err.message }); }
});

app.post('/api/translation', async (req, res) => {
  const { verseKey } = req.body;
  if (!verseKey) return res.status(400).json({ error:'No verseKey' });
  try {
    const sid = await getSession();
    const raw = await tool(sid, 'fetch_translation', { ayahs:verseKey, editions:'en-abdel-haleem' });
    res.json({ text: cleanTafsir(raw) });
  } catch(err) { res.status(502).json({ error:err.message }); }
});

app.post('/api/verse', async (req, res) => {
  const { verseKey } = req.body;
  if (!verseKey) return res.status(400).json({ error:'No verseKey' });
  try {
    const sid = await getSession();
    const raw = await tool(sid, 'fetch_quran', { ayahs:verseKey, editions:'ar-simple-clean' });
    res.json({ text: raw });
  } catch(err) { res.status(502).json({ error:err.message }); }
});

app.post('/api/morphology', async (req, res) => {
  const { verseKey } = req.body;
  if (!verseKey) return res.status(400).json({ error:'No verseKey' });
  try {
    const sid = await getSession();
    const raw = await tool(sid, 'fetch_word_morphology', { ayah_key:verseKey });
    res.json({ text: cleanTafsir(raw) });
  } catch(err) { res.status(502).json({ error:err.message }); }
});

app.post('/api/analyse', async (req, res) => {
  const { arabic, translation, verseKey } = req.body;
  if (!arabic) return res.status(400).json({ error:'No ayah data' });
  const prompt = `You are an Islamic scholar and scientific researcher. Analyze this Quranic ayah for its scientific dimensions BEYOND classical tafsir.

Ayah: ${verseKey}
Arabic: ${arabic}
Translation: ${translation}

Use EXACTLY these headers:

1. SURFACE MEANING
2. SCIENTIFIC DISCOVERY
3. THE GAP
4. WHAT SCIENCE IS STILL DISCOVERING
5. PRACTICAL IMPLICATION
6. BEYOND TAFSIR

Be specific. Cite real discoveries, Nobel prizes, researchers. Be honest: confirmed vs emerging vs speculation.`;
  try {
    const text = await groq(prompt, [{ role:'user', content:'Analyse this ayah.' }]);
    res.json({ text });
  } catch(err) { res.status(502).json({ error:err.message }); }
});

app.post('/api/chat', async (req, res) => {
  const { system, messages } = req.body;
  if (!messages) return res.status(400).json({ error:'No messages' });
  try {
    const text = await groq(system, messages, 600);
    res.json({ text });
  } catch(err) { res.status(502).json({ error:err.message }); }
});

app.get('/api/tools', async (req, res) => {
  try {
    const sid = await getSession();
    const r = await fetch(MCP, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Accept':'application/json, text/event-stream', 'mcp-session-id':sid },
      body: JSON.stringify({ jsonrpc:'2.0', id:99, method:'tools/list', params:{} })
    });
    const text = await r.text();
    const json = parseSSE(text);
    res.json({ tools: json?.result?.tools?.map(t=>t.name)||[] });
  } catch(err) { res.status(500).json({ error:err.message }); }
});

app.listen(PORT, () => {
  console.log(`🕌 Afaq proxy running on port ${PORT}`);
  console.log(`🤖 Groq: ${process.env.GROQ_API_KEY ? '✅' : '❌ missing'}`);
});
