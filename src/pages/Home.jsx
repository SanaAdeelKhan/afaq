import { useState } from "react";
import AyahCard from "../components/AyahCard";
import StreakBar from "../components/StreakBar";
import StarField from "../components/StarField";
import { horizons, waitingNote } from "../data/horizons";

const TABS = [
  { id:"confirmed", label:"Confirmed", count:horizons.confirmed.length },
  { id:"approaching", label:"Approaching", count:horizons.approaching.length },
  { id:"waiting", label:"Still Waiting", count:horizons.waiting.length },
];

export default function Home() {
  const [active, setActive] = useState("confirmed");

  return (
    <>
      <StarField />
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />

      <div className="app">

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-bg-arabic">
            سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ
          </div>

          <div className="hero-eyebrow">✦ Quran · Science · Horizons ✦</div>

          <div className="hero-arabic-small">
            سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ
          </div>
          <div className="hero-trans">
            "We will show them Our signs on the horizons and within themselves —
          </div>
          <div className="hero-trans">until it becomes clear to them that it is the Truth."</div>
          <div className="hero-ref">Surah Fussilat · 41:53</div>

          <div className="app-name">Afaq</div>
          <div className="app-sub">آفاق · Horizons</div>

          <div className="app-tagline">
            The Quran spoke 1,400 years ago.<br />
            Science is still catching up.<br />
            Some horizons, humanity hasn't reached yet.
          </div>

          <div className="hero-cta">
            <button className="btn-primary" onClick={() => {
              document.getElementById('explore').scrollIntoView({ behavior:'smooth' });
            }}>
              Explore the Horizons
            </button>
            <button className="btn-secondary">Watch Demo</button>
          </div>

          <div className="hero-scroll-hint">
            <span>Scroll</span>
            <div className="scroll-line" />
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="stats-bar">
          <div className="stat">
            <div className="stat-num c1">{horizons.confirmed.length}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat">
            <div className="stat-num c2">{horizons.approaching.length}</div>
            <div className="stat-label">Approaching</div>
          </div>
          <div className="stat">
            <div className="stat-num c3">{horizons.waiting.length}</div>
            <div className="stat-label">Still Waiting</div>
          </div>
        </div>

        {/* ── EXPLORE ── */}
        <div id="explore">
          <StreakBar />

          {/* Tabs */}
          <div className="tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab ${active === tab.id ? `active-${tab.id}` : ""}`}
                onClick={() => setActive(tab.id)}
              >
                <div className={`tab-dot dot-${tab.id}`} />
                <span className="tab-label">{tab.label}</span>
                <span className="tab-count">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Confirmed */}
          <div className={`panel ${active === "confirmed" ? "active" : ""}`}>
            <div className="section-head">
              <div className="section-title">Science arrived.</div>
              <div className="section-subtitle">
                These ayaat described realities humanity took centuries to discover.<br />
                The gap in years is the miracle.
              </div>
            </div>
            <div className="cards">
              {horizons.confirmed.map(a => (
                <AyahCard key={a.id} ayah={a} type="confirmed" />
              ))}
            </div>
          </div>

          {/* Approaching */}
          <div className={`panel ${active === "approaching" ? "active" : ""}`}>
            <div className="section-head">
              <div className="section-title">Science is getting warm.</div>
              <div className="section-subtitle">
                Humanity is circling these truths. The experiments are running.<br />
                The debate is live.
              </div>
            </div>
            <div className="cards">
              {horizons.approaching.map(a => (
                <AyahCard key={a.id} ayah={a} type="approaching" />
              ))}
            </div>
          </div>

          {/* Waiting */}
          <div className={`panel ${active === "waiting" ? "active" : ""}`}>
            <div className="section-head">
              <div className="section-title">Science has no map here.</div>
              <div className="section-subtitle">
                These ayaat describe realities for which science has no vocabulary yet.<br />
                The frontier ahead.
              </div>
            </div>
            <div className="waiting-note">
              <div className="wn-arabic">{waitingNote.arabic}</div>
              <div className="wn-trans">"{waitingNote.translation}"</div>
              <div className="wn-ref">{waitingNote.reference}</div>
            </div>
            <div className="cards">
              {horizons.waiting.map(a => (
                <AyahCard key={a.id} ayah={a} type="waiting" />
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="footer-line">
          <div className="footer-arabic">وَفِي أَنفُسِهِمْ</div>
          <div className="footer-text">AFAQ · آفاق · Built for Quran Foundation Hackathon 2026</div>
        </div>

      </div>
    </>
  );
}
