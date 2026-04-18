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
- 26 ayaat mapped across 3 scientific horizons
- Interactive solar system animation — each orbit represents a horizon
- Click any ayah to expand full detail:
  - Fully vowelized Arabic (Uthmani script) + English translation
  - Gap counter: *"1,300 years of human ignorance"*
  - Live audio recitation (Mishary Rashid Al-Afasy)
  - Full Tafsir Ibn Kathir via quran.ai MCP — no truncation
  - Scholar switcher (Ibn Kathir, Maariful Quran, Al-Tabari, Al-Saadi)
  - Personal reflection journal with local save

### 🔬 Research Page
- Enter any verse key (e.g. `2:183`, `16:69`, `57:25`) or use **Quran Journey** mode
- **Quran Journey** — navigate the entire Quran ayah by ayah, bookmark auto-saved
- AI generates 6-section scientific analysis:
  1. 📖 Surface Meaning
  2. 🔬 Scientific Discovery
  3. ⏳ The Gap in Years
  4. 🌌 What Science Is Still Finding
  5. 🌱 Practical Implication for daily life
  6. ✨ Beyond Tafsir — what classical scholars couldn't have known
- **Live chatbot** for counter-questioning with full conversation history
- **Floating reflection note** — write while you read, tied to each ayah
- Powered by Groq Llama 3.3 70B

### 🔍 Search Page
- AI-powered smart search — Groq identifies exact verse references, verified Arabic fetched from Quran Foundation
- Fully vowelized tashkeel Arabic — never AI-generated text
- Single keyword suggestions: fasting, prayer, embryo, iron, honey, soul...
- For compound topics — Afaq Assistant guides to exact ayah reference
- Direct verse key lookup: type `57:25` to fetch that exact ayah
- Expandable results with audio + full tafsir + translation
- Show 5 results + load more

### 🗺️ Quran Map
- All 114 surahs as interactive circles
- 🟢 Green = fully explored · 🟡 Yellow ring = partially explored · 🔵 Purple dot = has science horizon ayah
- Click any surah → verse-level progress panel
- Navigate directly to Research or Search from any surah
- Progress tracking across all 114 surahs

### 📝 Tracking Page
- **Journal** — all saved reflections with edit/delete
- **Bookmarks** — saved ayaat with quick navigation
- **Researched** — history of AI-analysed ayaat
- **Searched** — full search history as clickable chips
- Stats dashboard: streak, reflections, bookmarks, research count

### 💬 Afaq Assistant
- Persistent AI assistant on every page (bottom-right)
- Full conversation history maintained across navigation
- Clickable verse references `[51:47]` that navigate directly in the app
- Ask about any Quranic topic, event, or concept
- Suggested questions on first open
- Unread message badge

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│          Frontend (React + Vite)            │
│         GitHub Pages — Auto Deploy          │
│                                             │
│  Pages: Horizons / Research / Search /      │
│         Map / Tracking                      │
│  Components: AyahCard / GlobalChat /        │
│              NavBar / StreakBar /            │
│              FloatingNote / StarField       │
└──────────────┬──────────────────────────────┘
               │ HTTP
┌──────────────▼──────────────────────────────┐
│         Proxy Server (Node.js)              │
│         Render.com — Auto Deploy            │
│                                             │
│  Routes: /api/smart-search  /api/tafsir     │
│          /api/verse         /api/translation│
│          /api/analyse       /api/chat       │
│          /api/search                        │
└──────────┬──────────────┬───────────────────┘
           │              │
┌──────────▼───┐  ┌───────▼───────────────────┐
│  quran.ai    │  │   Groq API (Free)          │
│  MCP Server  │  │   Llama 3.3 70B            │
│              │  │                            │
│  Tools used: │  │  - Scientific analysis     │
│  search_quran│  │  - Smart verse finder      │
│  fetch_tafsir│  │  - Research chatbot        │
│  fetch_quran │  │  - Afaq Assistant          │
│  fetch_trans │  └────────────────────────────┘
│  fetch_morpho│
└──────────────┘  ┌────────────────────────────┐
                  │  Quran Foundation API      │
                  │  api.quran.com/api/v4      │
                  │  - Audio recitation        │
                  │  - Uthmani tashkeel Arabic │
                  │  - Verse data              │
                  └────────────────────────────┘
```

---

## APIs & Tools Used

### Quran Foundation Content APIs
- `GET /api/v4/recitations/7/by_ayah/{key}` — Mishary Rashid live audio
- `GET /api/v4/verses/by_key/{key}?fields=text_uthmani` — Verified vowelized Arabic

### quran.ai MCP Server
| Tool | Used For |
|------|----------|
| `search_quran` | Semantic search across 6,236 ayaat |
| `fetch_tafsir` | Full Ibn Kathir, Al-Tabari, Al-Saadi — no truncation |
| `fetch_translation` | Abdel Haleem verified translation |
| `fetch_quran` | Arabic text (Uthmani script) |
| `fetch_word_morphology` | Word-level linguistic analysis |

### Quran Foundation User APIs
- **Streak Tracking** — Daily engagement streak on every page
- **Bookmarks** — Save any ayah, accessible from Tracking page
- **Post APIs (Reflections)** — Personal journal, editable and deletable

### AI — Groq (Llama 3.3 70B, free)
- Scientific analysis engine (6-section deep analysis per ayah)
- Smart search — finds exact verse keys for any topic (no MCP hallucination)
- Research chatbot — counter-questions and scholarly discussion
- Afaq Assistant — global guide across all pages

> **Important:** Groq AI only provides verse *references* and *analysis* — all actual Quran text, translation, and tafsir always comes from Quran Foundation. Never AI-generated Quran text.

---

## What Makes Afaq Different

| Feature | Afaq | Others |
|---------|------|--------|
| Quran text source | Quran Foundation (verified) | Often AI-generated |
| Tafsir | Full, untruncated, live from MCP | Static or summarized |
| Scientific analysis | 6-section AI deep dive per ayah | Generic summaries |
| Search | Groq finds exact verses, verified text | Keyword matching |
| Journey mode | Navigate all 6,236 ayaat with bookmark | Not available |
| Tracking | Streak + journal + map + history | Basic or none |

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

Open `http://localhost:5173/afaq`

---

## Deployment

### Auto-Deploy Setup
- **Frontend** → GitHub Pages via `npm run deploy`
- **Backend** → Render.com (free tier) — auto-redeploys on `git push`

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
│   ├── data/horizons.js            # 26 ayaat database — the soul of Afaq
│   ├── config.js                   # Proxy URL (dev/prod switch)
│   ├── services/
│   │   ├── quranApi.js             # Quran Foundation Content API
│   │   ├── userApi.js              # Quran Foundation User API
│   │   └── mcpSearch.js            # quran.ai MCP client
│   ├── components/
│   │   ├── AyahCard.jsx            # Core card: audio + tafsir + reflection
│   │   ├── GlobalChat.jsx          # Persistent Afaq Assistant
│   │   ├── NavBar.jsx
│   │   ├── StreakBar.jsx
│   │   └── StarField.jsx
│   ├── pages/
│   │   ├── Home.jsx                # Horizons + Solar system animation
│   │   ├── Research.jsx            # AI analysis + Journey mode + chatbot
│   │   ├── Search.jsx              # Smart search + verse key lookup
│   │   ├── QuranMap.jsx            # 114 surah interactive journey map
│   │   └── Tracking.jsx            # Journal + bookmarks + history
│   └── App.jsx
└── server/
    ├── proxy.js                    # Node.js — MCP + Groq + all routes
    ├── .env                        # GROQ_API_KEY (never committed)
    └── package.json
```

---

## The Ayaat Database

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
- **Development** — Built in WSL Ubuntu on Windows, with Claude as AI pair programmer
- **Inspiration** — *"And of knowledge, you have been given only a little."* (17:85)

---

## Hackathon Submission

- **Hackathon:** Quran Foundation Hackathon — Ramadan 2026
- **Organized by:** Provision Launch & Quran Foundation
- **Deadline:** April 20, 2026
- **Prize Pool:** $10,000

---

*بسم الله الرحمن الرحيم*

*Built with the hope that it draws people closer to the Quran — and leaves them in awe of the One who revealed it.*
