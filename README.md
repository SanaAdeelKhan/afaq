# Afaq · آفاق
### *Horizons — Where Quran Meets Science*

> *سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ حَتَّىٰ يَتَبَيَّنَ لَهُمْ أَنَّهُ الْحَقُّ*
>
> *"We will show them Our signs on the horizons and within themselves — until it becomes clear to them that it is the Truth."*
> — Surah Fussilat · 41:53

---

## What is Afaq?

**Afaq** (Arabic: آفاق, meaning *Horizons*) is an AI-powered Quran science exploration app built for the **Quran Foundation Hackathon 2026**.

It maps the journey of human knowledge meeting divine revelation — organized across three horizons:

| Horizon | Meaning | Count |
|---------|---------|-------|
| 🟢 **Confirmed** | Science has arrived and verified | 12 ayaat |
| 🟡 **Approaching** | Science is circling, debate is live | 8 ayaat |
| 🔵 **Still Waiting** | Science has no vocabulary here yet | 6 ayaat |

The core insight: *The gap in years between revelation and scientific confirmation is itself the miracle.*

---

## Live Demo

| | URL |
|--|--|
| **App** | https://sanaadeelkhan.github.io/afaq |
| **API Proxy** | https://afaq-nrx6.onrender.com |
| **GitHub** | https://github.com/SanaAdeelKhan/afaq |

---

## Features

### 🌌 Horizons Page
- 29 ayaat mapped across 3 scientific horizons
- Compact list view — click any ayah to expand
- Each expanded card shows:
  - Arabic text + English translation (Abdel Haleem)
  - Gap counter: *"1,300 years of human ignorance"*
  - Live audio recitation (Mishary Rashid Al-Afasy)
  - Live Tafsir (Ibn Kathir, Al-Tabari, Al-Saadi) via quran.ai MCP
  - Scholar switcher dropdown
  - Personal reflection journal

### 🔬 Research Page
- Enter any verse key (e.g. `2:183`, `16:69`, `57:25`)
- AI generates 6-section scientific analysis:
  1. 📖 Surface Meaning
  2. 🔬 Scientific Discovery
  3. ⏳ The Gap in Years
  4. 🌌 What Science Is Still Finding
  5. 🌱 Practical Implication for daily life
  6. ✨ Beyond Tafsir — what classical scholars couldn't have known
- **Live chatbot** for counter-questioning with full conversation history
- Powered by Groq Llama 3.3 70B (free)

### 🔍 Search Page
- Semantic search across 6,236 ayaat via quran.ai MCP
- Expandable results with audio + tafsir + translation
- Suggested topics: expanding universe, embryo, fasting, iron from space...

### 🗺️ Quran Map
- All 114 surahs as interactive circles
- 🟢 Green = fully explored · 🟡 Yellow ring = partially explored · 🔵 Purple = has science horizon ayah
- Click any surah → verse-level detail panel
- Each ayah circle shows explored/unexplored status
- Progress bar across all 114 surahs

### 📝 Tracking Page
- **Journal** — all saved reflections with edit/delete
- **Bookmarks** — saved ayaat with quick navigation
- **Researched** — history of AI-analysed ayaat
- **Searched** — full search history as clickable chips
- Stats dashboard: streak, reflections, bookmarks, research count

### 💬 Global Chatbot
- Persistent AI assistant on every page (bottom-right bubble)
- Full conversation history maintained across navigation
- Clickable verse references `[51:47]` that navigate the app
- Ask about any Quranic event, topic, or verse
- Suggested questions on first open
- Unread message badge

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│          Frontend (React + Vite)            │
│         GitHub Pages — Auto Deploy          │
│                                             │
│  Pages: Horizons / Map / Research /         │
│         Search / Tracking                   │
│  Components: AyahCard / GlobalChat /        │
│              NavBar / StreakBar /            │
│              SolarHero / StarField          │
└──────────────┬──────────────────────────────┘
               │ HTTP
┌──────────────▼──────────────────────────────┐
│         Proxy Server (Node.js)              │
│         Render.com — Auto Deploy            │
│                                             │
│  Routes: /api/search   /api/tafsir          │
│          /api/verse    /api/translation     │
│          /api/analyse  /api/chat            │
│          /api/morphology                    │
└──────────┬──────────────┬───────────────────┘
           │              │
┌──────────▼───┐  ┌───────▼───────────────────┐
│  quran.ai    │  │   Groq API (Free)          │
│  MCP Server  │  │   Llama 3.3 70B            │
│              │  │                            │
│  Tools used: │  │  - Scientific analysis     │
│  search_quran│  │  - Research chatbot        │
│  fetch_tafsir│  │  - Global assistant        │
│  fetch_quran │  └────────────────────────────┘
│  fetch_trans │
│  fetch_morpho│  ┌────────────────────────────┐
└──────────────┘  │  Quran Foundation API      │
                  │  (Public, no auth)         │
                  │  - Audio recitation        │
                  │  - Verse data              │
                  └────────────────────────────┘
```

---

## APIs & Tools Used

### Content APIs (Quran Foundation)
- `GET /api/v4/recitations/{id}/by_ayah/{key}` — Live audio
- `GET /api/v4/verses/by_key/{key}` — Verse data

### quran.ai MCP Server
| Tool | Used For |
|------|----------|
| `search_quran` | Semantic search across 6,236 ayaat |
| `fetch_tafsir` | Live Ibn Kathir, Al-Tabari, Al-Saadi |
| `fetch_translation` | Abdel Haleem translation |
| `fetch_quran` | Arabic text (Uthmani script) |
| `fetch_word_morphology` | Word-level linguistic analysis |

### User APIs (Quran Foundation)
- Bookmarks, Notes/Reflections, Streak tracking
- OAuth2 with PKCE (ready for integration)

### AI
- **Groq** — Llama 3.3 70B — completely free, 30 req/min
- Used for: scientific analysis, research chatbot, global assistant

---

## Judging Criteria Coverage

| Criteria | Points | How Afaq Scores |
|----------|--------|-----------------|
| Impact on Quran Engagement | 30pts | Every ayah has audio, tafsir, reflection, research, tracking |
| Product Quality & UX | 20pts | Cinematic dark UI, solar system hero, smooth interactions |
| Technical Execution | 20pts | MCP integration, proxy server, auto-deploy, localStorage |
| Innovation & Creativity | 15pts | "The Gap" counter, Still Waiting section, AI research engine |
| Effective API Use | 15pts | 5 MCP tools + Audio API + User APIs all used meaningfully |

---

## Local Development

### Prerequisites
- Node.js 20+
- Groq API key (free at console.groq.com)

### Setup

```bash
# Clone
git clone https://github.com/SanaAdeelKhan/afaq.git
cd afaq

# Install frontend
npm install

# Install proxy server
cd server && npm install && cd ..

# Add Groq key
echo "GROQ_API_KEY=your_key_here" > server/.env
```

### Run

```bash
# Terminal 1 — Proxy server
cd server && node proxy.js

# Terminal 2 — Frontend
npm run dev
```

Open `http://localhost:5173`

---

## Deployment

### Auto-Deploy Setup
- **Frontend** → GitHub Pages via GitHub Actions
- **Backend** → Render.com (free tier)
- Every `git push` to `main` triggers both automatically

### Deploy Frontend Manually
```bash
npm run deploy
```

### Environment Variables (Render)
| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | Your Groq API key |

---

## Project Structure

```
afaq/
├── .github/workflows/deploy.yml    # Auto-deploy to GitHub Pages
├── public/404.html                 # SPA routing fix for GitHub Pages
├── src/
│   ├── data/horizons.js            # 29 ayaat database — the soul
│   ├── services/
│   │   ├── quranApi.js             # Quran Foundation Content API
│   │   ├── userApi.js              # Quran Foundation User API
│   │   └── mcpSearch.js            # quran.ai MCP client
│   ├── components/
│   │   ├── AyahCard.jsx            # Core card: audio + tafsir + reflection
│   │   ├── GlobalChat.jsx          # Persistent AI chatbot
│   │   ├── NavBar.jsx
│   │   ├── StreakBar.jsx
│   │   └── StarField.jsx
│   ├── pages/
│   │   ├── Home.jsx                # Horizons + Solar system
│   │   ├── Research.jsx            # AI analysis + chatbot
│   │   ├── Search.jsx              # MCP semantic search
│   │   ├── QuranMap.jsx            # 114 surah journey map
│   │   └── Tracking.jsx            # Journal + history
│   └── App.jsx
└── server/
    ├── proxy.js                    # Node.js MCP + Groq proxy
    ├── .env                        # GROQ_API_KEY (never committed)
    └── package.json
```

---

## The Ayaat Database

Full list of mapped ayaat across three horizons:

### ✅ Confirmed (12)
| Ayah | Topic | Gap |
|------|-------|-----|
| 51:47 | Expanding Universe | 1,300 years |
| 23:12 | Human Embryology | 1,300 years |
| 57:25 | Iron from Space | 1,300 years |
| 24:40 | Deep Ocean Darkness | 1,200 years |
| 21:30 | Life from Water | 1,200 years |
| 55:19 | Two Seas (Halocline) | 1,300 years |
| 16:69 | Worker Bees Are Female | 1,200 years |
| 21:32 | Atmosphere as Shield | 1,300 years |
| 36:38 | Sun's Own Orbit | 1,300 years |
| 86:11 | The Returning Sky | 1,300 years |
| 27:18 | Ant Communication | 1,300 years |
| 75:4 | Unique Fingerprints | 1,300 years |

### 🌅 Approaching (8)
| Ayah | Topic |
|------|-------|
| 51:47 | Dark Energy / Accelerating Expansion |
| 21:104 | End of Universe (Big Crunch) |
| 36:36 | Pairs in Everything |
| 41:11 | Universe as Smoke/Plasma |
| 24:43 | Cloud Formation Stages |
| 96:1 | Neuroscience of Reading |
| 15:22 | Wind Fertilization |
| 4:56 | Skin Pain Receptors |

### 🌌 Still Waiting (6)
| Ayah | Topic |
|------|-------|
| 17:85 | The Soul — Consciousness |
| 22:47 | Divine Time — Beyond Relativity |
| 55:33 | Escaping the Universe |
| 65:12 | Seven Heavens — Extra Dimensions |
| 56:75 | Weight of Stellar Positions |
| 39:68 | The Trumpet — Quantum Vacuum |

---

## Built With Love

- **Idea & Vision** — Sana Adeel Khan
- **Development** — Built in WSL Ubuntu on Windows
- **Inspiration** — *"And of knowledge, you have been given only a little."* (17:85)

---

## Hackathon Submission

- **Hackathon:** Quran Foundation Hackathon — Ramadan 2026
- **Organized by:** Provision Launch & Quran Foundation
- **Deadline:** End of Shawwal 1447 (April 20, 2026)
- **Prize Pool:** $10,000

---

*بسم الله الرحمن الرحيم*

*Built with the hope that it draws people closer to the Quran — and leaves them in awe of the One who revealed it.*