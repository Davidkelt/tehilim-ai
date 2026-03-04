# Tehillim / תהילים

A modern, beautiful Hebrew Psalms web application with AI-powered analysis.

אפליקציית תהילים מודרנית ויפה עם ניתוח מבוסס AI.

## Features / תכונות

- **Psalms Reader** — All 150 chapters with nikud (vowelization), toggle on/off
- **AI Analysis** — Claude-powered analysis per chapter: summary, key verses, life lessons, emotional tone, historical context
- **Age Adaptation** — AI analysis adapts to selected age group (children, teens, adults, seniors)
- **Daily Psalm** — Based on the traditional monthly Tehillim division
- **Search** — Search by keyword or chapter number across all psalms
- **Favorites** — Bookmark chapters and individual verses (localStorage)
- **Share** — Generate beautiful card images from verses
- **Dark/Light Mode** — Full theme support
- **RTL** — Full right-to-left layout
- **Mobile-first** — Responsive design

## Setup / התקנה

### Prerequisites

- Node.js 18+
- Anthropic API key

### Installation

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run in development mode
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Production Build

```bash
npm run build
npm start
```

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Text Source**: Sefaria API

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/psalms` | All 150 chapters |
| `GET /api/psalms/:chapter` | Single chapter |
| `GET /api/analysis/:chapter?age_group=adults` | AI analysis |
| `GET /api/daily` | Today's psalm |
| `GET /api/search?q=keyword` | Search |
