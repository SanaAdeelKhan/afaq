import { useState } from "react";
import AyahCard from "../components/AyahCard";
import StreakBar from "../components/StreakBar";
import SolarHero from "../components/SolarHero";
import { horizons, waitingNote } from "../data/horizons";

const TABS = [
  { id:"confirmed",   label:"Confirmed",    count:horizons.confirmed.length  },
  { id:"approaching", label:"Approaching",  count:horizons.approaching.length},
  { id:"waiting",     label:"Still Waiting",count:horizons.waiting.length    },
];

export default function Home() {
  const [active, setActive]     = useState("confirmed");
  const [expanded, setExpanded] = useState(null);

  function toggle(id) {
    setExpanded(prev => prev === id ? null : id);
    const count = parseInt(localStorage.getItem("afaq_explored") || "0");
    localStorage.setItem("afaq_explored", count + 1);
  }

  function renderList(ayahs, type) {
    const color = type==="confirmed"?"var(--c)":type==="approaching"?"var(--c2)":"var(--c3)";
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {ayahs.map((ayah, i) => (
          <div key={ayah.id}>
            {expanded !== ayah.id && (
              <div
                onClick={() => toggle(ayah.id)}
                style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"0.9rem 1.25rem",
                  background:"var(--card)",
                  border:"1px solid var(--b)",
                  borderLeft:`3px solid ${color}`,
                  borderRadius:"var(--r)",
                  cursor:"pointer",
                  transition:"all 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.background="var(--card-h)"; e.currentTarget.style.transform="translateX(4px)"; }}
                onMouseOut={e => { e.currentTarget.style.background="var(--card)"; e.currentTarget.style.transform="none"; }}
              >
                <div style={{ width:26, height:26, borderRadius:"50%", background:`rgba(${type==="confirmed"?"0,255,178":type==="approaching"?"245,158,11":"129,140,248"},0.1)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, color, flexShrink:0 }}>
                  {i+1}
                </div>
                <div style={{ fontSize:18, flexShrink:0 }}>{ayah.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"var(--t1)", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {ayah.topic}
                  </div>
                  <div style={{ fontSize:11, color:"var(--t3)", display:"flex", alignItems:"center", gap:8 }}>
                    <span>{ayah.surah} · {ayah.verseKey}</span>
                    <span style={{ padding:"1px 7px", background:`rgba(${type==="confirmed"?"0,255,178":type==="approaching"?"245,158,11":"129,140,248"},0.07)`, borderRadius:20, color, fontSize:10 }}>
                      {ayah.gapLabel}
                    </span>
                  </div>
                </div>
                <div style={{ fontFamily:"'Tajawal',serif", fontSize:14, direction:"rtl", color:"var(--t3)", maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flexShrink:0 }}>
                  {ayah.arabic.slice(0,25)}...
                </div>
                <div style={{ fontSize:14, color:"var(--t3)", flexShrink:0 }}>›</div>
              </div>
            )}

            {expanded === ayah.id && (
              <div style={{ position:"relative" }}>
                <button onClick={() => setExpanded(null)}
                  style={{ position:"absolute", top:12, right:12, zIndex:10, width:28, height:28, borderRadius:"50%", background:"var(--bg2)", border:"1px solid var(--b)", color:"var(--t3)", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
                  ×
                </button>
                <AyahCard ayah={ayah} type={type} defaultOpen={true} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="app" style={{ paddingTop:"1rem" }}>

      {/* Hero text */}
      <div style={{ textAlign:"center", padding:"2.5rem 1rem 0" }}>
        <div style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--c)", marginBottom:"0.75rem", fontWeight:500 }}>
          ✦ Quran · Science · Horizons ✦
        </div>
        <div style={{ fontFamily:"'Tajawal',serif", fontSize:"clamp(16px,3vw,22px)", direction:"rtl", color:"rgba(255,255,255,0.4)", marginBottom:"0.5rem" }}>
          سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ
        </div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(52px,12vw,100px)", fontWeight:900, letterSpacing:"-0.04em", lineHeight:1, background:"linear-gradient(160deg,#fff 20%,rgba(0,255,178,0.8) 60%,rgba(129,140,248,0.6))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:"0.25rem" }}>
          Afaq
        </div>
        <div style={{ fontFamily:"'Tajawal',serif", fontSize:20, fontWeight:300, color:"var(--t3)", direction:"rtl", marginBottom:"0.5rem" }}>
          آفاق · Horizons
        </div>
        <div style={{ fontSize:15, color:"var(--t2)", fontWeight:300, lineHeight:1.7, marginBottom:"1.5rem" }}>
          The Quran spoke 1,400 years ago.<br/>
          Science is still catching up.
        </div>
      </div>

      {/* Solar System */}
      <SolarHero onExplore={() => document.getElementById('explore')?.scrollIntoView({ behavior:'smooth' })} />

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat"><div className="stat-num c1">{horizons.confirmed.length}</div><div className="stat-label">Confirmed</div></div>
        <div className="stat"><div className="stat-num c2">{horizons.approaching.length}</div><div className="stat-label">Approaching</div></div>
        <div className="stat"><div className="stat-num c3">{horizons.waiting.length}</div><div className="stat-label">Still Waiting</div></div>
      </div>

      <div id="explore">
        <StreakBar />

        <div className="tabs">
          {TABS.map(tab => (
            <button key={tab.id}
              className={`tab ${active===tab.id?`active-${tab.id}`:""}`}
              onClick={() => { setActive(tab.id); setExpanded(null); }}>
              <div className={`tab-dot dot-${tab.id}`} />
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className={`panel ${active==="confirmed"?"active":""}`}>
          <div className="section-head">
            <div className="section-title">Science arrived.</div>
            <div className="section-subtitle">Click any ayah to explore the full science, audio, and tafsir.</div>
          </div>
          {renderList(horizons.confirmed, "confirmed")}
        </div>

        <div className={`panel ${active==="approaching"?"active":""}`}>
          <div className="section-head">
            <div className="section-title">Science is getting warm.</div>
            <div className="section-subtitle">Click any ayah to explore what science has found so far.</div>
          </div>
          {renderList(horizons.approaching, "approaching")}
        </div>

        <div className={`panel ${active==="waiting"?"active":""}`}>
          <div className="section-head">
            <div className="section-title">Science has no map here.</div>
            <div className="section-subtitle">Click any ayah to explore the frontier.</div>
          </div>
          <div className="waiting-note">
            <div className="wn-arabic">{waitingNote.arabic}</div>
            <div className="wn-trans">"{waitingNote.translation}"</div>
            <div className="wn-ref">{waitingNote.reference}</div>
          </div>
          {renderList(horizons.waiting, "waiting")}
        </div>
      </div>

      <div className="footer-line">
        <div className="footer-arabic">وَفِي أَنفُسِهِمْ</div>
        <div className="footer-text">AFAQ · آفاق · Quran Foundation Hackathon 2026</div>
      </div>
    </div>
  );
}
