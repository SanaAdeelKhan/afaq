import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SURAHS = [
  {n:1,  name:"Al-Fatihah",    arabic:"الفاتحة",    ayaat:7},
  {n:2,  name:"Al-Baqarah",   arabic:"البقرة",     ayaat:286},
  {n:3,  name:"Ali 'Imran",   arabic:"آل عمران",   ayaat:200},
  {n:4,  name:"An-Nisa",      arabic:"النساء",     ayaat:176},
  {n:5,  name:"Al-Ma'idah",   arabic:"المائدة",    ayaat:120},
  {n:6,  name:"Al-An'am",     arabic:"الأنعام",    ayaat:165},
  {n:7,  name:"Al-A'raf",     arabic:"الأعراف",    ayaat:206},
  {n:8,  name:"Al-Anfal",     arabic:"الأنفال",    ayaat:75},
  {n:9,  name:"At-Tawbah",    arabic:"التوبة",     ayaat:129},
  {n:10, name:"Yunus",        arabic:"يونس",       ayaat:109},
  {n:11, name:"Hud",          arabic:"هود",        ayaat:123},
  {n:12, name:"Yusuf",        arabic:"يوسف",       ayaat:111},
  {n:13, name:"Ar-Ra'd",      arabic:"الرعد",      ayaat:43},
  {n:14, name:"Ibrahim",      arabic:"إبراهيم",    ayaat:52},
  {n:15, name:"Al-Hijr",      arabic:"الحجر",      ayaat:99},
  {n:16, name:"An-Nahl",      arabic:"النحل",      ayaat:128},
  {n:17, name:"Al-Isra",      arabic:"الإسراء",    ayaat:111},
  {n:18, name:"Al-Kahf",      arabic:"الكهف",      ayaat:110},
  {n:19, name:"Maryam",       arabic:"مريم",       ayaat:98},
  {n:20, name:"Ta-Ha",        arabic:"طه",         ayaat:135},
  {n:21, name:"Al-Anbiya",    arabic:"الأنبياء",   ayaat:112},
  {n:22, name:"Al-Hajj",      arabic:"الحج",       ayaat:78},
  {n:23, name:"Al-Mu'minun",  arabic:"المؤمنون",   ayaat:118},
  {n:24, name:"An-Nur",       arabic:"النور",      ayaat:64},
  {n:25, name:"Al-Furqan",    arabic:"الفرقان",    ayaat:77},
  {n:26, name:"Ash-Shu'ara",  arabic:"الشعراء",    ayaat:227},
  {n:27, name:"An-Naml",      arabic:"النمل",      ayaat:93},
  {n:28, name:"Al-Qasas",     arabic:"القصص",      ayaat:88},
  {n:29, name:"Al-'Ankabut",  arabic:"العنكبوت",   ayaat:69},
  {n:30, name:"Ar-Rum",       arabic:"الروم",      ayaat:60},
  {n:31, name:"Luqman",       arabic:"لقمان",      ayaat:34},
  {n:32, name:"As-Sajdah",    arabic:"السجدة",     ayaat:30},
  {n:33, name:"Al-Ahzab",     arabic:"الأحزاب",    ayaat:73},
  {n:34, name:"Saba",         arabic:"سبأ",        ayaat:54},
  {n:35, name:"Fatir",        arabic:"فاطر",       ayaat:45},
  {n:36, name:"Ya-Sin",       arabic:"يس",         ayaat:83},
  {n:37, name:"As-Saffat",    arabic:"الصافات",    ayaat:182},
  {n:38, name:"Sad",          arabic:"ص",          ayaat:88},
  {n:39, name:"Az-Zumar",     arabic:"الزمر",      ayaat:75},
  {n:40, name:"Ghafir",       arabic:"غافر",       ayaat:85},
  {n:41, name:"Fussilat",     arabic:"فصلت",       ayaat:54},
  {n:42, name:"Ash-Shura",    arabic:"الشورى",     ayaat:53},
  {n:43, name:"Az-Zukhruf",   arabic:"الزخرف",     ayaat:89},
  {n:44, name:"Ad-Dukhan",    arabic:"الدخان",     ayaat:59},
  {n:45, name:"Al-Jathiyah",  arabic:"الجاثية",    ayaat:37},
  {n:46, name:"Al-Ahqaf",     arabic:"الأحقاف",    ayaat:35},
  {n:47, name:"Muhammad",     arabic:"محمد",       ayaat:38},
  {n:48, name:"Al-Fath",      arabic:"الفتح",      ayaat:29},
  {n:49, name:"Al-Hujurat",   arabic:"الحجرات",    ayaat:18},
  {n:50, name:"Qaf",          arabic:"ق",          ayaat:45},
  {n:51, name:"Adh-Dhariyat", arabic:"الذاريات",   ayaat:60},
  {n:52, name:"At-Tur",       arabic:"الطور",      ayaat:49},
  {n:53, name:"An-Najm",      arabic:"النجم",      ayaat:62},
  {n:54, name:"Al-Qamar",     arabic:"القمر",      ayaat:55},
  {n:55, name:"Ar-Rahman",    arabic:"الرحمن",     ayaat:78},
  {n:56, name:"Al-Waqi'ah",   arabic:"الواقعة",    ayaat:96},
  {n:57, name:"Al-Hadid",     arabic:"الحديد",     ayaat:29},
  {n:58, name:"Al-Mujadila",  arabic:"المجادلة",   ayaat:22},
  {n:59, name:"Al-Hashr",     arabic:"الحشر",      ayaat:24},
  {n:60, name:"Al-Mumtahanah",arabic:"الممتحنة",   ayaat:13},
  {n:61, name:"As-Saf",       arabic:"الصف",       ayaat:14},
  {n:62, name:"Al-Jumu'ah",   arabic:"الجمعة",     ayaat:11},
  {n:63, name:"Al-Munafiqun", arabic:"المنافقون",  ayaat:11},
  {n:64, name:"At-Taghabun",  arabic:"التغابن",    ayaat:18},
  {n:65, name:"At-Talaq",     arabic:"الطلاق",     ayaat:12},
  {n:66, name:"At-Tahrim",    arabic:"التحريم",    ayaat:12},
  {n:67, name:"Al-Mulk",      arabic:"الملك",      ayaat:30},
  {n:68, name:"Al-Qalam",     arabic:"القلم",      ayaat:52},
  {n:69, name:"Al-Haqqah",    arabic:"الحاقة",     ayaat:52},
  {n:70, name:"Al-Ma'arij",   arabic:"المعارج",    ayaat:44},
  {n:71, name:"Nuh",          arabic:"نوح",        ayaat:28},
  {n:72, name:"Al-Jinn",      arabic:"الجن",       ayaat:28},
  {n:73, name:"Al-Muzzammil", arabic:"المزمل",     ayaat:20},
  {n:74, name:"Al-Muddaththir",arabic:"المدثر",    ayaat:56},
  {n:75, name:"Al-Qiyamah",   arabic:"القيامة",    ayaat:40},
  {n:76, name:"Al-Insan",     arabic:"الإنسان",    ayaat:31},
  {n:77, name:"Al-Mursalat",  arabic:"المرسلات",   ayaat:50},
  {n:78, name:"An-Naba",      arabic:"النبأ",      ayaat:40},
  {n:79, name:"An-Nazi'at",   arabic:"النازعات",   ayaat:46},
  {n:80, name:"Abasa",        arabic:"عبس",        ayaat:42},
  {n:81, name:"At-Takwir",    arabic:"التكوير",    ayaat:29},
  {n:82, name:"Al-Infitar",   arabic:"الانفطار",   ayaat:19},
  {n:83, name:"Al-Mutaffifin",arabic:"المطففين",   ayaat:36},
  {n:84, name:"Al-Inshiqaq",  arabic:"الانشقاق",   ayaat:25},
  {n:85, name:"Al-Buruj",     arabic:"البروج",     ayaat:22},
  {n:86, name:"At-Tariq",     arabic:"الطارق",     ayaat:17},
  {n:87, name:"Al-A'la",      arabic:"الأعلى",     ayaat:19},
  {n:88, name:"Al-Ghashiyah", arabic:"الغاشية",    ayaat:26},
  {n:89, name:"Al-Fajr",      arabic:"الفجر",      ayaat:30},
  {n:90, name:"Al-Balad",     arabic:"البلد",      ayaat:20},
  {n:91, name:"Ash-Shams",    arabic:"الشمس",      ayaat:15},
  {n:92, name:"Al-Layl",      arabic:"الليل",      ayaat:21},
  {n:93, name:"Ad-Duha",      arabic:"الضحى",      ayaat:11},
  {n:94, name:"Ash-Sharh",    arabic:"الشرح",      ayaat:8},
  {n:95, name:"At-Tin",       arabic:"التين",      ayaat:8},
  {n:96, name:"Al-Alaq",      arabic:"العلق",      ayaat:19},
  {n:97, name:"Al-Qadr",      arabic:"القدر",      ayaat:5},
  {n:98, name:"Al-Bayyinah",  arabic:"البينة",     ayaat:8},
  {n:99, name:"Az-Zalzalah",  arabic:"الزلزلة",    ayaat:8},
  {n:100,name:"Al-Adiyat",    arabic:"العاديات",   ayaat:11},
  {n:101,name:"Al-Qari'ah",   arabic:"القارعة",    ayaat:11},
  {n:102,name:"At-Takathur",  arabic:"التكاثر",    ayaat:8},
  {n:103,name:"Al-Asr",       arabic:"العصر",      ayaat:3},
  {n:104,name:"Al-Humazah",   arabic:"الهمزة",     ayaat:9},
  {n:105,name:"Al-Fil",       arabic:"الفيل",      ayaat:5},
  {n:106,name:"Quraysh",      arabic:"قريش",       ayaat:4},
  {n:107,name:"Al-Ma'un",     arabic:"الماعون",    ayaat:7},
  {n:108,name:"Al-Kawthar",   arabic:"الكوثر",     ayaat:3},
  {n:109,name:"Al-Kafirun",   arabic:"الكافرون",   ayaat:6},
  {n:110,name:"An-Nasr",      arabic:"النصر",      ayaat:3},
  {n:111,name:"Al-Masad",     arabic:"المسد",      ayaat:5},
  {n:112,name:"Al-Ikhlas",    arabic:"الإخلاص",    ayaat:4},
  {n:113,name:"Al-Falaq",     arabic:"الفلق",      ayaat:5},
  {n:114,name:"An-Nas",       arabic:"الناس",      ayaat:6},
];

const HORIZON_AYAAT = {
  "51:47":"confirmed","23:12":"confirmed","57:25":"confirmed",
  "24:40":"confirmed","21:30":"confirmed","55:19":"confirmed",
  "16:69":"confirmed","21:32":"confirmed","36:38":"confirmed",
  "86:11":"confirmed","27:18":"confirmed","75:4":"confirmed",
  "51:47":"approaching","21:104":"approaching","36:36":"approaching",
  "41:11":"approaching","24:43":"approaching","15:22":"approaching",
  "4:56":"approaching","96:1":"approaching",
  "17:85":"waiting","22:47":"waiting","55:33":"waiting",
  "65:12":"waiting","56:75":"waiting","39:68":"waiting",
};

export default function QuranMap() {
  const navigate = useNavigate();
  const [exploredVerses, setExploredVerses] = useState(new Set());
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState('all');
  const [hovered, setHovered]     = useState(null);

  useEffect(() => {
    const allExplored = new Set();
    const notes      = JSON.parse(localStorage.getItem('afaq_notes') || '{}');
    const bookmarks  = JSON.parse(localStorage.getItem('afaq_bookmarks') || '[]');
    const researched = JSON.parse(localStorage.getItem('afaq_researched') || '[]');

    Object.keys(notes).forEach(k => allExplored.add(k));
    bookmarks.forEach(k => allExplored.add(k));
    researched.forEach(item => allExplored.add(item.key || item));
    Object.keys(HORIZON_AYAAT).forEach(k => {
      // Mark horizon ayaat as "available to explore"
    });

    setExploredVerses(allExplored);
  }, []);

  function getSurahStatus(surah) {
    const surahVerses = [...exploredVerses].filter(k => parseInt(k.split(':')[0]) === surah.n);
    const horizonVerses = Object.keys(HORIZON_AYAAT).filter(k => parseInt(k.split(':')[0]) === surah.n);
    const exploredCount = surahVerses.length;
    const isFullyExplored = exploredCount >= surah.ayaat;
    const isPartial = exploredCount > 0 && !isFullyExplored;
    const hasHorizon = horizonVerses.length > 0;

    return { exploredCount, isFullyExplored, isPartial, hasHorizon, surahVerses, horizonVerses };
  }

  // Get status color
  function getColors(status) {
    if (status.isFullyExplored) return {
      circle: 'var(--c)', circleBg: 'var(--c)', circleText: '#000',
      card: 'rgba(0,255,178,0.08)', cardBorder: 'rgba(0,255,178,0.3)',
      text: 'var(--c)', glow: '0 0 12px rgba(0,255,178,0.4)'
    };
    if (status.isPartial) return {
      circle: '#F59E0B', circleBg: 'rgba(245,158,11,0.15)', circleText: '#F59E0B',
      card: 'rgba(245,158,11,0.06)', cardBorder: 'rgba(245,158,11,0.25)',
      text: '#F59E0B', glow: '0 0 10px rgba(245,158,11,0.3)'
    };
    if (status.hasHorizon) return {
      circle: 'var(--c3)', circleBg: 'rgba(129,140,248,0.12)', circleText: 'var(--c3)',
      card: 'rgba(129,140,248,0.04)', cardBorder: 'rgba(129,140,248,0.2)',
      text: 'var(--c3)', glow: '0 0 8px rgba(129,140,248,0.25)'
    };
    return {
      circle: 'var(--t3)', circleBg: 'var(--bg2)', circleText: 'var(--t3)',
      card: 'var(--card)', cardBorder: 'var(--b)',
      text: 'var(--t3)', glow: 'none'
    };
  }

  const horizonSurahs = [...new Set(Object.keys(HORIZON_AYAAT).map(k => parseInt(k.split(':')[0])))];
  const fullySurahs   = SURAHS.filter(s => getSurahStatus(s).isFullyExplored).length;
  const partialSurahs = SURAHS.filter(s => getSurahStatus(s).isPartial).length;

  const filtered = filter === 'all'      ? SURAHS
                 : filter === 'complete'  ? SURAHS.filter(s => getSurahStatus(s).isFullyExplored)
                 : filter === 'partial'   ? SURAHS.filter(s => getSurahStatus(s).isPartial)
                 : filter === 'horizon'   ? SURAHS.filter(s => horizonSurahs.includes(s.n))
                 : SURAHS.filter(s => !getSurahStatus(s).isFullyExplored && !getSurahStatus(s).isPartial);

  return (
    <div className="app">
      <div style={{ padding:'3rem 0 4rem' }}>

        {/* Header */}
        <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--c)', marginBottom:'1rem', fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--c)', boxShadow:'0 0 8px var(--c)' }} />
          Quran Map · 114 Surahs
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(26px,5vw,44px)', fontWeight:900, marginBottom:'0.75rem', lineHeight:1.1, background:'linear-gradient(135deg,#fff 30%,rgba(0,255,178,0.8) 70%,rgba(129,140,248,0.6))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          Your Quran Journey
        </h1>

        <p style={{ fontSize:14, color:'var(--t3)', marginBottom:'2rem', fontWeight:300, lineHeight:1.75 }}>
          Click any surah to see verse-level progress. Green = fully explored · Yellow = partially · Purple = has science horizon.
        </p>

        {/* Progress */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--b)', borderRadius:'var(--r)', padding:'1.25rem 1.5rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:'1rem' }}>
            {[
              { label:'Complete',  value:fullySurahs,  color:'var(--c)'  },
              { label:'In Progress',value:partialSurahs,color:'#F59E0B'  },
              { label:'Remaining', value:114-fullySurahs-partialSurahs, color:'var(--t3)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height:6, background:'var(--b)', borderRadius:3, overflow:'hidden', display:'flex' }}>
            <div style={{ height:'100%', width:`${(fullySurahs/114)*100}%`, background:'var(--c)', transition:'width 0.5s' }} />
            <div style={{ height:'100%', width:`${(partialSurahs/114)*100}%`, background:'#F59E0B', transition:'width 0.5s' }} />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:6, marginBottom:'2rem', flexWrap:'wrap' }}>
          {[
            { id:'all',      label:'All 114'          },
            { id:'horizon',  label:'🔬 Has Science'   },
            { id:'complete', label:'✅ Complete'       },
            { id:'partial',  label:'🟡 In Progress'   },
            { id:'pending',  label:'○ Not Started'    },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ padding:'0.4rem 1rem', background:filter===f.id?'rgba(0,255,178,0.08)':'var(--card)', border:`1px solid ${filter===f.id?'rgba(0,255,178,0.25)':'var(--b)'}`, borderRadius:'50px', color:filter===f.id?'var(--c)':'var(--t3)', fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', transition:'all 0.2s' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Surah grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(82px,1fr))', gap:8 }}>
          {filtered.map(surah => {
            const status = getSurahStatus(surah);
            const colors = getColors(status);
            const isHov  = hovered === surah.n;
            const isSel  = selected?.n === surah.n;

            return (
              <div key={surah.n}
                onClick={() => setSelected(isSel ? null : surah)}
                onMouseEnter={() => setHovered(surah.n)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display:'flex', flexDirection:'column', alignItems:'center',
                  padding:'0.7rem 0.4rem',
                  background: isSel ? colors.card : isHov ? colors.card : 'var(--card)',
                  border:`1px solid ${isSel ? colors.cardBorder : isHov ? colors.cardBorder : 'var(--b)'}`,
                  borderRadius:12, cursor:'pointer', transition:'all 0.2s',
                  transform: isHov && !isSel ? 'translateY(-2px)' : 'none',
                  boxShadow: isSel ? colors.glow : 'none',
                  position:'relative',
                }}
              >
                {/* Progress ring effect */}
                <div style={{
                  width:38, height:38, borderRadius:'50%',
                  background: status.isFullyExplored ? colors.circleBg
                    : status.isPartial ? 'transparent' : colors.circleBg,
                  border: status.isPartial
                    ? `2px solid #F59E0B`
                    : status.isFullyExplored
                    ? 'none'
                    : `1.5px solid ${colors.circle}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:700,
                  color: status.isFullyExplored ? '#000' : colors.circleText,
                  marginBottom:5,
                  boxShadow: status.isFullyExplored || status.isPartial ? colors.glow : 'none',
                  position:'relative', flexShrink:0,
                }}>
                  {status.isPartial && (
                    <svg style={{ position:'absolute', inset:-2, width:42, height:42 }} viewBox="0 0 42 42">
                      <circle cx="21" cy="21" r="19" fill="none" stroke="var(--b)" strokeWidth="2"/>
                      <circle cx="21" cy="21" r="19" fill="none" stroke="#F59E0B" strokeWidth="2"
                        strokeDasharray={`${(status.exploredCount/surah.ayaat)*119} 119`}
                        strokeLinecap="round"
                        transform="rotate(-90 21 21)"
                      />
                    </svg>
                  )}
                  {surah.n}
                </div>

                <div style={{ fontSize:9, fontWeight:600, color:colors.text, textAlign:'center', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%', paddingInline:2 }}>
                  {surah.name}
                </div>
                <div style={{ fontFamily:"'Tajawal',serif", fontSize:10, color:'var(--t3)', marginTop:1 }}>
                  {surah.arabic}
                </div>
                <div style={{ fontSize:9, color:'var(--t3)', marginTop:2, opacity:0.5 }}>
                  {status.exploredCount}/{surah.ayaat}
                </div>

                {/* Science dot */}
                {status.hasHorizon && (
                  <div style={{ position:'absolute', top:5, right:5, width:5, height:5, borderRadius:'50%', background:'var(--c3)', boxShadow:'0 0 4px var(--c3)' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── SURAH DETAIL PANEL ── */}
        {selected && (() => {
          const status = getSurahStatus(selected);
          const colors = getColors(status);
          const allVerses = Array.from({ length: selected.ayaat }, (_, i) => `${selected.n}:${i+1}`);

          return (
            <div style={{ marginTop:'1.5rem', background:'var(--bg2)', border:`1px solid ${colors.cardBorder}`, borderRadius:'var(--r)', overflow:'hidden', position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:'1px', background:`linear-gradient(90deg,transparent,${colors.circle},transparent)` }} />

              {/* Panel header */}
              <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--b)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'var(--t1)' }}>
                      {selected.n}. {selected.name}
                    </span>
                    <span style={{ fontFamily:"'Tajawal',serif", fontSize:18, color:'var(--t2)', direction:'rtl' }}>
                      {selected.arabic}
                    </span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--t3)' }}>
                    {selected.ayaat} ayaat · {status.exploredCount} explored ·
                    <span style={{ color:colors.text, marginLeft:4 }}>
                      {status.isFullyExplored ? '✅ Complete' : status.isPartial ? `🟡 ${Math.round((status.exploredCount/selected.ayaat)*100)}% done` : '○ Not started'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  style={{ width:28, height:28, borderRadius:'50%', background:'var(--bg)', border:'1px solid var(--b)', color:'var(--t3)', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>
                  ×
                </button>
              </div>

              {/* Verse grid */}
              <div style={{ padding:'1.25rem 1.5rem' }}>
                <div style={{ fontSize:11, color:'var(--t3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'0.85rem' }}>
                  Verse-level progress
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {allVerses.map(key => {
                    const isExp  = exploredVerses.has(key);
                    const isHor  = !!HORIZON_AYAAT[key];
                    const ayahN  = key.split(':')[1];

                    return (
                      <button key={key}
                        onClick={() => navigate(`/research?ayah=${key}`)}
                        title={`${key}${isHor?' · Science horizon':''}`}
                        style={{
                          width:36, height:36,
                          borderRadius:'50%',
                          background: isExp ? 'var(--c)'
                            : isHor ? 'rgba(129,140,248,0.15)'
                            : 'var(--bg)',
                          border:`1.5px solid ${
                            isExp ? 'var(--c)'
                            : isHor ? 'rgba(129,140,248,0.4)'
                            : 'var(--b)'
                          }`,
                          color: isExp ? '#000' : isHor ? 'var(--c3)' : 'var(--t3)',
                          fontSize:10, fontWeight: isExp || isHor ? 600 : 400,
                          cursor:'pointer', transition:'all 0.15s',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          boxShadow: isExp ? '0 0 8px rgba(0,255,178,0.3)' : isHor ? '0 0 6px rgba(129,140,248,0.2)' : 'none',
                          fontFamily:"'DM Sans',sans-serif",
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform='scale(1.15)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; }}
                      >
                        {ayahN}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display:'flex', gap:16, marginTop:'1rem', fontSize:11, color:'var(--t3)', flexWrap:'wrap' }}>
                  <span><span style={{ color:'var(--c)' }}>● Green</span> = Explored</span>
                  <span><span style={{ color:'var(--c3)' }}>● Purple</span> = Science horizon</span>
                  <span>○ Gray = Not explored yet</span>
                </div>

                {/* Action buttons */}
                <div style={{ display:'flex', gap:8, marginTop:'1.25rem' }}>
                  <button onClick={() => navigate(`/search?q=${selected.name}`)}
                    style={{ padding:'0.5rem 1.2rem', background:'var(--c)', color:'#000', border:'none', borderRadius:'50px', fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>
                    Search this Surah
                  </button>
                  <button onClick={() => navigate(`/research?ayah=${selected.n}:1`)}
                    style={{ padding:'0.5rem 1.2rem', background:'none', color:'var(--c3)', border:'1px solid rgba(129,140,248,0.3)', borderRadius:'50px', fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>
                    Research First Ayah
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Legend */}
        <div style={{ marginTop:'2rem', padding:'1rem 1.25rem', background:'var(--bg2)', borderRadius:'var(--r2)', border:'1px solid var(--b)', display:'flex', flexWrap:'wrap', gap:16, fontSize:12, color:'var(--t3)' }}>
          <span><span style={{ color:'var(--c)' }}>● Green</span> = All verses explored</span>
          <span><span style={{ color:'#F59E0B' }}>⟳ Yellow ring</span> = Partially explored</span>
          <span><span style={{ color:'var(--c3)' }}>● Purple dot</span> = Has science horizon</span>
          <span>○ Gray = Not started</span>
        </div>
      </div>
    </div>
  );
}
