# Afaq — آفاق

> *"We will show them Our signs on the horizons and within themselves — until it becomes clear to them that it is the Truth."* — Quran 41:53

**Afaq** (Horizons) is a web app that maps the journey of human knowledge meeting divine revelation — built for the Quran Foundation Hackathon 2026.

## The Three Horizons

- 🟢 **Confirmed** — Ayaat science has verified (12 ayaat, 1,000–1,300 year gaps)
- 🟡 **Approaching** — Science is circling these truths (8 ayaat)
- 🔵 **Still Waiting** — Science has no map here yet (6 ayaat)

## Features

- 📖 Live Arabic text + translations via Quran Foundation API
- 🎙️ Live recitation audio (Mishary Rashid Al-Afasy)
- 📚 Live Tafsir Ibn Kathir via **quran.ai MCP**
- 🔍 Semantic search across 6,236 ayaat via **quran.ai MCP**
- ✍️ Personal reflection journal
- 🔥 Streak tracking
- 🌟 Cinematic dark UI with star field

## Tech Stack

- React + Vite
- Quran Foundation Content API
- quran.ai MCP Server (semantic search + tafsir)
- Node.js proxy server for MCP

## Setup

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start MCP proxy (terminal 1)
cd server && node proxy.js

# Start app (terminal 2)
npm run dev
```

## Built for

[Quran Foundation Hackathon 2026](https://provisionlaunch.com/quran-hackathon) — organized by Provision Launch & Quran Foundation.

---

*Bismillah ir-Rahman ir-Rahim*
