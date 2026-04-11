import { useState, useRef } from "react";
import { fetchAudio, fetchTafsir } from "../services/quranApi";
import { saveReflection, addBookmark, isLoggedIn } from "../services/userApi";

export default function AyahCard({ ayah, type }) {
  const [open, setOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tafsirText, setTafsirText] = useState(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const audioRef = useRef(null);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && !audioUrl) loadAudio();
    if (next && !tafsirText) loadTafsir();
  }

  async function loadAudio() {
    setAudioLoading(true);
    try {
      const url = await fetchAudio(ayah.verseKey);
      setAudioUrl(url);
    } catch { setAudioUrl(null); }
    setAudioLoading(false);
  }

  async function loadTafsir() {
    setTafsirLoading(true);
    try {
      const data = await fetchTafsir(ayah.verseKey);
      const raw = data?.tafsirs?.[0]?.text || "";
      const clean = raw.replace(/<[^>]+>/g,"").slice(0,420)+(raw.length>420?"...":"");
      setTafsirText(clean || ayah.tafsirNote);
    } catch { setTafsirText(ayah.tafsirNote); }
    setTafsirLoading(false);
  }

  function toggleAudio() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }

  function onTimeUpdate() {
    const a = audioRef.current;
    if (a && a.duration) setProgress((a.currentTime / a.duration) * 100);
  }

  async function handleSave() {
    if (!reflection.trim()) return;
    try { if (isLoggedIn()) await saveReflection(ayah.verseKey, reflection); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleBookmark() {
    try { if (isLoggedIn()) await addBookmark(ayah.verseKey); } catch {}
    setBookmarked(true);
  }

  const gapNum = ayah.gapYears
    ? ayah.gapYears.toLocaleString()
    : null;

  return (
    <div className={`card ${type}`} onClick={handleOpen}>

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
            {type==="confirmed"?"Confirmed by science":type==="approaching"?"Science approaching":"Still waiting"}
          </div>
          <div className="disc-desc">
            <strong>{ayah.discoveryTitle}. </strong>
            {ayah.discoveryDesc}
          </div>
        </div>
        <button className="expand-btn" onClick={handleOpen}>
          {open ? "−" : "+"}
        </button>
      </div>

      {open && (
        <div className="card-expanded" onClick={e => e.stopPropagation()}>

          {/* Gap counter */}
          {gapNum && (
            <div className="gap-counter">
              <div className={`gap-num gn-${type}`}>{gapNum}</div>
              <div className="gap-counter-text">
                <div className="gap-years-label">Years of human ignorance</div>
                <div className="gap-desc">Between revelation and scientific confirmation</div>
              </div>
            </div>
          )}

          {/* Audio */}
          <div className="audio-player">
            {audioLoading ? (
              <span className="audio-loading">
                <span className="spinner" /> Loading recitation...
              </span>
            ) : audioUrl ? (
              <>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => { setPlaying(false); setProgress(0); }}
                  onTimeUpdate={onTimeUpdate}
                />
                <button className={`audio-play-btn play-${type}`} onClick={toggleAudio}>
                  {playing ? "⏸" : "▶"}
                </button>
                <div className="audio-progress">
                  <div className="audio-progress-fill" style={{ width:`${progress}%` }} />
                </div>
                <span className="audio-label">Mishary Rashid · {ayah.verseKey}</span>
              </>
            ) : (
              <span className="audio-loading">Audio unavailable</span>
            )}
          </div>

          {/* Tafsir */}
          <div className="tafsir-box">
            <div className="box-label">Tafsir Ibn Kathir</div>
            {tafsirLoading
              ? <span className="spinner" />
              : <div className="tafsir-text">{tafsirText}</div>
            }
          </div>

          {/* Reflection */}
          <div className="reflection-box">
            <div className="box-label">Your Reflection</div>
            <div className="reflection-prompt">"{ayah.reflectionPrompt}"</div>
            <textarea
              className="reflection-input"
              placeholder="What does this make you feel? Write freely..."
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
            <div className="reflection-actions">
              <button
                className={`save-btn ${saved?"saved":""}`}
                onClick={handleSave}
              >
                {saved ? "Saved ✓" : "Save to journal"}
              </button>
              <button
                className={`bookmark-btn ${bookmarked?"bookmarked":""}`}
                onClick={handleBookmark}
              >
                {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
