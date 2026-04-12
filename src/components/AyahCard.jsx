import { useState, useRef } from "react";
import { fetchAudio } from "../services/quranApi";
import { mcpTafsir } from "../services/mcpSearch";
import { saveReflection, addBookmark, isLoggedIn } from "../services/userApi";

export default function AyahCard({ ayah, type, defaultOpen = false }) {
  const [open, setOpen]             = useState(defaultOpen);
  const [audioUrl, setAudioUrl]     = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying]       = useState(false);
  const [progress, setProgress]     = useState(0);
  const [tafsir, setTafsir]         = useState(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirSource, setTafsirSource]   = useState('en-ibn-kathir');
  const [reflection, setReflection] = useState('');
  const [saved, setSaved]           = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const audioRef = useRef(null);

  const TAFSIR_OPTIONS = [
    { id:'en-ibn-kathir',       label:'Ibn Kathir (EN)' },
    { id:'en-maariful-quran',   label:"Maariful Qur'an" },
    { id:'ar-tabari',           label:'Al-Tabari (AR)'  },
    { id:'ar-saadi',            label:'Al-Saadi (AR)'   },
  ];

  // auto-load when defaultOpen
  useState(() => {
    if (defaultOpen) {
      loadAudio();
      loadTafsir(tafsirSource);
    }
  });

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && !audioUrl) loadAudio();
    if (next && !tafsir)   loadTafsir(tafsirSource);
  }

  async function loadAudio() {
    setAudioLoading(true);
    try {
      const url = await fetchAudio(ayah.verseKey);
      setAudioUrl(url);
    } catch { setAudioUrl(null); }
    setAudioLoading(false);
  }

  async function loadTafsir(edition) {
    setTafsirLoading(true);
    setTafsir(null);
    try {
      const text = await mcpTafsir(ayah.verseKey, edition);
      setTafsir(text || ayah.tafsirNote);
    } catch { setTafsir(ayah.tafsirNote); }
    setTafsirLoading(false);
  }

  function switchTafsir(edition) {
    setTafsirSource(edition);
    loadTafsir(edition);
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

  async function handleSave() {
    if (!reflection.trim()) return;
    try { if (isLoggedIn()) await saveReflection(ayah.verseKey, reflection); } catch {}
    // save locally too
    const notes = JSON.parse(localStorage.getItem('afaq_notes') || '{}');
    notes[ayah.verseKey] = { text: reflection, date: new Date().toISOString(), topic: ayah.topic };
    localStorage.setItem('afaq_notes', JSON.stringify(notes));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleBookmark() {
    try { if (isLoggedIn()) await addBookmark(ayah.verseKey); } catch {}
    const bookmarks = JSON.parse(localStorage.getItem('afaq_bookmarks') || '[]');
    if (!bookmarks.includes(ayah.verseKey)) {
      bookmarks.push(ayah.verseKey);
      localStorage.setItem('afaq_bookmarks', JSON.stringify(bookmarks));
    }
    setBookmarked(true);
  }

  const color = type==='confirmed'?'var(--c)':type==='approaching'?'var(--c2)':'var(--c3)';

  return (
    <div className={`card ${type}`} onClick={!defaultOpen ? handleOpen : undefined}
      style={{ cursor: defaultOpen ? 'default' : 'pointer' }}>

      <div className={`card-left left-${type}`} />

      <div className="card-top">
        <div className="card-meta">
          <span className={`card-ref ref-${type}`}>{ayah.surah} · {ayah.verseKey}</span>
          <span className={`gap-badge badge-${type}`}>
            <span className={`badge-dot bdot-${type}`} />
            {ayah.gapLabel}
          </span>
        </div>
        <div className="card-arabic">{ayah.arabic}</div>
        <div className="card-translation">{ayah.translation}</div>
      </div>

      <div className="card-divider" />

      <div className="card-bottom" onClick={e => e.stopPropagation()}>
        <div className={`disc-icon icon-${type}`}>{ayah.icon}</div>
        <div className="disc-body">
          <div className="disc-label">
            {type==='confirmed'?'Confirmed by science':type==='approaching'?'Science approaching':'Still waiting'}
          </div>
          <div className="disc-desc">
            <strong>{ayah.discoveryTitle}. </strong>
            {ayah.discoveryDesc}
          </div>
        </div>
        {!defaultOpen && (
          <button className="expand-btn" onClick={handleOpen}>
            {open ? '−' : '+'}
          </button>
        )}
      </div>

      {(open || defaultOpen) && (
        <div className="card-expanded" onClick={e => e.stopPropagation()}>

          {/* Gap counter */}
          {ayah.gapYears && (
            <div className="gap-counter">
              <div className={`gap-num gn-${type}`}>{ayah.gapYears.toLocaleString()}</div>
              <div className="gap-counter-text">
                <div className="gap-years-label">Years of human ignorance</div>
                <div className="gap-desc">Between revelation and scientific confirmation</div>
              </div>
            </div>
          )}

          {/* Audio */}
          <div className="audio-player">
            {audioLoading ? (
              <span className="audio-loading"><span className="spinner"/> Loading recitation...</span>
            ) : audioUrl ? (
              <>
                <audio ref={audioRef} src={audioUrl}
                  onEnded={() => { setPlaying(false); setProgress(0); }}
                  onTimeUpdate={onTimeUpdate} />
                <button className={`audio-play-btn play-${type}`} onClick={toggleAudio}>
                  {playing ? '⏸' : '▶'}
                </button>
                <div className="audio-progress">
                  <div className="audio-progress-fill" style={{ width:`${progress}%`, background:color }} />
                </div>
                <span className="audio-label">Mishary Rashid · {ayah.verseKey}</span>
              </>
            ) : (
              <span className="audio-loading">Audio unavailable</span>
            )}
          </div>

          {/* Tafsir */}
          <div className="tafsir-box">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.6rem' }}>
              <div className="box-label">
                <div style={{ width:6, height:6, borderRadius:'50%', background:color, boxShadow:`0 0 6px ${color}`, marginRight:6, display:'inline-block' }}/>
                Tafsir · quran.ai MCP
              </div>
              <select value={tafsirSource} onChange={e => switchTafsir(e.target.value)}
                onClick={e => e.stopPropagation()}
                style={{ fontSize:11, background:'var(--bg3)', border:'1px solid var(--b)', borderRadius:6, color:'var(--t3)', padding:'2px 6px', fontFamily:'inherit', cursor:'pointer' }}>
                {TAFSIR_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
            {tafsirLoading
              ? <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--t3)', fontSize:13 }}>
                  <span className="spinner"/> Fetching from quran.ai...
                </div>
              : <div className="tafsir-text">{tafsir}</div>
            }
          </div>

          {/* Reflection */}
          <div className="reflection-box">
            <div className="box-label">Your Reflection</div>
            <div className="reflection-prompt">"{ayah.reflectionPrompt}"</div>
            <textarea className="reflection-input"
              placeholder="What does this make you feel? Write freely..."
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
            <div className="reflection-actions">
              <button className={`save-btn ${saved?'saved':''}`} onClick={handleSave}>
                {saved ? 'Saved ✓' : 'Save to journal'}
              </button>
              <button className={`bookmark-btn ${bookmarked?'bookmarked':''}`} onClick={handleBookmark}>
                {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
