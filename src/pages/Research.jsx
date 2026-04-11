import { useState } from "react";

const PROXY = 'http://localhost:3001';

const EXAMPLES = [
  { ayah: "2:183", label: "Fasting (Sawm)" },
  { ayah: "2:238", label: "Salah (Prayer)" },
  { ayah: "16:69", label: "Honey as Healing" },
  { ayah: "17:85", label: "The Soul (Ruh)" },
  { ayah: "21:30", label: "Life from Water" },
  { ayah: "55:19", label: "Two Seas Meeting" },
  { ayah: "86:6",  label: "Human Creation" },
  { ayah: "96:1",  label: "Read (Iqra)" },
  { ayah: "57:25", label: "Iron from Space" },
  { ayah: "23:12", label: "Embryo Stages" },
];

const SECTIONS = [
  { key:'surface',   icon:'📖', title:'Surface Meaning',               color:'var(--t2)',  bg:'rgba(255,255,255,0.04)' },
  { key:'discovery', icon:'🔬', title:'Scientific Discovery',          color:'var(--c)',   bg:'rgba(0,255,178,0.05)'   },
  { key:'gap',       icon:'⏳', title:'The Gap in Years',              color:'var(--c2)',  bg:'rgba(245,158,11,0.05)'  },
  { key:'frontier',  icon:'🌌', title:'What Science Is Still Finding', color:'var(--c3)',  bg:'rgba(129,140,248,0.05)' },
  { key:'practical', icon:'🌱', title:'Practical Implication',         color:'#FF6B9D',   bg:'rgba(255,107,157,0.05)' },
  { key:'beyond',    icon:'✨', title:'Beyond Tafsir',                 color:'var(--c)',   bg:'rgba(0,255,178,0.07)'   },
];

function parseAnalysis(text) {
  const headers = [
    'SURFACE MEANING',
    'SCIENTIFIC DISCOVERY',
    'THE GAP',
    'WHAT SCIENCE IS STILL DISCOVERING',
    'PRACTICAL IMPLICATION',
    'BEYOND TAFSIR',
  ];

  return SECTIONS.map((section, i) => {
    const header = headers[i];
    const nextHeader = headers[i + 1];

    const startIdx = text.indexOf(header);
    if (startIdx === -1) return { ...section, content: '' };

    const contentStart = startIdx + header.length;
    const endIdx = nextHeader ? text.indexOf(nextHeader, contentStart) : text.length;

    const content = text
      .slice(contentStart, endIdx === -1 ? text.length : endIdx)
      .replace(/^[\s\d.:*\-—]+/, '')
      .replace(/\*\*/g, '')
      .trim();

    return { ...section, content };
  });
}

export default function Research() {
  const [verseKey, setVerseKey]     = useState('');
  const [ayahData, setAyahData]     = useState(null);
  const [sections, setSections]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(false);
  const [error, setError]           = useState(null);
  const [openIdx, setOpenIdx]       = useState(null);

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
    } catch {
      return raw.replace(/<[^>]+>/g,'').trim();
    }
  }

  async function fetchAyah(key) {
    const k = (key || verseKey).trim();
    if (!k) return;
    setFetching(true);
    setAyahData(null);
    setSections(null);
    setError(null);
    setOpenIdx(null);

    try {
      const [vr, tr] = await Promise.all([
        fetch(`${PROXY}/api/verse`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ verseKey: k })
        }),
        fetch(`${PROXY}/api/translation`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ verseKey: k })
        })
      ]);

      const vd = await vr.json();
      const td = await tr.json();

      setAyahData({
        key: k,
        arabic: extractText(vd.text),
        translation: extractText(td.text),
      });
    } catch(e) {
      setError('Could not fetch ayah. Make sure proxy is running.');
    }
    setFetching(false);
  }

  async function analyse() {
    if (!ayahData) return;
    setLoading(true);
    setSections(null);
    setError(null);
    setOpenIdx(null);

    try {
      const res = await fetch(`${PROXY}/api/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseKey: ayahData.key,
          arabic: ayahData.arabic,
          translation: ayahData.translation,
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSections(parseAnalysis(data.text));
      setOpenIdx(1); // auto-open Scientific Discovery
    } catch(e) {
      setError('Analysis failed: ' + e.message);
    }
    setLoading(false);
  }

  return (
    <div className="app">
      <div style={{ padding:'3rem 0 4rem' }}>

        {/* Header */}
        <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--c)', marginBottom:'1rem', fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 8px var(--c)' }} />
          AI Research Engine · Claude + quran.ai MCP
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,5vw,46px)', fontWeight:900, marginBottom:'0.75rem', lineHeight:1.1, background:'linear-gradient(135deg,#fff 30%,rgba(0,255,178,0.8) 70%,rgba(129,140,248,0.6))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          What is this Ayah<br/>really telling us?
        </h1>

        <p style={{ fontSize:15, color:'var(--t3)', marginBottom:'2.5rem', fontWeight:300, lineHeight:1.75, maxWidth:500 }}>
          Select any ayah. Our AI analyses what it carries
          beyond classical tafsir — the science hidden in the words,
          the gap in years, and what it means for your life today.
        </p>

        {/* Input row */}
        <div style={{ display:'flex', gap:10, marginBottom:'1.25rem' }}>
          <input
            type="text" value={verseKey}
            onChange={e => setVerseKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchAyah()}
            placeholder="Verse key e.g. 2:183  or  16:69  or  57:25"
            style={{ flex:1, padding:'0.9rem 1.2rem', background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:'50px', color:'var(--t1)', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'all 0.2s' }}
            onFocus={e => { e.target.style.borderColor='rgba(0,255,178,0.3)'; e.target.style.boxShadow='0 0 0 3px rgba(0,255,178,0.06)'; }}
            onBlur={e => { e.target.style.borderColor='var(--b)'; e.target.style.boxShadow='none'; }}
          />
          <button onClick={() => fetchAyah()} disabled={fetching}
            style={{ padding:'0.9rem 1.5rem', background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:'50px', color:'var(--t2)', fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s' }}>
            {fetching ? '...' : 'Fetch'}
          </button>
        </div>

        {/* Example chips */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:'2.5rem' }}>
          {EXAMPLES.map(ex => (
            <button key={ex.ayah}
              onClick={() => { setVerseKey(ex.ayah); fetchAyah(ex.ayah); }}
              style={{ padding:'0.4rem 0.9rem', background: verseKey===ex.ayah ? 'rgba(0,255,178,0.08)' : 'var(--card)', border:`1px solid ${verseKey===ex.ayah ? 'rgba(0,255,178,0.25)' : 'var(--b)'}`, borderRadius:'50px', color: verseKey===ex.ayah ? 'var(--c)' : 'var(--t3)', fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:5 }}
              onMouseOver={e => { if(verseKey!==ex.ayah){ e.currentTarget.style.borderColor='rgba(0,255,178,0.2)'; e.currentTarget.style.color='var(--t2)'; }}}
              onMouseOut={e => { if(verseKey!==ex.ayah){ e.currentTarget.style.borderColor='var(--b)'; e.currentTarget.style.color='var(--t3)'; }}}
            >
              <span style={{ fontSize:10, opacity:0.5 }}>{ex.ayah}</span>
              {ex.label}
            </button>
          ))}
        </div>

        {/* Loading ayah */}
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
                {ayahData.key} · Live from quran.ai
              </div>
              <div style={{ fontFamily:"'Tajawal',serif", fontSize:'clamp(20px,3vw,26px)', fontWeight:500, direction:'rtl', textAlign:'right', color:'var(--t1)', lineHeight:2, marginBottom:'1rem' }}>
                {ayahData.arabic}
              </div>
              <div style={{ height:'1px', background:'var(--b)', marginBottom:'1rem' }} />
              <div style={{ fontSize:14, color:'var(--t2)', fontStyle:'italic', lineHeight:1.75, fontWeight:300 }}>
                {ayahData.translation}
              </div>
            </div>

            <div style={{ padding:'0 1.75rem 1.5rem' }}>
              <button onClick={analyse} disabled={loading}
                style={{ width:'100%', padding:'0.95rem', background: loading ? 'rgba(0,255,178,0.35)' : 'var(--c)', color:'#000', border:'none', borderRadius:'var(--r2)', fontSize:15, fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.3s', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                {loading ? (
                  <><div style={{ width:16, height:16, border:'2px solid rgba(0,0,0,0.3)', borderTopColor:'#000', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Analysing beyond tafsir...</>
                ) : (
                  <>🔬 Analyse Scientifically</>
                )}
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

        {/* Results */}
        {sections && (
          <div>
            <div style={{ fontSize:11, color:'var(--t3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1.25rem', fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 5px var(--c)' }} />
              Scientific Analysis · {ayahData?.key}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {sections.map((s, i) => (
                <div key={s.key}
                  style={{ background: openIdx===i ? s.bg : 'var(--card)', border:`1px solid ${openIdx===i ? 'var(--b2)' : 'var(--b)'}`, borderRadius:'var(--r)', overflow:'hidden', transition:'all 0.25s', cursor:'pointer' }}
                  onClick={() => setOpenIdx(openIdx===i ? null : i)}
                >
                  <div style={{ padding:'1rem 1.3rem', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ fontSize:20, flexShrink:0 }}>{s.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:s.color, marginBottom:4 }}>{s.title}</div>
                      {openIdx !== i && s.content && (
                        <div style={{ fontSize:12, color:'var(--t3)', fontWeight:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {s.content.slice(0,100)}...
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize:18, color:'var(--t3)', flexShrink:0, transition:'transform 0.2s', transform: openIdx===i ? 'rotate(45deg)' : 'none' }}>+</div>
                  </div>

                  {openIdx === i && (
                    <div style={{ padding:'0 1.3rem 1.3rem', borderTop:'1px solid var(--b)' }}
                      onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize:14, color:'var(--t1)', lineHeight:1.9, fontWeight:300, whiteSpace:'pre-wrap', paddingTop:'1rem' }}>
                        {s.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Attribution */}
            <div style={{ marginTop:'2rem', padding:'1rem 1.25rem', background:'var(--bg2)', borderRadius:'var(--r2)', border:'1px solid var(--b)', display:'flex', alignItems:'center', gap:10, fontSize:11, color:'var(--t3)', fontWeight:300, letterSpacing:'0.04em' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 5px var(--c)', flexShrink:0 }} />
              Powered by Claude AI + quran.ai MCP · Educational research tool · Always verify with trusted scholars
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
