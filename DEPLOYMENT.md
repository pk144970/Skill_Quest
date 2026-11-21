# SkillQuest — Deployment Guide

## Project Structure
- **Frontend**: React + Vite + Tailwind (built to `dist/`)
- **Backend**: Express server (`server.ts` → `dist/server.cjs`)
- **Database**: node:sqlite (Node 22) with JSON fallback
- **AI**: Google Gemini (lazy-loaded, falls back gracefully without key)

## Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google AI Studio API key | Optional (AI features disabled without it) |
| `GEMINI_MODEL` | Gemini model override | Optional (defaults to `gemini-3.5-flash-lite`) |
| `PORT` | Server port | Optional (defaults to 3000) |
| `NODE_ENV` | Set to `production` | Required |

## Platform-Specific Deployment

### Railway (Recommended — zero code changes)
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
railway init
railway up

# 3. Set environment variables in Railway dashboard
# GEMINI_API_KEY=your_new_key
# NODE_ENV=production
```
Build command: `npm run build`  
Start command: `npm start`

### Render (Alternative — zero code changes)
- Connect GitHub repo at render.com
- Build command: `npm run build`
- Start command: `npm start`
- Add `GEMINI_API_KEY` and `NODE_ENV=production` in Environment tab

### Vercel (Frontend only — requires backend adaptation)
See `vercel.json` for static + serverless config.
Note: SQLite and SSE require external database (Neon/Turso) and polling replacement.

## Local Development
```bash
npm install
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm run dev
```
