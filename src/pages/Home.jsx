import { useState } from "react";
import AyahCard from "../components/AyahCard";
import StreakBar from "../components/StreakBar";
import { horizons, waitingNote } from "../data/horizons";

const TABS = [
  { id:"confirmed",  label:"Confirmed",    count:horizons.confirmed.length,  color:"var(--c)",  dot:"dot-confirmed"  },
  { id:"approaching",label:"Approaching",  count:horizons.approaching.length,color:"var(--c2)", dot:"dot-approaching"},
  { id:"waiting",    label:"Still Waiting",count:horizons.waiting.length,    color:"var(--c3)", dot:"dot-waiting"    },
];

const TOPIC_ICONS = {
  confirmed:  "✅",
  approaching:"🌅",
  waiting:    "🌌",
};

export default function Home() {
  const [active, setActive]     = useState("confirmed");
  const [expanded, setExpanded] = useState(null);

  function toggle(id) {
    setExpanded(prev => prev === id ? null : id);
    // mark as explored
    const count = parseInt(localStorage.getItem("afaq_explored") || "0");
    localStorage.setItem("afaq_explored", count + 1);
  }

  function renderList(ayahs, type) {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {ayahs.map((ayah, i) => (
          <div key={ayah.id}>
            {/* ── LIST ROW ── */}
            {expanded !== ayah.id && (
              <div
                onClick={() => toggle(ayah.id)}
                style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"1rem 1.25rem",
                  background:"var(--card)",
                  border:"1px solid var(--b)",
                  borderLeft:`3px solid ${type==="confirmed"?"var(--c)":type==="approaching"?"var(--c2)":"var(--c3)"}`,
                  borderRadius:"var(--r)",
                  cursor:"pointer",
                  transition:"all 0.2s",
                  position:"relative",
                  overflow:"hidden",
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background="var(--card-h)";
                  e.currentTarget.style.borderColor=type==="confirmed"?"rgba(0,255,178,0.3)":type==="approaching"?"rgba(245,158,11,0.3)":"rgba(129,140,248,0.3)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background="var(--card)";
                  e.currentTarget.style.borderColor="var(--b)";
                }}
              >
                {/* Index number */}
                <div style={{
                  width:28, height:28, borderRadius:"50%",
                  background: type==="confirmed"?"rgba(0,255,178,0.08)":type==="approaching"?"rgba(245,158,11,0.08)":"rgba(129,140,248,0.08)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:600,
                  color: type==="confirmed"?"var(--c)":type==="approaching"?"var(--c2)":"var(--c3)",
                  flexShrink:0
                }}>
                  {i+1}
                </div>

                {/* Icon */}
                <div style={{ fontSize:18, flexShrink:0 }}>{ayah.icon}</div>

                {/* Main info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"var(--t1)", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {ayah.topic}
                  </div>
                  <div style={{ fontSize:11, color:"var(--t3)", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span>{ayah.surah} · {ayah.verseKey}</span>
                    <span style={{ width:3, height:3, borderRadius:"50%", background:"var(--t3)", display:"inline-block" }} />
                    <span style={{
                      padding:"1px 8px",
                      background: type==="confirmed"?"rgba(0,255,178,0.07)":type==="approaching"?"rgba(245,158,11,0.07)":"rgba(129,140,248,0.07)",
                      borderRadius:20,
                      color: type==="confirmed"?"var(--c)":type==="approaching"?"var(--c2)":"var(--c3)",
                      fontSize:10
                    }}>
                      {ayah.gapLabel}
                    </span>
                  </div>
                </div>

                {/* Arabic preview */}
                <div style={{
                  fontFamily:"'Tajawal',serif",
                  fontSize:15, direction:"rtl",
                  color:"var(--t3)",
                  maxWidth:120,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  flexShrink:0,
                  display: window.innerWidth < 500 ? "none" : "block"
                }}>
                  {ayah.arabic.slice(0,30)}...
                </div>

                {/* Expand arrow */}
                <div style={{ fontSize:14, color:"var(--t3)", flexShrink:0 }}>›</div>
              </div>
            )}

            {/* ── EXPANDED CARD ── */}
            {expanded === ayah.id && (
              <div style={{ position:"relative" }}>
                {/* Collapse button */}
                <button
                  onClick={() => setExpanded(null)}
                  style={{
                    position:"absolute", top:12, right:12, zIndex:10,
                    width:28, height:28, borderRadius:"50%",
                    background:"var(--bg2)", border:"1px solid var(--b)",
                    color:"var(--t3)", fontSize:16, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"inherit"
                  }}
                >
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
    <div className="app" style={{ paddingTop:"2rem" }}>

      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">✦ Quran · Science · Horizons ✦</div>
        <div className="hero-arabic-small">سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ</div>
        <div className="hero-trans">"We will show them Our signs on the horizons and within themselves —</div>
        <div className="hero-trans">until it becomes clear to them that it is the Truth."</div>
        <div className="hero-ref">Surah Fussilat · 41:53</div>
        <div className="app-name">Afaq</div>
        <div className="app-sub">آفاق · Horizons</div>
        <div className="app-tagline">
          The Quran spoke 1,400 years ago. Science is still catching up.<br/>
          Some horizons, humanity hasn't reached yet.
        </div>
        <div className="hero-cta">
          <button className="btn-primary" onClick={() => document.getElementById('explore')?.scrollIntoView({behavior:'smooth'})}>
            Explore the Horizons
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat"><div className="stat-num c1">{horizons.confirmed.length}</div><div className="stat-label">Confirmed</div></div>
        <div className="stat"><div className="stat-num c2">{horizons.approaching.length}</div><div className="stat-label">Approaching</div></div>
        <div className="stat"><div className="stat-num c3">{horizons.waiting.length}</div><div className="stat-label">Still Waiting</div></div>
      </div>

      <div id="explore">
        <StreakBar />

        {/* Tabs */}
        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab ${active===tab.id ? `active-${tab.id}` : ""}`}
              onClick={() => { setActive(tab.id); setExpanded(null); }}
            >
              <div className={`tab-dot ${tab.dot}`} />
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Confirmed */}
        <div className={`panel ${active==="confirmed"?"active":""}`}>
          <div className="section-head">
            <div className="section-title">Science arrived.</div>
            <div className="section-subtitle">
              These ayaat described realities humanity took centuries to discover.<br/>
              Click any ayah to explore the full science, audio, and tafsir.
            </div>
          </div>
          {renderList(horizons.confirmed, "confirmed")}
        </div>

        {/* Approaching */}
        <div className={`panel ${active==="approaching"?"active":""}`}>
          <div className="section-head">
            <div className="section-title">Science is getting warm.</div>
            <div className="section-subtitle">
              Humanity is circling these truths. The experiments are running.<br/>
              Click any ayah to explore what science has found so far.
            </div>
          </div>
          {renderList(horizons.approaching, "approaching")}
        </div>

        {/* Waiting */}
        <div className={`panel ${active==="waiting"?"active":""}`}>
          <div className="section-head">
            <div className="section-title">Science has no map here.</div>
            <div className="section-subtitle">
              These ayaat describe realities for which science has no vocabulary yet.<br/>
              Click any ayah to explore the frontier.
            </div>
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
