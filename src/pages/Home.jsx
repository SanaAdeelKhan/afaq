import { useState, useEffect, useRef } from "react";
import AyahCard from "../components/AyahCard";
import StreakBar from "../components/StreakBar";
import { horizons, waitingNote } from "../data/horizons";

const TABS = [
  { id:"confirmed",   label:"Confirmed",    count:horizons.confirmed.length  },
  { id:"approaching", label:"Approaching",  count:horizons.approaching.length},
  { id:"waiting",     label:"Still Waiting",count:horizons.waiting.length    },
];

function SolarSystem({ onExplore }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener('resize', resize);

    const ORBITS = [
      { r:90,  speed:0.6,  size:16,  color:'#00FFB2', label:'Confirmed (12)',    glow:'rgba(0,255,178,0.5)'   },
      { r:145, speed:0.35, size:13,  color:'#F59E0B',  label:'Approaching (8)',   glow:'rgba(245,158,11,0.5)'  },
      { r:200, speed:0.2,  size:10,  color:'#818CF8',  label:'Still Waiting (6)', glow:'rgba(129,140,248,0.5)' },
    ];

    let stars = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        s: Math.random() * 1.5 + 0.3,
        o: Math.random() * 0.5 + 0.1,
        sp: Math.random() * 2 + 1,
        ph: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    function draw() {
      t += 0.008;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const cx = W / 2;
      const cy = H / 2 - 20;

      ctx.clearRect(0, 0, W, H);

      // Stars
      stars.forEach(s => {
        const op = s.o * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      });

      // Orbit rings
      ORBITS.forEach(o => {
        ctx.beginPath();
        ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Planets with trails
      ORBITS.forEach((o, oi) => {
        const angle = t * o.speed + oi * 2.1;
        const px = cx + Math.cos(angle) * o.r;
        const py = cy + Math.sin(angle) * o.r;

        // Trail
        for (let tr = 15; tr >= 1; tr--) {
          const ta = angle - tr * 0.07;
          const tx = cx + Math.cos(ta) * o.r;
          const ty = cy + Math.sin(ta) * o.r;
          ctx.beginPath();
          ctx.arc(tx, ty, o.size * (1 - tr/16), 0, Math.PI*2);
          ctx.fillStyle = o.glow.replace('0.5)', `${0.04 * (15-tr)/15})`);
          ctx.fill();
        }

        // Glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, o.size * 3);
        g.addColorStop(0, o.glow);
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, o.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Planet
        const pulseFactor = 1 + 0.15 * Math.sin(t * 2 + oi * 1.5);
        ctx.beginPath();
        ctx.arc(px, py, o.size * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = o.color;
        ctx.shadowColor = o.color;
        ctx.shadowBlur = 15 + 10 * pulseFactor;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
      });

      // Sun — center
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.5);

      // Outer pulse
      const og = ctx.createRadialGradient(cx, cy, 25, cx, cy, 55 + pulse * 12);
      og.addColorStop(0, `rgba(0,255,178,${0.12 * pulse})`);
      og.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 55 + pulse * 12, 0, Math.PI * 2);
      ctx.fillStyle = og;
      ctx.fill();

      // Sun body
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
      sg.addColorStop(0, 'rgba(255,255,255,0.98)');
      sg.addColorStop(0.5, 'rgba(0,255,178,0.7)');
      sg.addColorStop(1, 'rgba(0,255,178,0.1)');
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();

      // Arabic text on sun
      ctx.save();
      ctx.font = 'bold 14px Tajawal, serif';
      ctx.fillStyle = '#05070F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('القرآن', cx, cy);
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position:'relative', width:'100%', height:'clamp(340px,50vw,480px)', marginBottom:'1rem' }}>
      <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
      <div style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)' }}>
        <button onClick={onExplore}
          style={{ padding:'0.75rem 2.5rem', background:'var(--c)', color:'#000', border:'none', borderRadius:'50px', fontSize:14, fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', boxShadow:'0 0 30px rgba(0,255,178,0.35)', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
          Explore the Horizons ›
        </button>
      </div>
    </div>
  );
}

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
    const rgb   = type==="confirmed"?"0,255,178":type==="approaching"?"245,158,11":"129,140,248";
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {ayahs.map((ayah, i) => (
          <div key={ayah.id}>
            {expanded !== ayah.id && (
              <div onClick={() => toggle(ayah.id)}
                style={{ display:"flex", alignItems:"center", gap:14, padding:"0.9rem 1.25rem", background:"var(--card)", border:"1px solid var(--b)", borderLeft:`3px solid ${color}`, borderRadius:"var(--r)", cursor:"pointer", transition:"all 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.background="var(--card-h)"; e.currentTarget.style.transform="translateX(4px)"; }}
                onMouseOut={e => { e.currentTarget.style.background="var(--card)"; e.currentTarget.style.transform="none"; }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:`rgba(${rgb},0.1)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, color, flexShrink:0 }}>{i+1}</div>
                <div style={{ fontSize:18, flexShrink:0 }}>{ayah.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"var(--t1)", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ayah.topic}</div>
                  <div style={{ fontSize:11, color:"var(--t3)", display:"flex", alignItems:"center", gap:8 }}>
                    <span>{ayah.surah} · {ayah.verseKey}</span>
                    <span style={{ padding:"1px 7px", background:`rgba(${rgb},0.07)`, borderRadius:20, color, fontSize:10 }}>{ayah.gapLabel}</span>
                  </div>
                </div>
                <div style={{ fontFamily:"'Tajawal',serif", fontSize:13, direction:"rtl", color:"var(--t3)", maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flexShrink:0 }}>{ayah.arabic.slice(0,20)}...</div>
                <div style={{ fontSize:14, color:"var(--t3)", flexShrink:0 }}>›</div>
              </div>
            )}
            {expanded === ayah.id && (
              <div style={{ position:"relative" }}>
                <button onClick={() => setExpanded(null)}
                  style={{ position:"absolute", top:12, right:12, zIndex:10, width:28, height:28, borderRadius:"50%", background:"var(--bg2)", border:"1px solid var(--b)", color:"var(--t3)", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>×</button>
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

      {/* Background Arabic */}
      <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Tajawal',serif", fontSize:"clamp(40px,8vw,90px)", fontWeight:700, direction:"rtl", color:"rgba(255,255,255,0.018)", pointerEvents:"none", zIndex:0, textAlign:"center", padding:"2rem", lineHeight:1.5 }}>
        سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ
      </div>

      {/* Ambient orbs */}
      <div style={{ position:"fixed", top:"-15%", left:"-8%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,255,178,0.05),transparent 70%)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-15%", right:"-8%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(129,140,248,0.06),transparent 70%)", pointerEvents:"none", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:1 }}>
        {/* Header text */}
        <div style={{ textAlign:"center", padding:"2.5rem 1rem 0.5rem" }}>
          <div style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--c)", marginBottom:"0.75rem", fontWeight:500 }}>✦ Quran · Science · Horizons ✦</div>
          <div style={{ fontFamily:"'Tajawal',serif", fontSize:"clamp(16px,3vw,22px)", direction:"rtl", color:"rgba(255,255,255,0.35)", marginBottom:"0.5rem" }}>
            سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(56px,13vw,110px)", fontWeight:900, letterSpacing:"-0.04em", lineHeight:0.95, background:"linear-gradient(160deg,#fff 20%,rgba(0,255,178,0.85) 60%,rgba(129,140,248,0.65))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:"0.3rem" }}>
            Afaq
          </div>
          <div style={{ fontFamily:"'Tajawal',serif", fontSize:18, fontWeight:300, color:"var(--t3)", direction:"rtl", marginBottom:"0.5rem" }}>آفاق · Horizons</div>
          <div style={{ fontSize:15, color:"var(--t2)", fontWeight:300, lineHeight:1.7, marginBottom:"1.5rem" }}>
            The Quran spoke 1,400 years ago. Science is still catching up.<br/>
            <span style={{ color:"var(--t3)" }}>Some horizons, humanity hasn't reached yet.</span>
          </div>
        </div>

        {/* Solar System */}
        <SolarSystem onExplore={() => document.getElementById('explore')?.scrollIntoView({ behavior:'smooth' })} />

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
              <button key={tab.id} className={`tab ${active===tab.id?`active-${tab.id}`:""}`}
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
            {renderList(horizons.confirmed,"confirmed")}
          </div>

          <div className={`panel ${active==="approaching"?"active":""}`}>
            <div className="section-head">
              <div className="section-title">Science is getting warm.</div>
              <div className="section-subtitle">Click any ayah to explore what science has found so far.</div>
            </div>
            {renderList(horizons.approaching,"approaching")}
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
            {renderList(horizons.waiting,"waiting")}
          </div>
        </div>

        <div className="footer-line">
          <div className="footer-arabic">وَفِي أَنفُسِهِمْ</div>
          <div className="footer-text">AFAQ · آفاق · Quran Foundation Hackathon 2026</div>
        </div>
      </div>
    </div>
  );
}
