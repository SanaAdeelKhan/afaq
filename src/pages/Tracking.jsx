import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HORIZON_COLORS = {
  confirmed:  { color:'var(--c)',  bg:'rgba(0,255,178,0.07)',  label:'Confirmed'    },
  approaching:{ color:'var(--c2)', bg:'rgba(245,158,11,0.07)', label:'Approaching'  },
  waiting:    { color:'var(--c3)', bg:'rgba(129,140,248,0.07)',label:'Still Waiting' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function Tracking() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('journal');
  const [notes, setNotes]       = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [searched, setSearched] = useState([]);
  const [researched, setResearched] = useState([]);
  const [streak, setStreak]     = useState(0);
  const [editingKey, setEditingKey] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    // Load all local data
    setNotes(JSON.parse(localStorage.getItem('afaq_notes') || '{}'));
    setBookmarks(JSON.parse(localStorage.getItem('afaq_bookmarks') || '[]'));
    setSearched(JSON.parse(localStorage.getItem('afaq_searched') || '[]'));
    setResearched(JSON.parse(localStorage.getItem('afaq_researched') || '[]'));
    setStreak(parseInt(localStorage.getItem('afaq_streak') || '0'));
  }, []);

  function deleteNote(key) {
    const updated = { ...notes };
    delete updated[key];
    setNotes(updated);
    localStorage.setItem('afaq_notes', JSON.stringify(updated));
  }

  function saveEdit(key) {
    const updated = { ...notes, [key]: { ...notes[key], text: editText } };
    setNotes(updated);
    localStorage.setItem('afaq_notes', JSON.stringify(updated));
    setEditingKey(null);
  }

  function removeBookmark(key) {
    const updated = bookmarks.filter(b => b !== key);
    setBookmarks(updated);
    localStorage.setItem('afaq_bookmarks', JSON.stringify(updated));
  }

  function clearAll() {
    if (!confirm('Clear all tracking data?')) return;
    localStorage.removeItem('afaq_notes');
    localStorage.removeItem('afaq_bookmarks');
    localStorage.removeItem('afaq_searched');
    localStorage.removeItem('afaq_researched');
    setNotes({}); setBookmarks([]); setSearched([]); setResearched([]);
  }

  const totalActivity = Object.keys(notes).length + bookmarks.length + researched.length;

  const TABS = [
    { id:'journal',    label:'📝 Journal',    count: Object.keys(notes).length    },
    { id:'bookmarks',  label:'★ Bookmarks',   count: bookmarks.length             },
    { id:'researched', label:'🔬 Researched',  count: researched.length            },
    { id:'searched',   label:'🔍 Searched',    count: searched.length              },
  ];

  return (
    <div className="app">
      <div style={{ padding:'3rem 0 4rem' }}>

        {/* Header */}
        <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--c)', marginBottom:'1rem', fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 8px var(--c)' }} />
          Your Quran Journey
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,5vw,46px)', fontWeight:900, marginBottom:'0.75rem', lineHeight:1.1, background:'linear-gradient(135deg,#fff 30%,rgba(0,255,178,0.8) 70%,rgba(129,140,248,0.6))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          Tracking & Journal
        </h1>

        <p style={{ fontSize:15, color:'var(--t3)', marginBottom:'2.5rem', fontWeight:300, lineHeight:1.75 }}>
          Every ayah you explore, research, or reflect on — recorded here.
        </p>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'2rem' }}>
          {[
            { label:'Day Streak',  value:streak,                         color:'var(--c)',  icon:'🔥' },
            { label:'Reflections', value:Object.keys(notes).length,      color:'var(--c)',  icon:'📝' },
            { label:'Bookmarks',   value:bookmarks.length,               color:'var(--c2)', icon:'★'  },
            { label:'Researched',  value:researched.length,              color:'var(--c3)', icon:'🔬' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--card)', border:'1px solid var(--b)', borderRadius:'var(--r)', padding:'1rem', textAlign:'center' }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--t3)', marginTop:4, letterSpacing:'0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {totalActivity === 0 && (
          <div style={{ textAlign:'center', padding:'4rem 2rem', background:'var(--card)', border:'1px solid var(--b)', borderRadius:'var(--r)' }}>
            <div style={{ fontSize:40, marginBottom:'1rem' }}>🌱</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'var(--t1)', marginBottom:'0.75rem' }}>
              Your journey hasn't started yet
            </div>
            <div style={{ fontSize:14, color:'var(--t3)', marginBottom:'2rem', fontWeight:300, lineHeight:1.7 }}>
              Explore ayaat on the Horizons page, search for topics,<br/>
              or research any ayah scientifically — it all appears here.
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => navigate('/')}
                style={{ padding:'0.7rem 1.5rem', background:'var(--c)', color:'#000', border:'none', borderRadius:'50px', fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>
                Explore Horizons
              </button>
              <button onClick={() => navigate('/research')}
                style={{ padding:'0.7rem 1.5rem', background:'none', color:'var(--t2)', border:'1px solid var(--b)', borderRadius:'50px', fontSize:14, fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>
                Start Research
              </button>
            </div>
          </div>
        )}

        {totalActivity > 0 && (
          <>
            {/* Tabs */}
            <div style={{ display:'flex', gap:6, background:'var(--bg2)', padding:5, borderRadius:14, border:'1px solid var(--b)', marginBottom:'2rem', overflowX:'auto' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ flex:1, minWidth:100, padding:'0.65rem 0.75rem', background:tab===t.id?'rgba(0,255,178,0.08)':'none', border:`1px solid ${tab===t.id?'rgba(0,255,178,0.2)':'transparent'}`, borderRadius:10, color:tab===t.id?'var(--c)':'var(--t3)', fontSize:13, fontWeight:500, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  {t.label}
                  {t.count > 0 && (
                    <span style={{ fontSize:10, background:tab===t.id?'rgba(0,255,178,0.15)':'var(--bg3)', color:tab===t.id?'var(--c)':'var(--t3)', padding:'1px 6px', borderRadius:10 }}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── JOURNAL TAB ── */}
            {tab === 'journal' && (
              <div>
                <div style={{ fontSize:11, color:'var(--t3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1.25rem', fontWeight:500 }}>
                  {Object.keys(notes).length} reflections saved
                </div>

                {Object.keys(notes).length === 0 ? (
                  <div style={{ textAlign:'center', padding:'3rem', color:'var(--t3)', fontSize:14, fontWeight:300 }}>
                    No reflections yet. Expand any ayah and write in the reflection box.
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {Object.entries(notes).map(([key, note]) => (
                      <div key={key} style={{ background:'var(--card)', border:'1px solid var(--b)', borderRadius:'var(--r)', overflow:'hidden', position:'relative' }}>
                        <div style={{ position:'absolute', left:0, top:16, bottom:16, width:2, background:'var(--c)', borderRadius:2 }} />
                        <div style={{ padding:'1.25rem 1.25rem 1rem 1.6rem' }}>
                          {/* Header */}
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--c)' }}>
                                {key}
                              </span>
                              {note.topic && (
                                <span style={{ fontSize:11, color:'var(--t3)', padding:'2px 8px', background:'var(--bg2)', borderRadius:10, border:'1px solid var(--b)' }}>
                                  {note.topic}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize:11, color:'var(--t3)' }}>{timeAgo(note.date)}</span>
                          </div>

                          {/* Content */}
                          {editingKey === key ? (
                            <div>
                              <textarea
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                style={{ width:'100%', minHeight:80, padding:'0.6rem 0.75rem', background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:8, color:'var(--t1)', fontSize:14, fontFamily:"'DM Sans',sans-serif", resize:'none', outline:'none' }}
                              />
                              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                                <button onClick={() => saveEdit(key)}
                                  style={{ padding:'0.4rem 1rem', background:'var(--c)', color:'#000', border:'none', borderRadius:'50px', fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>
                                  Save
                                </button>
                                <button onClick={() => setEditingKey(null)}
                                  style={{ padding:'0.4rem 1rem', background:'none', color:'var(--t3)', border:'1px solid var(--b)', borderRadius:'50px', fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize:14, color:'var(--t2)', lineHeight:1.75, fontWeight:300, fontStyle:'italic' }}>
                              "{note.text}"
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {editingKey !== key && (
                          <div style={{ padding:'0.5rem 1.25rem 0.75rem 1.6rem', display:'flex', gap:8 }}>
                            <button onClick={() => navigate(`/research?ayah=${key}`)}
                              style={{ fontSize:11, color:'var(--c)', background:'rgba(0,255,178,0.07)', border:'1px solid rgba(0,255,178,0.15)', borderRadius:'50px', padding:'0.3rem 0.75rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                              View Ayah
                            </button>
                            <button onClick={() => { setEditingKey(key); setEditText(note.text); }}
                              style={{ fontSize:11, color:'var(--t3)', background:'none', border:'1px solid var(--b)', borderRadius:'50px', padding:'0.3rem 0.75rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                              Edit
                            </button>
                            <button onClick={() => deleteNote(key)}
                              style={{ fontSize:11, color:'rgba(255,100,100,0.7)', background:'none', border:'1px solid rgba(255,100,100,0.2)', borderRadius:'50px', padding:'0.3rem 0.75rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── BOOKMARKS TAB ── */}
            {tab === 'bookmarks' && (
              <div>
                <div style={{ fontSize:11, color:'var(--t3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1.25rem', fontWeight:500 }}>
                  {bookmarks.length} ayaat bookmarked
                </div>
                {bookmarks.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'3rem', color:'var(--t3)', fontSize:14, fontWeight:300 }}>
                    No bookmarks yet. Click ☆ Bookmark on any ayah card.
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {bookmarks.map(key => (
                      <div key={key} style={{ background:'var(--card)', border:'1px solid var(--b)', borderRadius:'var(--r)', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:12, position:'relative' }}>
                        <div style={{ position:'absolute', left:0, top:12, bottom:12, width:2, background:'var(--c2)', borderRadius:2 }} />
                        <div style={{ paddingLeft:8, flex:1 }}>
                          <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--c2)', marginBottom:4 }}>
                            {key}
                          </div>
                          <div style={{ fontSize:13, color:'var(--t3)', fontWeight:300 }}>Bookmarked ayah</div>
                        </div>
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={() => navigate(`/search?q=${key}`)}
                            style={{ fontSize:11, color:'var(--c)', background:'rgba(0,255,178,0.07)', border:'1px solid rgba(0,255,178,0.15)', borderRadius:'50px', padding:'0.3rem 0.75rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                            Explore
                          </button>
                          <button onClick={() => navigate(`/research?ayah=${key}`)}
                            style={{ fontSize:11, color:'var(--c3)', background:'rgba(129,140,248,0.07)', border:'1px solid rgba(129,140,248,0.15)', borderRadius:'50px', padding:'0.3rem 0.75rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                            Research
                          </button>
                          <button onClick={() => removeBookmark(key)}
                            style={{ fontSize:11, color:'rgba(255,100,100,0.7)', background:'none', border:'1px solid rgba(255,100,100,0.2)', borderRadius:'50px', padding:'0.3rem 0.75rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── RESEARCHED TAB ── */}
            {tab === 'researched' && (
              <div>
                <div style={{ fontSize:11, color:'var(--t3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1.25rem', fontWeight:500 }}>
                  {researched.length} ayaat researched scientifically
                </div>
                {researched.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'3rem', color:'var(--t3)', fontSize:14, fontWeight:300 }}>
                    No research yet. Go to Research page and analyse any ayah.
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {researched.map((item, i) => (
                      <div key={i} style={{ background:'var(--card)', border:'1px solid var(--b)', borderRadius:'var(--r)', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:12, position:'relative' }}>
                        <div style={{ position:'absolute', left:0, top:12, bottom:12, width:2, background:'var(--c3)', borderRadius:2 }} />
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(129,140,248,0.1)', border:'1px solid rgba(129,140,248,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                          🔬
                        </div>
                        <div style={{ flex:1, paddingLeft:4 }}>
                          <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--c3)', marginBottom:4 }}>
                            {item.key || item}
                          </div>
                          <div style={{ fontSize:13, color:'var(--t3)', fontWeight:300 }}>
                            {item.translation ? item.translation.slice(0,80)+'...' : 'Scientific analysis completed'}
                          </div>
                          {item.date && (
                            <div style={{ fontSize:11, color:'var(--t3)', marginTop:3 }}>{timeAgo(item.date)}</div>
                          )}
                        </div>
                        <button onClick={() => navigate(`/research?ayah=${item.key||item}`)}
                          style={{ fontSize:11, color:'var(--c3)', background:'rgba(129,140,248,0.07)', border:'1px solid rgba(129,140,248,0.15)', borderRadius:'50px', padding:'0.3rem 0.75rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' }}>
                          Research Again
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SEARCHED TAB ── */}
            {tab === 'searched' && (
              <div>
                <div style={{ fontSize:11, color:'var(--t3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1.25rem', fontWeight:500 }}>
                  {searched.length} searches made
                </div>
                {searched.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'3rem', color:'var(--t3)', fontSize:14, fontWeight:300 }}>
                    No searches yet. Go to Search page and explore.
                  </div>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {[...new Set(searched)].reverse().map((q, i) => (
                      <button key={i} onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)}
                        style={{ padding:'0.5rem 1rem', background:'var(--card)', border:'1px solid var(--b)', borderRadius:'50px', color:'var(--t2)', fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:6 }}
                        onMouseOver={e => { e.currentTarget.style.borderColor='rgba(0,255,178,0.3)'; e.currentTarget.style.color='var(--c)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor='var(--b)'; e.currentTarget.style.color='var(--t2)'; }}>
                        <span style={{ fontSize:10, opacity:0.5 }}>🔍</span>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Clear all */}
            <div style={{ marginTop:'3rem', textAlign:'center' }}>
              <button onClick={clearAll}
                style={{ fontSize:12, color:'rgba(255,100,100,0.5)', background:'none', border:'1px solid rgba(255,100,100,0.15)', borderRadius:'50px', padding:'0.5rem 1.5rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.color='rgba(255,100,100,0.8)'}
                onMouseOut={e => e.currentTarget.style.color='rgba(255,100,100,0.5)'}>
                Clear all data
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
