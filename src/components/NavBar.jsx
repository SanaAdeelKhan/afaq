import { useNavigate, useLocation } from "react-router-dom";

export default function NavBar() {
  const nav = useNavigate();
  const loc = useLocation();

  const links = [
    { path:'/', label:'Horizons' },
    { path:'/research', label:'🔬 Research' },
    { path:'/search', label:'🔍 Search' },
  ];

  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 2rem', background:'rgba(5,7,15,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <div onClick={() => nav('/')} style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, background:'linear-gradient(135deg,#fff,rgba(0,255,178,0.8))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', cursor:'pointer' }}>
        Afaq
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {links.map(item => (
          <button key={item.path} onClick={() => nav(item.path)}
            style={{ padding:'0.4rem 1rem', background: loc.pathname===item.path ? 'rgba(0,255,178,0.08)' : 'none', border:'1px solid', borderColor: loc.pathname===item.path ? 'rgba(0,255,178,0.2)' : 'rgba(255,255,255,0.08)', borderRadius:'50px', color: loc.pathname===item.path ? 'var(--c)' : 'rgba(255,255,255,0.4)', fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', transition:'all 0.2s' }}>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
