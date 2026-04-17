import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'https://sanaadeelkhan.github.io', /\.onrender\.com$/], credentials: true }));
app.use(express.json());

const MCP = 'https://mcp.quran.ai';
const PORT = process.env.PORT || 3001;

async function getSession() { /* ... keep your existing getSession and tool functions ... */ 
  // (I kept them short for space - copy from your previous file if needed)
  const r1 = await fetch(MCP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05' } }) });
  const sid = r1.headers.get('mcp-session-id');
  await r1.text();
  return sid;
}

async function tool(sid, name, args) {
  const r = await fetch(MCP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'mcp-session-id': sid },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name, arguments: args } })
  });
  const text = await r.text();
  const json = text.split('\n').find(l => l.startsWith('data:')) ? JSON.parse(text.split('\n').find(l => l.startsWith('data:')).slice(5)) : JSON.parse(text);
  return json?.result?.content?.[0]?.text || '';
}

// ── STRONG GENERALIZED REWRITER (No hardcoding) ──
async function rewriteQuery(userQuery) {
  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) return userQuery;

  const system = `You are an expert Quran search optimizer specialized in scientific miracles.
Convert the user's query into the BEST possible search terms for the Quran.
- Use precise Arabic terms and roots (e.g. nutfah, alaq, mudghah for embryo; hadid, anzalna for iron from space; samaa, basatna for expanding universe).
- Focus on meaning and context.
- Return ONLY the improved search string. Maximum 12-15 words.
- Do NOT add "bismillah", "allah", or unrelated religious terms unless asked.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 80,
        messages: [{ role: 'system', content: system }, { role: 'user', content: userQuery }]
      })
    });

    const data = await res.json();
    let rewritten = data.choices?.[0]?.message?.content?.trim() || userQuery;

    console.log(`🔄 Query: "${userQuery}" → Rewritten: "${rewritten}"`);
    return rewritten;
  } catch (e) {
    console.error("Groq failed:", e.message);
    return userQuery;
  }
}

// ── SEARCH ROUTE ──
app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'No query' });

  try {
    const sid = await getSession();
    const improvedQuery = await rewriteQuery(query);

    const raw = await tool(sid, 'search_quran', { query: improvedQuery, translations: 'en-abdel-haleem' });

    const results = (JSON.parse(raw)?.results || []).map(r => ({
      verseKey: r.ayah_key,
      surah: r.surah,
      ayah: r.ayah,
      arabic: r.text,
      translation: r.translations?.[0]?.text || '',
      edition: r.translations?.[0]?.edition?.author || ''
    }));

    res.json({ results, query, improvedQuery });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Keep your existing /api/tafsir, /api/translation, /api/verse routes unchanged
// ... (copy them from your previous proxy.js)

app.listen(PORT, () => {
  console.log(`🕌 Afaq proxy running on port ${PORT}`);
  console.log(`🤖 Groq Smart Rewriter: ENABLED (generalized, no hardcoding)`);
});
