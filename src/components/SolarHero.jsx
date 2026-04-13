import { useEffect, useRef } from "react";

const ORBITS = [
  { r:80,  speed:0.8,  size:8,  color:'#00FFB2', label:'Confirmed',   count:12, glow:'rgba(0,255,178,0.6)'   },
  { r:130, speed:0.5,  size:6,  color:'#F59E0B',  label:'Approaching', count:8,  glow:'rgba(245,158,11,0.6)'  },
  { r:180, speed:0.3,  size:5,  color:'#818CF8',  label:'Still Waiting',count:6, glow:'rgba(129,140,248,0.6)' },
  { r:230, speed:0.15, size:4,  color:'rgba(255,255,255,0.4)', label:'', count:0, glow:'rgba(255,255,255,0.3)' },
];

export default function SolarHero({ onExplore }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const timeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw(ts) {
      timeRef.current = ts * 0.0005;
      const t = timeRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);

      // Stars background
      ctx.save();
      for (let i = 0; i < 80; i++) {
        const x = ((Math.sin(i * 127.1) * 0.5 + 0.5) * W);
        const y = ((Math.sin(i * 311.7) * 0.5 + 0.5) * H);
        const op = 0.2 + 0.4 * Math.abs(Math.sin(t * 2 + i));
        ctx.beginPath();
        ctx.arc(x, y, Math.random() < 0.1 ? 1.5 : 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      }
      ctx.restore();

      // Orbit rings
      ORBITS.forEach(orbit => {
        ctx.beginPath();
        ctx.arc(cx, cy, orbit.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,0.06)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Orbiting planets
      ORBITS.forEach((orbit, oi) => {
        const angle = t * orbit.speed + (oi * Math.PI * 0.5);
        const px = cx + Math.cos(angle) * orbit.r;
        const py = cy + Math.sin(angle) * orbit.r;

        // Trail
        for (let tr = 1; tr <= 12; tr++) {
          const ta = angle - (tr * 0.08);
          const tx = cx + Math.cos(ta) * orbit.r;
          const ty = cy + Math.sin(ta) * orbit.r;
          ctx.beginPath();
          ctx.arc(tx, ty, orbit.size * (1 - tr/14), 0, Math.PI*2);
          ctx.fillStyle = orbit.color.replace(')', `,${0.15 - tr*0.01})`).replace('rgb', 'rgba').replace('rgba(rgba','rgba');
          ctx.fillStyle = orbit.glow.replace('0.6)', `${0.12 - tr*0.008})`);
          ctx.fill();
        }

        // Planet glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, orbit.size * 2.5);
        grad.addColorStop(0, orbit.glow);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, orbit.size * 2.5, 0, Math.PI*2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Planet
        ctx.beginPath();
        ctx.arc(px, py, orbit.size, 0, Math.PI*2);
        ctx.fillStyle = orbit.color;
        ctx.fill();

        // Label
        if (orbit.label) {
          ctx.save();
          ctx.font = '500 11px DM Sans, system-ui';
          ctx.fillStyle = orbit.color;
          ctx.globalAlpha = 0.85;
          ctx.textAlign = 'center';
          const lx = cx + Math.cos(angle) * (orbit.r + orbit.size + 18);
          const ly = cy + Math.sin(angle) * (orbit.r + orbit.size + 18);
          ctx.fillText(`${orbit.label} (${orbit.count})`, lx, ly + 4);
          ctx.restore();
        }
      });

      // Center — The Quran (sun)
      const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 44);
      sunGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
      sunGrad.addColorStop(0.4, 'rgba(0,255,178,0.6)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 44, 0, Math.PI*2);
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // Pulsing outer glow
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      const outerGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 60 + pulse * 15);
      outerGrad.addColorStop(0, `rgba(0,255,178,${0.15 * pulse})`);
      outerGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 60 + pulse * 15, 0, Math.PI*2);
      ctx.fillStyle = outerGrad;
      ctx.fill();

      // Center Arabic text
      ctx.save();
      ctx.font = '500 18px Tajawal, serif';
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
    <div style={{ position:'relative', width:'100%', height:'clamp(360px,55vw,520px)', marginBottom:'2rem' }}>
      <canvas
        ref={canvasRef}
        style={{ width:'100%', height:'100%', display:'block' }}
      />

      {/* Center overlay text */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        textAlign:'center', pointerEvents:'none',
        marginTop: -2,
      }}>
        {/* invisible — Arabic drawn on canvas */}
      </div>

      {/* Bottom CTA */}
      <div style={{
        position:'absolute', bottom:0, left:'50%',
        transform:'translateX(-50%)',
        textAlign:'center',
        whiteSpace:'nowrap',
      }}>
        <button
          onClick={onExplore}
          style={{
            padding:'0.7rem 2rem',
            background:'var(--c)',
            color:'#000',
            border:'none',
            borderRadius:'50px',
            fontSize:14,
            fontWeight:700,
            fontFamily:"'DM Sans',sans-serif",
            cursor:'pointer',
            boxShadow:'0 0 24px rgba(0,255,178,0.4)',
            transition:'all 0.2s',
            letterSpacing:'0.03em',
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow='0 0 40px rgba(0,255,178,0.6)'}
          onMouseOut={e => e.currentTarget.style.boxShadow='0 0 24px rgba(0,255,178,0.4)'}
        >
          Explore the Horizons ›
        </button>
      </div>
    </div>
  );
}
