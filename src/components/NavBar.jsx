import { useNavigate, useLocation } from "react-router-dom";

export default function NavBar() {
  const nav = useNavigate();
  const loc = useLocation();

  const links = [
    { path:'/',         label:'Horizons' },
    { path:'/map',      label:'🗺️ Map'   },
    { path:'/research', label:'🔬 Research' },
    { path:'/search',   label:'🔍 Search' },
    { path:'/tracking', label:'📝 Tracking' },
  ];

  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 1.5rem', background:'rgba(5,7,15,0.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <div onClick={() => nav('/')} style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, background:'linear-gradient(135deg,#fff,rgba(0,255,178,0.8))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', cursor:'pointer', flexShrink:0, marginRight:'1rem' }}>
        Afaq
      </div>
      <div style={{ display:'flex', gap:4, overflowX:'auto' }}>
        {links.map(item => (
          <button key={item.path} onClick={() => nav(item.path)}
            style={{ padding:'0.35rem 0.85rem', background:loc.pathname===item.path?'rgba(0,255,178,0.08)':'none', border:'1px solid', borderColor:loc.pathname===item.path?'rgba(0,255,178,0.2)':'rgba(255,255,255,0.07)', borderRadius:'50px', color:loc.pathname===item.path?'var(--c)':'rgba(255,255,255,0.4)', fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
