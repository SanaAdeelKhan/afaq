import { useState, useRef, useEffect } from "react";
import { PROXY_URL as PROXY } from '../config.js';
import { fetchAudio, fetchTafsir } from '../services/quranApi.js';

const EXAMPLES = [
  { ayah:"2:183",  label:"Fasting (Sawm)"    },
  { ayah:"2:238",  label:"Salah (Prayer)"    },
  { ayah:"16:69",  label:"Honey as Healing"  },
  { ayah:"17:85",  label:"The Soul (Ruh)"    },
  { ayah:"21:30",  label:"Life from Water"   },
  { ayah:"57:25",  label:"Iron from Space"   },
  { ayah:"23:12",  label:"Embryo Stages"     },
  { ayah:"96:1",   label:"Read (Iqra)"       },
  { ayah:"55:19",  label:"Two Seas"          },
  { ayah:"86:6",   label:"Human Creation"    },
];

const SECTIONS = [
  { key:'surface',   icon:'📖', title:'Surface Meaning',               color:'var(--t2)',  bg:'rgba(255,255,255,0.04)' },
  { key:'discovery', icon:'🔬', title:'Scientific Discovery',          color:'var(--c)',   bg:'rgba(0,255,178,0.05)'   },
  { key:'gap',       icon:'⏳', title:'The Gap in Years',              color:'var(--c2)',  bg:'rgba(245,158,11,0.05)'  },
  { key:'frontier',  icon:'🌌', title:'What Science Is Still Finding', color:'var(--c3)',  bg:'rgba(129,140,248,0.05)' },
  { key:'practical', icon:'🌱', title:'Practical Implication',         color:'#FF6B9D',   bg:'rgba(255,107,157,0.05)' },
  { key:'beyond',    icon:'✨', title:'Beyond Tafsir',                 color:'var(--c)',   bg:'rgba(0,255,178,0.07)'   },
];

const SURAH_LENS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,25,78,118,93,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,25,78,118,93,110,98,135,112,78,64,40,31,60,25,6,6,8,29,83,11,3,9,5,9,6,5,6,19,18,12,12,30,52,52,44,28,28,20,20,13,17,6,6,6,3,5,4,5,5,4,5,4,7,3,6,3,6,3,6,3,5,4,5,4,6,7,5,5,5,6,5,5,6,6,6,6,4,6,6,3,3];

function parseAnalysis(text) {
  const headers = ['SURFACE MEANING','SCIENTIFIC DISCOVERY','THE GAP','WHAT SCIENCE IS STILL DISCOVERING','PRACTICAL IMPLICATION','BEYOND TAFSIR'];
  return SECTIONS.map((section, i) => {
    const header = headers[i];
    const nextHeader = headers[i+1];
    const startIdx = text.indexOf(header);
    if (startIdx === -1) return { ...section, content: '' };
    const contentStart = startIdx + header.length;
    const endIdx = nextHeader ? text.indexOf(nextHeader, contentStart) : text.length;
    const content = text.slice(contentStart, endIdx===-1?text.length:endIdx)
      .replace(/^[\s\d.:*\-—#]+/,'').replace(/\*\*/g,'').trim();
    return { ...section, content };
  });
}

function parseKey(k) {
  const [s, a] = k.split(':').map(Number);
  return { surah: s, ayah: a };
}

function nextAyah(key) {
  const { surah, ayah } = parseKey(key);
  const maxAyah = SURAH_LENS[surah - 1] || 286;
  if (ayah < maxAyah) return `${surah}:${ayah + 1}`;
  if (surah < 114) return `${surah + 1}:1`;
  return key;
}

function prevAyah(key) {
  const { surah, ayah } = parseKey(key);
  if (ayah > 1) return `${surah}:${ayah - 1}`;
  if (surah > 1) { return `${surah - 1}:${SURAH_LENS[surah - 2] || 7}`; }
  return key;
}

// ── Floating Reflection Note ──
function FloatingNote({ ayahKey }) {
  const [open, setOpen]       = useState(false);
  const [note, setNote]       = useState('');
  const [saved, setSaved]     = useState(false);
  const [hasNote, setHasNote] = useState(false);

  useEffect(() => {
    const notes = JSON.parse(localStorage.getItem('afaq_journey_notes') || '{}');
    const existing = notes[ayahKey] || '';
    setNote(existing);
    setHasNote(!!existing);
    setSaved(false);
  }, [ayahKey]);

  function save() {
    const notes = JSON.parse(localStorage.getItem('afaq_journey_notes') || '{}');
    notes[ayahKey] = note;
    localStorage.setItem('afaq_journey_notes', JSON.stringify(notes));
    setSaved(true);
    setHasNote(!!note);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: 24,
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 0,
    }}>
      {/* Expanded note pad */}
      {open && (
        <div style={{
          width: 280,
          background: 'rgba(10,14,26,0.97)',
          border: '1px solid rgba(129,140,248,0.3)',
          borderRadius: 14,
          marginBottom: 8,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {/* Header */}
          <div style={{ padding: '0.65rem 0.9rem', borderBottom: '1px solid rgba(129,140,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(129,140,248,0.9)', fontWeight: 600 }}>
              📝 Reflection · {ayahKey}
            </span>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
          </div>
          {/* Textarea */}
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); setSaved(false); }}
            placeholder="Write while you read..."
            rows={5}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 13,
              fontFamily: "'DM Sans',sans-serif",
              padding: '0.75rem 0.9rem',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.7,
              boxSizing: 'border-box',
            }}
          />
          {/* Footer */}
          <div style={{ padding: '0.5rem 0.9rem', borderTop: '1px solid rgba(129,140,248,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
              {note.length > 0 ? `${note.length} chars` : 'No note yet'}
            </span>
            <button onClick={save}
              style={{
                padding: '0.3rem 0.9rem',
                background: saved ? 'rgba(0,255,178,0.15)' : 'rgba(129,140,248,0.12)',
                border: `1px solid ${saved ? 'rgba(0,255,178,0.3)' : 'rgba(129,140,248,0.25)'}`,
                borderRadius: 20,
                color: saved ? 'rgba(0,255,178,0.9)' : 'rgba(129,140,248,0.9)',
                fontSize: 11,
                fontFamily: "'DM Sans',sans-serif",
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              {saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Toggle bubble */}
      <button onClick={() => setOpen(o => !o)}
        title={open ? 'Close reflection' : 'Open reflection note'}
        style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: open ? 'rgba(129,140,248,0.2)' : 'rgba(10,14,26,0.95)',
          border: `1.5px solid ${hasNote ? 'rgba(129,140,248,0.6)' : 'rgba(129,140,248,0.25)'}`,
          color: 'rgba(129,140,248,0.9)',
          fontSize: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hasNote ? '0 0 12px rgba(129,140,248,0.3)' : '0 4px 16px rgba(0,0,0,0.4)',
          transition: 'all 0.2s',
          position: 'relative',
        }}>
        📝
        {/* dot if note exists */}
        {hasNote && !open && (
          <div style={{
            position: 'absolute',
            top: 2, right: 2,
            width: 8, height: 8,
            borderRadius: '50%',
            background: 'rgba(0,255,178,0.9)',
            border: '1.5px solid rgba(10,14,26,0.95)',
          }} />
        )}
      </button>
    </div>
  );
}

export default function Research() {
  const [verseKey, setVerseKey]   = useState('');
  const [ayahData, setAyahData]   = useState(null);
  const [sections, setSections]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(false);
  const [error, setError]         = useState(null);
  const [openIdx, setOpenIdx]     = useState(null);
  const [flagged, setFlagged]       = useState({});

  // Audio + Tafsir
  const [audioUrl, setAudioUrl]         = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying]           = useState(false);
  const [progress, setProgress]         = useState(0);
  const [tafsir, setTafsir]             = useState(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [showTafsir, setShowTafsir]     = useState(false);
  const audioRef = useRef(null);

  // Journey
  const [journeyMode, setJourneyMode] = useState(false);
  const [journeyKey, setJourneyKey]   = useState('1:1');

  // Chatbot
  const [messages, setMessages]       = useState([]);
  const [chatInput, setChatInput]     = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem('afaq_journey_key');
    if (saved) setJourneyKey(saved);
  }, []);

  function resetAudioTafsir() {
    setAudioUrl(null); setPlaying(false); setProgress(0);
    setTafsir(null); setShowTafsir(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
  }

  async function loadAudio(key) {
    setAudioLoading(true);
    try { setAudioUrl(await fetchAudio(key)); } catch {}
    setAudioLoading(false);
  }

  async function loadTafsir(key) {
    setTafsirLoading(true);
    try {
      const data = await fetchTafsir(key);
      const raw = data?.tafsir?.text || data?.tafsirs?.[0]?.text || '';
      setTafsir(raw.replace(/<[^>]+>/g,'').trim());
    } catch {}
    setTafsirLoading(false);
  }

  function toggleAudio() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else         { audioRef.current.play();  setPlaying(true);  }
  }

  function onTimeUpdate() {
    const a = audioRef.current;
    if (a?.duration) setProgress((a.currentTime / a.duration) * 100);
  }

  function toggleTafsir(key) {
    if (showTafsir) { setShowTafsir(false); return; }
    setShowTafsir(true);
    if (!tafsir) loadTafsir(key);
  }

  function enterJourney() {
    const saved = localStorage.getItem('afaq_journey_key') || '1:1';
    setJourneyKey(saved);
    setJourneyMode(true);
    setVerseKey(saved);
    setSections(null); setAyahData(null); setMessages([]);
    resetAudioTafsir();
    fetchAyah(saved, true);
  }

  function exitJourney() {
    setJourneyMode(false);
    setVerseKey(''); setAyahData(null); setSections(null); setMessages([]);
    resetAudioTafsir();
  }

  function navigateJourney(newKey) {
    setJourneyKey(newKey);
    setVerseKey(newKey);
    localStorage.setItem('afaq_journey_key', newKey);
    setSections(null); setMessages([]);
    resetAudioTafsir();
    fetchAyah(newKey, true);
  }

  function extractText(raw) {
    if (!raw) return '';
    try {
      const p = JSON.parse(raw);
      const results = p?.results;
      if (!results) return raw.replace(/<[^>]+>/g,'').trim();
      const edition = Object.keys(results)[0];
      const entries = results[edition];
      if (!Array.isArray(entries)) return raw;
      return entries.map(e => (e.text||'').replace(/<[^>]+>/g,'').trim()).join(' ');
    } catch { return raw.replace(/<[^>]+>/g,'').trim(); }
  }

  async function fetchAyah(key, isJourney) {
    const k = (key || verseKey).trim();
    if (!k) return;
    setFetching(true);
    setAyahData(null); setSections(null);
    setError(null); setOpenIdx(null); setMessages([]);
    resetAudioTafsir();
    try {
      const [vr, tr] = await Promise.all([
        fetch(`${PROXY}/api/verse`,       { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({verseKey:k}) }),
        fetch(`${PROXY}/api/translation`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({verseKey:k}) })
      ]);
      const vd = await vr.json();
      const td = await tr.json();
      setAyahData({ key:k, arabic:extractText(vd.text), translation:extractText(td.text) });
      if (isJourney) localStorage.setItem('afaq_journey_key', k);
      loadAudio(k);
    } catch { setError('Could not fetch ayah. Make sure proxy is running.'); }
    setFetching(false);
  }

  async function analyse() {
    if (!ayahData) return;
    setLoading(true); setSections(null); setError(null); setOpenIdx(null); setMessages([]);
    try {
      const res = await fetch(`${PROXY}/api/analyse`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ verseKey:ayahData.key, arabic:ayahData.arabic, translation:ayahData.translation })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSections(parseAnalysis(data.text));
      const prevR = JSON.parse(localStorage.getItem("afaq_researched") || "[]");
      const newEntry = { key:ayahData.key, translation:ayahData.translation, date:new Date().toISOString() };
      localStorage.setItem("afaq_researched", JSON.stringify([...prevR.filter(r=>(r.key||r)!==ayahData.key), newEntry]));
      setOpenIdx(1);
      setMessages([{ role:'system_note', text:`Analysis complete for ${ayahData.key}. Ask me anything about this ayah.` }]);
    } catch(e) { setError('Analysis failed: '+e.message); }
    setLoading(false);
  }

  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg || !ayahData) return;
    setChatInput('');
    const newMessages = [...messages.filter(m=>m.role!=='system_note'), { role:'user', text:msg }];
    setMessages([...messages, { role:'user', text:msg }]);
    setChatLoading(true);
    try {
      const systemPrompt = `You are an Islamic scholar and scientific researcher. The user is asking about this Quranic ayah:
Ayah: ${ayahData.key} | Arabic: ${ayahData.arabic} | Translation: ${ayahData.translation}
Answer questions about its scientific dimensions, tafsir, practical implications, and counterarguments. Be honest, balanced, and cite real science. Keep responses concise (3-5 sentences max unless depth is needed).`;
      const historyMessages = newMessages
        .filter(m=>m.role==='user'||m.role==='assistant')
        .map(m=>({ role:m.role, content:m.text }));
      const res = await fetch(`${PROXY}/api/chat`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ system:systemPrompt, messages:historyMessages })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role:'assistant', text:data.text }]);
    } catch(e) {
      setMessages(prev => [...prev, { role:'assistant', text:'Sorry, could not get response. '+e.message }]);
    }
    setChatLoading(false);
  }

  const { surah:jSurah, ayah:jAyah } = parseKey(journeyKey);
  const jMax    = SURAH_LENS[jSurah - 1] || 286;
  const isFirst = jSurah === 1 && jAyah === 1;
  const isLast  = jSurah === 114 && jAyah === (SURAH_LENS[113] || 6);

  return (
    <div className="app">
      <div style={{ padding:'3rem 0 4rem' }}>

        {/* Header */}
        <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--c)', marginBottom:'1rem', fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 8px var(--c)' }} />
          AI Research Engine · Groq Llama 3.3 + quran.ai MCP
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,5vw,46px)', fontWeight:900, marginBottom:'0.75rem', lineHeight:1.1, background:'linear-gradient(135deg,#fff 30%,rgba(0,255,178,0.8) 70%,rgba(129,140,248,0.6))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          What is this Ayah<br/>really telling us?
        </h1>

        <p style={{ fontSize:15, color:'var(--t3)', marginBottom:'2.5rem', fontWeight:300, lineHeight:1.75, maxWidth:500 }}>
          Select any ayah. Get AI scientific analysis beyond classical tafsir —
          then ask follow-up questions in the chatbot.
        </p>

        {/* Mode toggle */}
        <div style={{ display:'flex', gap:10, marginBottom:'2rem' }}>
          <button onClick={exitJourney}
            style={{ padding:'0.5rem 1.25rem', background:!journeyMode?'rgba(0,255,178,0.1)':'var(--bg2)', border:`1px solid ${!journeyMode?'rgba(0,255,178,0.3)':'var(--b)'}`, borderRadius:'50px', color:!journeyMode?'var(--c)':'var(--t3)', fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', fontWeight:500, transition:'all 0.2s' }}>
            🔍 Research Any Ayah
          </button>
          <button onClick={enterJourney}
            style={{ padding:'0.5rem 1.25rem', background:journeyMode?'rgba(129,140,248,0.1)':'var(--bg2)', border:`1px solid ${journeyMode?'rgba(129,140,248,0.35)':'var(--b)'}`, borderRadius:'50px', color:journeyMode?'var(--c3)':'var(--t3)', fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', fontWeight:500, transition:'all 0.2s' }}>
            🧭 Quran Journey
          </button>
        </div>

        {/* Journey navigator */}
        {journeyMode && (
          <div style={{ background:'rgba(129,140,248,0.05)', border:'1px solid rgba(129,140,248,0.2)', borderRadius:'var(--r)', padding:'1.25rem 1.5rem', marginBottom:'1.5rem' }}>
            <div style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--c3)', marginBottom:'1rem', fontWeight:600 }}>
              🧭 Quran Journey · Bookmarked at {journeyKey}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'0.75rem' }}>
              <button onClick={() => navigateJourney(prevAyah(journeyKey))} disabled={isFirst||fetching}
                style={{ width:38, height:38, borderRadius:'50%', background:'var(--bg2)', border:'1px solid var(--b)', color:isFirst?'var(--t3)':'var(--t1)', fontSize:18, cursor:isFirst?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>−</button>
              <div style={{ flex:1, background:'var(--bg2)', border:'1px solid rgba(129,140,248,0.25)', borderRadius:'50px', padding:'0.6rem 1.1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:15, fontWeight:600, color:'var(--c3)', fontFamily:"'DM Sans',sans-serif" }}>{journeyKey}</span>
                <span style={{ fontSize:11, color:'var(--t3)' }}>Surah {jSurah} · Ayah {jAyah} of {jMax}</span>
              </div>
              <button onClick={() => navigateJourney(nextAyah(journeyKey))} disabled={isLast||fetching}
                style={{ width:38, height:38, borderRadius:'50%', background:'var(--bg2)', border:'1px solid var(--b)', color:isLast?'var(--t3)':'var(--t1)', fontSize:18, cursor:isLast?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>+</button>
            </div>
            <div style={{ fontSize:11, color:'var(--t3)', fontStyle:'italic' }}>
              Surah {jSurah}/114 · Ayah {jAyah}/{jMax} · Bookmark auto-saved on navigate
            </div>
          </div>
        )}

        {/* Standard input */}
        {!journeyMode && (
          <>
            <div style={{ display:'flex', gap:10, marginBottom:'1.25rem' }}>
              <input type="text" value={verseKey}
                onChange={e => setVerseKey(e.target.value)}
                onKeyDown={e => e.key==='Enter' && fetchAyah()}
                placeholder="e.g. 2:183 or 16:69 or 57:25"
                style={{ flex:1, padding:'0.9rem 1.2rem', background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:'50px', color:'var(--t1)', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor='rgba(0,255,178,0.3)'; e.target.style.boxShadow='0 0 0 3px rgba(0,255,178,0.06)'; }}
                onBlur={e =>  { e.target.style.borderColor='var(--b)'; e.target.style.boxShadow='none'; }}
              />
              <button onClick={() => fetchAyah()} disabled={fetching}
                style={{ padding:'0.9rem 1.5rem', background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:'50px', color:'var(--t2)', fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', whiteSpace:'nowrap' }}>
                {fetching?'...':'Fetch'}
              </button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:'2.5rem' }}>
              {EXAMPLES.map(ex => (
                <button key={ex.ayah} onClick={() => { setVerseKey(ex.ayah); fetchAyah(ex.ayah); }}
                  style={{ padding:'0.4rem 0.9rem', background:verseKey===ex.ayah?'rgba(0,255,178,0.08)':'var(--card)', border:`1px solid ${verseKey===ex.ayah?'rgba(0,255,178,0.25)':'var(--b)'}`, borderRadius:'50px', color:verseKey===ex.ayah?'var(--c)':'var(--t3)', fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:5 }}
                  onMouseOver={e => { if(verseKey!==ex.ayah){e.currentTarget.style.borderColor='rgba(0,255,178,0.2)';e.currentTarget.style.color='var(--t2)';}}}
                  onMouseOut={e =>  { if(verseKey!==ex.ayah){e.currentTarget.style.borderColor='var(--b)';e.currentTarget.style.color='var(--t3)';}}}
                >
                  <span style={{ fontSize:10, opacity:0.5 }}>{ex.ayah}</span>{ex.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Fetching spinner */}
        {fetching && (
          <div style={{ textAlign:'center', padding:'2rem', color:'var(--t3)' }}>
            <div style={{ width:20, height:20, border:'2px solid var(--b2)', borderTopColor:'var(--c)', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 0.75rem' }} />
            <div style={{ fontSize:13, fontWeight:300 }}>Fetching from quran.ai MCP...</div>
          </div>
        )}

        {/* Ayah card */}
        {ayahData && !fetching && (
          <div style={{ background:'var(--card)', border:'1px solid var(--b)', borderRadius:'var(--r)', overflow:'hidden', marginBottom:'1.25rem', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:'1px', background:'linear-gradient(90deg,transparent,rgba(0,255,178,0.4),transparent)' }} />
            <div style={{ padding:'1.5rem 1.75rem' }}>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--c)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 5px var(--c)' }} />
                {ayahData.key} · Live from quran.ai {journeyMode && '· 🧭 Journey Mode'}
              </div>
              <div style={{ fontFamily:"'Tajawal',serif", fontSize:'clamp(20px,3vw,26px)', fontWeight:500, direction:'rtl', textAlign:'right', color:'var(--t1)', lineHeight:2, marginBottom:'1rem' }}>
                {ayahData.arabic}
              </div>
              <div style={{ height:'1px', background:'var(--b)', marginBottom:'1rem' }} />
              <div style={{ fontSize:14, color:'var(--t2)', fontStyle:'italic', lineHeight:1.75, fontWeight:300, marginBottom:'1.25rem' }}>
                {ayahData.translation}
              </div>

              {/* Audio player */}
              <div style={{ background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:12, padding:'0.75rem 1rem', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:12 }}>
                {audioLoading ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--t3)', fontSize:13 }}>
                    <div style={{ width:14, height:14, border:'2px solid var(--b2)', borderTopColor:'var(--c)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                    Loading recitation...
                  </div>
                ) : audioUrl ? (
                  <>
                    <audio ref={audioRef} src={audioUrl}
                      onEnded={() => { setPlaying(false); setProgress(0); }}
                      onTimeUpdate={onTimeUpdate} />
                    <button onClick={toggleAudio}
                      style={{ width:34, height:34, borderRadius:'50%', background:playing?'rgba(0,255,178,0.15)':'rgba(0,255,178,0.08)', border:'1px solid rgba(0,255,178,0.3)', color:'var(--c)', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
                      {playing?'⏸':'▶'}
                    </button>
                    <div style={{ flex:1, height:3, background:'var(--b)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:`${progress}%`, height:'100%', background:'var(--c)', borderRadius:2, transition:'width 0.1s' }} />
                    </div>
                    <span style={{ fontSize:11, color:'var(--t3)', whiteSpace:'nowrap' }}>Mishary · {ayahData.key}</span>
                  </>
                ) : (
                  <span style={{ fontSize:13, color:'var(--t3)' }}>Audio unavailable</span>
                )}
              </div>

              {/* Tafsir toggle */}
              <button onClick={() => toggleTafsir(ayahData.key)}
                style={{ width:'100%', padding:'0.6rem 1rem', background:showTafsir?'rgba(245,158,11,0.07)':'var(--bg2)', border:`1px solid ${showTafsir?'rgba(245,158,11,0.25)':'var(--b)'}`, borderRadius:10, color:showTafsir?'var(--c2)':'var(--t3)', fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:showTafsir?'0.75rem':0 }}>
                <span>📚 Tafsir Ibn Kathir</span>
                <span style={{ fontSize:16, transition:'transform 0.2s', transform:showTafsir?'rotate(45deg)':'none' }}>+</span>
              </button>

              {showTafsir && (
                <div style={{ background:'rgba(245,158,11,0.04)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:10, padding:'1rem 1.1rem' }}>
                  {tafsirLoading ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--t3)', fontSize:13 }}>
                      <div style={{ width:14, height:14, border:'2px solid var(--b2)', borderTopColor:'var(--c2)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                      Loading tafsir...
                    </div>
                  ) : (
                    <div style={{ fontSize:13, color:'var(--t2)', lineHeight:1.85, fontWeight:300, maxHeight:220, overflowY:'auto' }}>
                      {tafsir || 'Tafsir unavailable for this ayah.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Analyse button */}
            <div style={{ padding:'0 1.75rem 1.5rem' }}>
              <button onClick={analyse} disabled={loading}
                style={{ width:'100%', padding:'0.95rem', background:loading?'rgba(0,255,178,0.35)':'var(--c)', color:'#000', border:'none', borderRadius:'var(--r2)', fontSize:15, fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:loading?'not-allowed':'pointer', transition:'all 0.3s', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                {loading
                  ? <><div style={{ width:16, height:16, border:'2px solid rgba(0,0,0,0.3)', borderTopColor:'#000', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/> Analysing beyond tafsir...</>
                  : <>🔬 Analyse Scientifically</>}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding:'1rem 1.4rem', background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', color:'var(--c2)', fontSize:13, marginBottom:'1.5rem', fontWeight:300 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Analysis sections */}
        {sections && (
          <div style={{ marginBottom:'2rem' }}>

            {/* ── Disclaimer ── */}
            <div style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'0.85rem 1.1rem', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, marginBottom:'1.25rem' }}>
              <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--c2)', marginBottom:3 }}>AI-Generated Analysis — For Exploration Only</div>
                <div style={{ fontSize:12, color:'var(--t3)', lineHeight:1.6, fontWeight:300 }}>
                  Scientific connections are exploratory and may contain errors. This is not Islamic scholarship or fatwa.
                  Always verify with qualified scholars and peer-reviewed sources before sharing or acting on this content.
                </div>
              </div>
            </div>

            <div style={{ fontSize:11, color:'var(--t3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1.25rem', fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 5px var(--c)' }} />
              Scientific Analysis · {ayahData?.key}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {sections.map((s, i) => (
                <div key={s.key}
                  style={{ background:openIdx===i?s.bg:'var(--card)', border:`1px solid ${openIdx===i?'var(--b2)':'var(--b)'}`, borderRadius:'var(--r)', overflow:'hidden', transition:'all 0.25s', cursor:'pointer' }}
                  onClick={() => setOpenIdx(openIdx===i?null:i)}>
                  <div style={{ padding:'1rem 1.3rem', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ fontSize:20, flexShrink:0 }}>{s.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:s.color, marginBottom:4 }}>{s.title}</div>
                      {openIdx!==i && s.content && (
                        <div style={{ fontSize:12, color:'var(--t3)', fontWeight:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {s.content.slice(0,100)}...
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize:18, color:'var(--t3)', flexShrink:0, transition:'transform 0.2s', transform:openIdx===i?'rotate(45deg)':'none' }}>+</div>
                  </div>
                  {openIdx===i && (
                    <div style={{ padding:"0 1.3rem 1.3rem", borderTop:"1px solid var(--b)" }} onClick={e=>e.stopPropagation()}>
                      <div style={{ fontSize:14, color:"var(--t1)", lineHeight:1.9, fontWeight:300, whiteSpace:"pre-wrap", paddingTop:"1rem" }}>
                        {s.content}
                      </div>
                      <div style={{ marginTop:"0.85rem", paddingTop:"0.75rem", borderTop:"1px solid var(--b)", display:"flex", justifyContent:"flex-end" }}>
                        <button onClick={e => { e.stopPropagation(); setFlagged(f => ({ ...f, [s.key]: !f[s.key] })); }}
                          style={{ padding:"0.3rem 0.9rem", background:flagged[s.key]?"rgba(245,158,11,0.12)":"transparent", border:"1px solid "+(flagged[s.key]?"rgba(245,158,11,0.35)":"rgba(255,255,255,0.08)"), borderRadius:20, color:flagged[s.key]?"var(--c2)":"rgba(255,255,255,0.25)", fontSize:11, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:5 }}>
                          {flagged[s.key] ? "⚑ Flagged as uncertain" : "⚐ Flag this analysis"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>
          </div>
        )}

        {/* Chatbot */}
        {sections && (
          <div style={{ background:'var(--card)', border:'1px solid var(--b)', borderRadius:'var(--r)', overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.3rem', borderBottom:'1px solid var(--b)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 8px var(--c)', animation:'pulse 2s ease-in-out infinite' }} />
              <div style={{ fontSize:13, fontWeight:500, color:'var(--t1)' }}>Counter Question · Ask anything about {ayahData?.key}</div>
            </div>
            <div style={{ padding:'1rem 1.3rem', maxHeight:400, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
              {messages.map((m, i) => (
                <div key={i}>
                  {m.role==='system_note' && (
                    <div style={{ textAlign:'center', fontSize:12, color:'var(--t3)', fontStyle:'italic', padding:'0.5rem', background:'rgba(0,255,178,0.04)', borderRadius:8, border:'1px solid rgba(0,255,178,0.1)' }}>{m.text}</div>
                  )}
                  {m.role==='user' && (
                    <div style={{ display:'flex', justifyContent:'flex-end' }}>
                      <div style={{ background:'rgba(0,255,178,0.1)', border:'1px solid rgba(0,255,178,0.2)', borderRadius:'12px 12px 2px 12px', padding:'0.6rem 1rem', maxWidth:'80%', fontSize:14, color:'var(--t1)', lineHeight:1.6 }}>{m.text}</div>
                    </div>
                  )}
                  {m.role==='assistant' && (
                    <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(0,255,178,0.1)', border:'1px solid rgba(0,255,178,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🔬</div>
                      <div style={{ background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:'2px 12px 12px 12px', padding:'0.6rem 1rem', maxWidth:'85%', fontSize:14, color:'var(--t2)', lineHeight:1.7, fontWeight:300, whiteSpace:'pre-wrap' }}>{m.text}</div>
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(0,255,178,0.1)', border:'1px solid rgba(0,255,178,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🔬</div>
                  <div style={{ display:'flex', gap:4 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--c)', animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {messages.length <= 1 && (
              <div style={{ padding:'0 1.3rem 0.75rem', display:'flex', flexWrap:'wrap', gap:6 }}>
                {["Is this interpretation contested by scientists?","What would atheists say about this?","How should I apply this in daily life?","Are there any hadith that support this?","What do modern scholars say?"].map(q => (
                  <button key={q} onClick={() => setChatInput(q)}
                    style={{ padding:'0.35rem 0.8rem', background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:'50px', color:'var(--t3)', fontSize:11, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', transition:'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor='rgba(0,255,178,0.2)'; e.currentTarget.style.color='var(--t2)'; }}
                    onMouseOut={e =>  { e.currentTarget.style.borderColor='var(--b)'; e.currentTarget.style.color='var(--t3)'; }}>
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div style={{ padding:'0.75rem 1rem', borderTop:'1px solid var(--b)', display:'flex', gap:8 }}>
              <input type="text" value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendChat()}
                placeholder="Ask a counter question..."
                style={{ flex:1, padding:'0.6rem 1rem', background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:'50px', color:'var(--t1)', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none' }}
                onFocus={e => e.target.style.borderColor='rgba(0,255,178,0.3)'}
                onBlur={e =>  e.target.style.borderColor='var(--b)'}
              />
              <button onClick={sendChat} disabled={chatLoading||!chatInput.trim()}
                style={{ padding:'0.6rem 1.2rem', background:chatInput.trim()?'var(--c)':'var(--bg2)', color:chatInput.trim()?'#000':'var(--t3)', border:'1px solid var(--b)', borderRadius:'50px', fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:chatInput.trim()?'pointer':'not-allowed', transition:'all 0.2s' }}>
                {chatLoading?'...':'↑'}
              </button>
            </div>
          </div>
        )}

        {sections && (
          <div style={{ marginTop:'1.5rem', padding:'1rem 1.25rem', background:'var(--bg2)', borderRadius:'var(--r2)', border:'1px solid var(--b)', display:'flex', alignItems:'center', gap:10, fontSize:11, color:'var(--t3)', fontWeight:300 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 5px var(--c)', flexShrink:0 }} />
            Powered by Groq Llama 3.3 70B (free) + quran.ai MCP · Educational research · Verify with trusted scholars
          </div>
        )}
      </div>

      {/* ── Floating Reflection Note — visible whenever an ayah is loaded ── */}
      {ayahData && !fetching && <FloatingNote ayahKey={ayahData.key} />}
    </div>
  );
}
