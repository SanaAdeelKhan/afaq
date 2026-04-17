import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors({ origin: ['http://localhost:5173','https://sanaadeelkhan.github.io',/\.onrender\.com$/], credentials: true }));
app.use(express.json());

const MCP = 'https://mcp.quran.ai';
const PORT = process.env.PORT || 3001;

let cachedSid = null;
let sidCreatedAt = 0;

function parseSSE(text) {
  for (const line of text.split('\n')) {
    if (line.startsWith('data:')) {
      try { return JSON.parse(line.slice(5).trim()); } catch {}
    }
  }
  try { return JSON.parse(text); } catch {}
  return null;
}

async function createSession() {
  const r1 = await fetch(MCP, {
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json, text/event-stream'},
    body: JSON.stringify({ jsonrpc:'2.0', id:1, method:'initialize', params:{ protocolVersion:'2024-11-05', capabilities:{}, clientInfo:{ name:'afaq', version:'1.0.0' } } })
  });
  const sid = r1.headers.get('mcp-session-id');
  const body = await r1.text();
  console.log('Init response body:', body.slice(0,200));
  if (!sid) throw new Error('No session ID — MCP may have changed protocol');
  await fetch(MCP, {
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json, text/event-stream','mcp-session-id':sid},
    body: JSON.stringify({ jsonrpc:'2.0', method:'notifications/initialized', params:{} })
  });
  console.log('✅ MCP session:', sid);
  return sid;
}

async function getSession() {
  if (cachedSid && Date.now() - sidCreatedAt < 4 * 60 * 1000) return cachedSid;
  cachedSid = await createSession();
  sidCreatedAt = Date.now();
  return cachedSid;
}

async function tool(name, args) {
  let sid;
  try { sid = await getSession(); } catch(e) { throw e; }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const r = await fetch(MCP, {
      method:'POST', signal: controller.signal,
      headers:{'Content-Type':'application/json','Accept':'application/json, text/event-stream','mcp-session-id':sid},
      body: JSON.stringify({ jsonrpc:'2.0', id:Date.now(), method:'tools/call', params:{ name, arguments:args } })
    });
    clearTimeout(timer);
    const text = await r.text();
    console.log(`MCP [${name}] status=${r.status} body=${text.slice(0,300)}`);
    if (r.status === 401 || r.status === 403 || r.status === 404) {
      cachedSid = null;
      throw new Error(`MCP session rejected (${r.status}) — will retry`);
    }
    const json = parseSSE(text);
    if (!json) throw new Error('MCP returned empty/unparseable response: ' + text.slice(0,100));
    if (json?.error) throw new Error(json.error.message);
    if (json?.result?.isError) throw new Error(json.result.content?.[0]?.text || 'Tool error');
    return json?.result?.content?.[0]?.text || '';
  } catch(e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('MCP timed out after 20s');
    throw e;
  }
}

async function toolWithRetry(name, args) {
  try { return await tool(name, args); }
  catch(e) {
    if (e.message.includes('retry') || e.message.includes('session') || e.message.includes('empty')) {
      console.log('Retrying with fresh session...');
      cachedSid = null;
      return await tool(name, args);
    }
    throw e;
  }
}

function stripHtml(h) { return (h||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }

function cleanText(raw) {
  try {
    const p = JSON.parse(raw);
    const results = p?.results;
    if (!results) return stripHtml(raw);
    const ed = Object.keys(results)[0];
    const entries = results[ed];
    if (!Array.isArray(entries)) return stripHtml(raw);
    return entries.map(e => stripHtml(e.text||'')).join('\n\n');
  } catch { return stripHtml(raw); }
}

function parseSearch(raw) {
  try {
    const p = JSON.parse(raw);
    return (p?.results||[]).map(r => ({
      verseKey: r.ayah_key, surah: r.surah, ayah: r.ayah,
      arabic: r.text, translation: r.translations?.[0]?.text||'',
      edition: r.translations?.[0]?.edition?.author||''
    }));
  } catch { return []; }
}

async function groq(messages, { maxTokens=1000, temperature=0.7 }={}) {
  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) throw new Error('GROQ_API_KEY not set in .env');
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${KEY}`},
    body: JSON.stringify({ model:'llama-3.3-70b-versatile', temperature, max_tokens:maxTokens, messages })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices?.[0]?.message?.content?.trim() || '';
}

// ── ROUTES ──
app.get('/health', (_, res) => res.json({ status:'ok', groq: !!process.env.GROQ_API_KEY, session: !!cachedSid }));

app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error:'No query' });
  try {
    let improved = query;
    try {
      improved = await groq([
        { role:'system', content:'Rewrite the user query into effective Quran search terms. Include Arabic roots/words. Return ONLY the search string, nothing else.' },
        { role:'user', content:`Query: "${query}"` }
      ], { maxTokens:80, temperature:0.3 });
      if (!improved || improved.length < 3) improved = query;
    } catch(e) { console.warn('Rewrite skipped:', e.message); }
    console.log(`Search: "${query}" → "${improved}"`);
    const raw = await toolWithRetry('search_quran', { query: improved, translations:'en-abdel-haleem' });
    res.json({ results: parseSearch(raw), query, improvedQuery: improved });
  } catch(e) { console.error('Search error:', e.message); res.status(502).json({ error: e.message }); }
});


app.post('/api/smart-search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error:'No query' });
  try {
    // Groq finds exact verse keys — no MCP search, no hallucinated text
    const verseKeysRaw = await groq([
      { role:'system', content:`You are a Quran scholar with perfect knowledge of all 6236 verses.
The user will give you a topic or word. Return ALL verse keys (surah:ayah) that DIRECTLY mention this topic.
Rules:
- Only verses that explicitly and directly mention this topic — no loose associations
- Return a valid JSON array only, like ["2:183", "16:69", "57:25"]
- Maximum 15 verses. If fewer are relevant, return fewer.
- If nothing directly matches, return []
- Return ONLY the JSON array. No explanation. No markdown.` },
      { role:'user', content:`Topic: "${query}"` }
    ], { maxTokens:200, temperature:0.1 });

    let verseKeys = [];
    try {
      const cleaned = verseKeysRaw.replace(/\`\`\`json|\`\`\`/g,'').trim();
      verseKeys = JSON.parse(cleaned);
      if (!Array.isArray(verseKeys)) verseKeys = [];
    } catch { verseKeys = []; }

    if (verseKeys.length === 0) {
      return res.json({ results: [], query });
    }

    // Fetch each verse from quran.com — verified tashkeel + translation
    const results = await Promise.all(
      verseKeys.slice(0,15).map(async (vk) => {
        try {
          const vr = await fetch(`https://api.quran.com/api/v4/verses/by_key/${vk}?fields=text_uthmani`);
          if (!vr.ok) return null;
          const vd = await vr.json();
          const arabic = vd?.verse?.text_uthmani || '';
          let translation = '';
          try {
            const raw2 = await toolWithRetry('fetch_translation', { ayahs: vk, editions: 'en-abdel-haleem' });
            const p2 = JSON.parse(raw2);
            const entries = p2?.results?.['en-abdel-haleem'] || [];
            translation = (entries[0]?.text || '').replace(/<[^>]+>/g,'').trim();
          } catch {}
          const [surah, ayah] = vk.split(':');
          return {
            verseKey: vk,
            surah: parseInt(surah),
            ayah: parseInt(ayah),
            arabic,
            translation,
            edition: 'Dr. Mustafa Khattab · Quran Foundation'
          };
        } catch { return null; }
      })
    );

    res.json({ results: results.filter(Boolean), query });
  } catch(e) {
    console.error('Smart search error:', e.message);
    res.status(502).json({ error: e.message });
  }
});
app.post('/api/verse', async (req, res) => {
  const { verseKey } = req.body;
  if (!verseKey) return res.status(400).json({ error:'No verseKey' });
  try {
    const raw = await toolWithRetry('fetch_quran', { ayahs: verseKey, editions:'ar-simple-clean' });
    res.json({ text: raw });
  } catch(e) { res.status(502).json({ error: e.message }); }
});

app.post('/api/translation', async (req, res) => {
  const { verseKey } = req.body;
  if (!verseKey) return res.status(400).json({ error:'No verseKey' });
  try {
    const raw = await toolWithRetry('fetch_translation', { ayahs: verseKey, editions:'en-abdel-haleem' });
    res.json({ text: cleanText(raw) });
  } catch(e) { res.status(502).json({ error: e.message }); }
});

app.post('/api/tafsir', async (req, res) => {
  const { verseKey, edition } = req.body;
  if (!verseKey) return res.status(400).json({ error:'No verseKey' });
  try {
    const raw = await toolWithRetry('fetch_tafsir', { ayahs: verseKey, editions: edition||'en-ibn-kathir' });
    res.json({ text: cleanText(raw) });
  } catch(e) { res.status(502).json({ error: e.message }); }
});

app.post('/api/analyse', async (req, res) => {
  const { verseKey, arabic, translation } = req.body;
  if (!verseKey) return res.status(400).json({ error:'No verseKey' });
  try {
    const text = await groq([{ role:'user', content:`Analyse Quranic ayah ${verseKey}: "${translation}" (Arabic: ${arabic})

Use EXACTLY these headers on their own lines:

SURFACE MEANING
[2-3 sentences on classical meaning]

SCIENTIFIC DISCOVERY
[Modern science findings related to this ayah with specific dates]

THE GAP
[Years between revelation ~610 CE and scientific confirmation]

WHAT SCIENCE IS STILL DISCOVERING
[Ongoing frontier research related to this ayah]

PRACTICAL IMPLICATION
[How to apply this wisdom in daily life]

BEYOND TAFSIR
[Deeper spiritual and scientific connections]` }], { maxTokens:2000 });
    res.json({ text });
  } catch(e) { res.status(502).json({ error: e.message }); }
});

app.post('/api/chat', async (req, res) => {
  const { system, messages } = req.body;
  if (!messages) return res.status(400).json({ error:'No messages' });
  try {
    const all = system ? [{ role:'system', content:system }, ...messages] : messages;
    const text = await groq(all, { maxTokens:800 });
    res.json({ text });
  } catch(e) { res.status(502).json({ error: e.message }); }
});

app.listen(PORT, () => {
  console.log(`🕌 Afaq proxy on port ${PORT}`);
  console.log(`🤖 Groq: ${process.env.GROQ_API_KEY ? '✅' : '❌ missing'}`);
  console.log('Routes: /health /api/search /api/verse /api/translation /api/tafsir /api/analyse /api/chat');
});
