import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PROXY_URL as PROXY } from '../config.js';

const SYSTEM_PROMPT = `You are Afaq Assistant — an Islamic scholar and scientific researcher integrated into the Afaq app (a Quran science exploration tool).

You help users:
1. Find specific ayaat by description (e.g. "verse about the expanding universe" → "51:47")
2. Answer questions about Quran and science
3. Navigate the app — tell them which page to visit
4. Explain scientific connections in ayaat

App pages:
- Horizons (/) — 29 ayaat mapped across Confirmed/Approaching/Still Waiting science
- Map (/map) — 114 surah journey map
- Research (/research) — AI scientific analysis of any ayah
- Search (/search) — semantic search across 6,236 ayaat
- Tracking (/tracking) — journal, bookmarks, history

When user asks about a specific event or topic, always:
1. Give the relevant verse key(s) e.g. "51:47" or "23:12-14"
2. Give a one-line description
3. Suggest which app page to use

Format verse keys in brackets like [51:47] so the app can detect and make them clickable.

Keep responses concise — 3-5 sentences max unless depth is needed.
Never repeat or correct a verse reference you already gave in this conversation. State it once and stop.
Always be respectful and grounded in authentic Islamic scholarship.
Only cite verse references you are highly confident about. If unsure of the exact verse number, say so rather than guessing.`;

export default function GlobalChat() {
  const navigate = useNavigate();
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    { role:'assistant', text:"As-salamu alaykum! I'm your Afaq assistant. Ask me about any Quran topic, event, or verse — I'll find it and guide you through the app." }
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [unread, setUnread]     = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
    }
  }, [open, messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Parse text and make [verse:key] clickable
  function parseMessage(text) {
    const parts = text.split(/(\[\d+:\d+(?:-\d+)?\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(\d+:\d+(?:-\d+)?)\]/);
      if (match) {
        const key = match[1];
        return (
          <span key={i}>
            <button
              onClick={() => navigate(`/search?q=${key}`)}
              style={{ background:'rgba(0,255,178,0.15)', border:'1px solid rgba(0,255,178,0.3)', borderRadius:6, padding:'1px 8px', color:'var(--c)', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:600, margin:'0 2px' }}
            >
              {key} ↗
            </button>
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');

    const newMsgs = [...messages, { role:'user', text:msg }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const history = newMsgs
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.role === 'assistant' ? m.text.replace(/\[(\d+:\d+(?:-\d+)?)\]/g, '$1') : m.text }));

      const res = await fetch(`${PROXY}/api/chat`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: history })
      });
      const data = await res.json();
      const reply = data.text || 'Sorry, I could not respond.';
      setMessages(prev => [...prev, { role:'assistant', text:reply }]);
      if (!open) setUnread(n => n + 1);
    } catch(e) {
      setMessages(prev => [...prev, { role:'assistant', text:'Connection error. Make sure the proxy is running.' }]);
    }
    setLoading(false);
  }

  const SUGGESTIONS = [
    "Which ayah mentions the Isra and Mi'raj?",
    "Find verses about fasting",
    "What does Quran say about bees?",
    "Verse about iron coming from space",
    "Show me the embryo verse",
  ];

  return (
    <>
      {/* ── CHAT BUBBLE ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:'fixed', bottom:24, right:24, zIndex:999,
          width:52, height:52, borderRadius:'50%',
          background: open ? 'var(--bg2)' : 'var(--c)',
          border: open ? '1px solid var(--b)' : 'none',
          color: open ? 'var(--t2)' : '#000',
          fontSize:22, cursor:'pointer',
          boxShadow: open ? 'none' : '0 4px 20px rgba(0,255,178,0.4)',
          transition:'all 0.25s',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}
      >
        {open ? '×' : '💬'}
        {!open && unread > 0 && (
          <div style={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:'50%', background:'#ff4444', color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {unread}
          </div>
        )}
      </button>

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div style={{
          position:'fixed', bottom:88, right:24, zIndex:998,
          width: Math.min(380, window.innerWidth - 32),
          height:500,
          background:'var(--bg)',
          border:'1px solid var(--b)',
          borderRadius:16,
          display:'flex', flexDirection:'column',
          overflow:'hidden',
          boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
          animation:'fadeUp 0.2s ease',
        }}>

          {/* Header */}
          <div style={{ padding:'0.9rem 1.1rem', borderBottom:'1px solid var(--b)', display:'flex', alignItems:'center', gap:10, background:'var(--bg2)' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 8px var(--c)', animation:'pulse 2s infinite' }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)' }}>Afaq Assistant</div>
              <div style={{ fontSize:10, color:'var(--t3)' }}>Powered by Groq Llama 3.3 · Free</div>
            </div>
            <button onClick={() => setMessages([{ role:'assistant', text:"As-salamu alaykum! Ask me about any Quran topic." }])}
              style={{ fontSize:11, color:'var(--t3)', background:'none', border:'1px solid var(--b)', borderRadius:'50px', padding:'2px 8px', cursor:'pointer', fontFamily:'inherit' }}>
              Clear
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'0.85rem', display:'flex', flexDirection:'column', gap:10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', gap:8, alignItems:'flex-start' }}>
                {m.role === 'assistant' && (
                  <div style={{ width:26, height:26, borderRadius:'50%', background:'rgba(0,255,178,0.1)', border:'1px solid rgba(0,255,178,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0, marginTop:2 }}>
                    ✨
                  </div>
                )}
                <div style={{
                  maxWidth:'82%',
                  padding:'0.55rem 0.85rem',
                  borderRadius: m.role==='user' ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
                  background: m.role==='user' ? 'rgba(0,255,178,0.1)' : 'var(--bg2)',
                  border:`1px solid ${m.role==='user'?'rgba(0,255,178,0.2)':'var(--b)'}`,
                  fontSize:13, color:'var(--t1)', lineHeight:1.65, fontWeight:300,
                }}>
                  {m.role === 'assistant' ? parseMessage(m.text) : m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:'rgba(0,255,178,0.1)', border:'1px solid rgba(0,255,178,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>✨</div>
                <div style={{ display:'flex', gap:4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--c)', opacity:0.5, animation:`pulse 1.2s ease ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestions (only at start) */}
          {messages.length <= 1 && (
            <div style={{ padding:'0 0.85rem 0.5rem', display:'flex', flexDirection:'column', gap:5 }}>
              <div style={{ fontSize:10, color:'var(--t3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:2 }}>Try asking</div>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setInput(s); }}
                  style={{ textAlign:'left', padding:'0.4rem 0.75rem', background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:8, color:'var(--t2)', fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', transition:'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(0,255,178,0.2)'; e.currentTarget.style.color='var(--c)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='var(--b)'; e.currentTarget.style.color='var(--t2)'; }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'0.7rem', borderTop:'1px solid var(--b)', display:'flex', gap:7, background:'var(--bg2)' }}>
            <input
              ref={inputRef}
              type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
              placeholder="Ask about any ayah or topic..."
              style={{ flex:1, padding:'0.55rem 0.9rem', background:'var(--bg)', border:'1px solid var(--b)', borderRadius:'50px', color:'var(--t1)', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none' }}
              onFocus={e => e.target.style.borderColor='rgba(0,255,178,0.3)'}
              onBlur={e => e.target.style.borderColor='var(--b)'}
            />
            <button onClick={send} disabled={loading || !input.trim()}
              style={{ width:36, height:36, borderRadius:'50%', background:input.trim()?'var(--c)':'var(--bg)', border:'1px solid var(--b)', color:input.trim()?'#000':'var(--t3)', fontSize:16, cursor:input.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
              {loading ? '·' : '↑'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
