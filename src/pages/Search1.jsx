import { useState, useRef } from "react";
import { fetchAudio } from "../services/quranApi";
import { PROXY_URL as PROXY } from '../config.js';

const SUGGESTIONS = [
  "expanding universe","human embryo","iron from space",
  "life from water","soul consciousness","mountains stability",
  "deep ocean darkness","pairs in creation","patience hardship",
  "fasting benefits","honey healing","prayer benefits",
];

function ResultCard({ r }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tafsir, setTafsir] = useState(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef(null);

  async function expand() {
    setExpanded(true);
    if (!audioUrl) {
      setAudioLoading(true);
      try { setAudioUrl(await fetchAudio(r.verseKey)); } catch {}
      setAudioLoading(false);
    }
    if (!tafsir) {
      setTafsirLoading(true);
      try {
        const res = await fetch(`${PROXY}/api/tafsir`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ verseKey: r.verseKey })
        });
        const data = await res.json();
        setTafsir(data.text || '');
      } catch {}
      setTafsirLoading(false);
    }
  }

  function toggleAudio() {
    if (!audioRef.current) return;
    if (playing) { 
      audioRef.current.pause(); 
      setPlaying(false); 
    }
    else { 
      audioRef.current.play(); 
      setPlaying(true); 
    }
  }

  function onTimeUpdate() {
    const a = audioRef.current;
    if (a?.duration) setProgress((a.currentTime / a.duration) * 100);
  }

  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--b)', borderRadius:'var(--r)', overflow:expanded?'visible':'hidden', transition:'all 0.25s', position:'relative' }}
      onMouseOver={e => { if(!expanded) e.currentTarget.style.borderColor='var(--b2)'; }}
      onMouseOut={e => { if(!expanded) e.currentTarget.style.borderColor='var(--b)'; }}
    >
      <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:'1px', background:'linear-gradient(90deg,transparent,rgba(0,255,178,0.35),transparent)' }} />
      <div style={{ position:'absolute', left:0, top:16, bottom:16, width:2, background:'var(--c)', borderRadius:2, boxShadow:'0 0 8px var(--c)' }} />
      <div style={{ padding:'1.25rem 1.5rem 1.1rem 1.8rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.85rem' }}>
          <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--c)', display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 5px var(--c)' }} />
            Surah {r.surah} · Ayah {r.ayah}
          </span>
          <span style={{ fontSize:11, color:'var(--t3)', padding:'3px 10px', background:'var(--bg2)', borderRadius:'20px', border:'1px solid var(--b)' }}>
            {r.verseKey}
          </span>
        </div>
        <div style={{ fontFamily:"'Tajawal',serif", fontSize:'clamp(18px,3vw,22px)', fontWeight:500, direction:'rtl', textAlign:'right', color:'var(--t1)', lineHeight:1.9, marginBottom:'0.75rem' }}>
          {r.arabic}
        </div>
        <div style={{ height:'1px', background:'var(--b)', marginBottom:'0.85rem' }} />
        <div style={{ fontSize:14, color:'var(--t2)', lineHeight:1.75, fontStyle:'italic', fontWeight:300, marginBottom: expanded ? '1rem' : 0 }}>
          {r.translation}
        </div>
        {r.edition && !expanded && (
          <div style={{ fontSize:11, color:'var(--t3)', marginTop:'0.4rem' }}>— {r.edition}</div>
        )}
        {!expanded && (
          <button onClick={expand}
            style={{ marginTop:'0.85rem', padding:'0.4rem 1rem', background:'rgba(0,255,178,0.07)', border:'1px solid rgba(0,255,178,0.2)', borderRadius:'50px', color:'var(--c)', fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', fontWeight:500 }}>
            + Audio · Tafsir · More
          </button>
        )}
      </div>

      {expanded && (
        <div style={{ padding:'0 1.5rem 1.5rem 1.8rem', display:'flex', flexDirection:'column', gap:10 }}>
          <div className="audio-player">
            {audioLoading ? (
              <span className="audio-loading"><span className="spinner"/> Loading...</span>
            ) : audioUrl ? (
              <>
                <audio ref={audioRef} src={audioUrl}
                  onEnded={() => { setPlaying(false); setProgress(0); }}
                  onTimeUpdate={onTimeUpdate} />
                <button className="audio-play-btn play-confirmed" onClick={toggleAudio}>
                  {playing ? '⏸' : '▶'}
                </button>
                <div className="audio-progress">
                  <div className="audio-progress-fill" style={{ width:`${progress}%` }} />
                </div>
                <span className="audio-label">Mishary Rashid · {r.verseKey}</span>
              </>
            ) : <span className="audio-loading">Audio unavailable</span>}
          </div>
          <div className="tafsir-box">
            <div className="box-label">
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 6px var(--c)', marginRight:6, display:'inline-block' }}/>
              Tafsir Ibn Kathir · quran.ai MCP
            </div>
            {tafsirLoading
              ? <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--t3)', fontSize:13 }}>
                  <span className="spinner"/> Fetching...
                </div>
              : <div className="tafsir-text">{tafsir || 'Tafsir unavailable'}</div>
            }
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:11, color:'var(--t3)' }}>— {r.edition}</div>
            <button onClick={() => setExpanded(false)}
              style={{ fontSize:12, color:'var(--t3)', background:'none', border:'1px solid var(--b)', borderRadius:'50px', padding:'0.3rem 0.8rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState('');
  const [showAll, setShowAll] = useState(false);

  async function handleSearch(q) {
    let sq = (q || query).trim();
    if (!sq) return;

    setLoading(true); 
    setError(null); 
    setResults(null); 
    setSearched(sq);
    setShowAll(false);

    const prev = JSON.parse(localStorage.getItem("afaq_searched") || "[]");
    localStorage.setItem("afaq_searched", JSON.stringify([...prev.slice(-49), sq]));

    try {
      const verseKeyPattern = /^\d{1,3}:\d{1,3}$/;
      
      if (verseKeyPattern.test(sq)) {
        // Direct verse lookup
        const [vr, tr] = await Promise.all([
          fetch(`${PROXY}/api/verse`,       { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ verseKey: sq }) }),
          fetch(`${PROXY}/api/translation`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ verseKey: sq }) }),
        ]);

        const vd = await vr.json();
        const td = await tr.json();

        const arabic = (vd.text||'').replace(/<[^>]+>/g,'').trim();
        const translation = (td.text||'').replace(/<[^>]+>/g,'').trim();
        const [surah, ayah] = sq.split(':');

        setResults([{
          verseKey: sq,
          surah,
          ayah,
          arabic,
          translation,
          edition: 'Quran Foundation MCP'
        }]);
      } 
      else {
        // Improved query for compound searches
        let searchQuery = sq;

        const compoundMap = {
          "honey healing": "honey OR healing OR shifa OR شفاء OR cure OR عسل",
          "honey": "honey OR عسل OR shifa",
          "mountains stability": "mountains OR stability OR rawasiy OR راسخ",
          "deep ocean darkness": "ocean OR deep sea OR darkness OR zulumat",
          "expanding universe": "expanding OR universe OR samaa",
        };

        for (const [key, improved] of Object.entries(compoundMap)) {
          if (sq.toLowerCase().includes(key.toLowerCase())) {
            searchQuery = improved;
            break;
          }
        }

        if (searchQuery === sq && sq.split(' ').length > 1) {
          const words = sq.split(/\s+/).filter(w => w.length > 2);
          if (words.length >= 2) searchQuery = words.join(" OR ");
        }

        const res = await fetch(`${PROXY}/api/search`, {
          method:'POST', 
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ query: searchQuery })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        let finalResults = data.results || [];

        // === RE-RANKING: Put most relevant first ===
        if (sq.toLowerCase().includes("honey") && sq.toLowerCase().includes("healing")) {
          finalResults.sort((a, b) => {
            const aHasShifa = (a.translation || '').toLowerCase().includes('heal') || 
                             (a.arabic || '').includes('شفاء');
            const bHasShifa = (b.translation || '').toLowerCase().includes('heal') || 
                             (b.arabic || '').includes('شفاء');
            if (aHasShifa && !bHasShifa) return -1;
            if (!aHasShifa && bHasShifa) return 1;
            return 0;
          });
        }

        setResults(finalResults);
      }
    } catch(e) {
      console.error(e);
      setError('Search failed. Make sure proxy is running.');
    }
    setLoading(false);
  }

  const displayedResults = showAll ? results : (results || []).slice(0, 5);
  const hasMore = results && results.length > 5;

  return (
    <div className="app">
      <div style={{ padding:'3rem 0 4rem' }}>
        <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--c)', marginBottom:'1rem', fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 8px var(--c)' }} />
          Semantic Search · quran.ai MCP · 6,236 Ayaat
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(32px,6vw,52px)', fontWeight:900, marginBottom:'0.5rem', lineHeight:1.1, background:'linear-gradient(135deg,#fff 40%,rgba(0,255,178,0.7))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          Ask the Quran
        </h1>
        <p style={{ fontSize:15, color:'var(--t3)', marginBottom:'2.5rem', fontWeight:300, lineHeight:1.6 }}>
          Search by meaning, concept, or topic — in any language.<br/>
          Click any result to expand audio, tafsir, and full translation.
        </p>

        {/* Search Input */}
        <div style={{ display:'flex', gap:10, marginBottom:'1.25rem', position:'relative' }}>
          <div style={{ position:'absolute', left:'1.1rem', top:'50%', transform:'translateY(-50%)', fontSize:16, pointerEvents:'none', opacity:0.4 }}>🔍</div>
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleSearch()}
            placeholder="honey healing, expanding universe, 16:69..."
            style={{ flex:1, padding:'1rem 1.2rem 1rem 3rem', background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:'50px', color:'var(--t1)', fontSize:15, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'all 0.2s' }}
            onFocus={e => { e.target.style.borderColor='rgba(0,255,178,0.3)'; e.target.style.boxShadow='0 0 0 3px rgba(0,255,178,0.06)'; }}
            onBlur={e => { e.target.style.borderColor='var(--b)'; e.target.style.boxShadow='none'; }}
          />
          <button onClick={() => handleSearch()} disabled={loading}
            style={{ padding:'1rem 1.75rem', background:loading?'rgba(0,255,178,0.4)':'var(--c)', color:'#000', border:'none', borderRadius:'50px', fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:loading?'not-allowed':'pointer', transition:'all 0.2s' }}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Suggestions */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:'3rem' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => { setQuery(s); handleSearch(s); }}
              style={{ padding:'0.4rem 1rem', background:'var(--card)', border:'1px solid var(--b)', borderRadius:'50px', color:'var(--t3)', fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}
              onMouseOver={e => { e.currentTarget.style.borderColor='rgba(0,255,178,0.3)'; e.currentTarget.style.color='var(--c)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor='var(--b)'; e.currentTarget.style.color='var(--t3)'; }}>
              {s}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'4rem 0', color:'var(--t3)' }}>
            <div style={{ width:32, height:32, border:'2px solid var(--b2)', borderTopColor:'var(--c)', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 1.2rem' }} />
            <div>Searching via quran.ai MCP...</div>
          </div>
        )}

        {error && (
          <div style={{ padding:'1rem 1.4rem', background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', color:'var(--c2)' }}>
            ⚠️ {error}
          </div>
        )}

        {results && results.length === 0 && (
          <div style={{ textAlign:'center', padding:'3rem', color:'var(--t3)' }}>
            No ayaat found for "{searched}".
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div>
            <div style={{ fontSize:11, color:'var(--t3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1.25rem' }}>
              {results.length} ayaat found · "{searched}" 
              {hasMore && !showAll && " • Showing top 5"}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {displayedResults.map((r, i) => <ResultCard key={i} r={r} />)}
            </div>

            {hasMore && !showAll && (
              <button 
                onClick={() => setShowAll(true)}
                style={{ marginTop:'1.5rem', padding:'0.75rem 2rem', background:'rgba(0,255,178,0.1)', border:'1px solid rgba(0,255,178,0.3)', borderRadius:'50px', color:'var(--c)', fontSize:14, cursor:'pointer' }}>
                Show All {results.length} Results
              </button>
            )}

            <div style={{ marginTop:'2rem', padding:'1rem 1.25rem', background:'var(--bg2)', borderRadius:'var(--r2)', border:'1px solid var(--b)', fontSize:11, color:'var(--t3)' }}>
              Powered by quran.ai MCP • Results are ranked by relevance where possible
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
