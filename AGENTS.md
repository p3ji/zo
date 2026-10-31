# Piano Pals (`zoe`) — Agent Guide

> Single source of truth for *how to work on this repo*. Claude, Hermes, and Antigravity all read this (`CLAUDE.md` → `@AGENTS.md`; `GEMINI.md` → pointer). Keep it short (<100 lines). *(Updated 2026-10-16.)*

**Brain note (goals, backlog, full context):** `/Users/pushp/Brain2/Projects/zoe.md`
**Canonical Path:** `/Users/pushp/Documents/Projects/zoe` (consolidated from `aijobpersonal/zoe` and `zoe/zoe` — never re-nest inside another repo).
**Public GitHub:** `https://github.com/p3ji/zo` (`git push origin main` triggers `.github/workflows/deploy.yml`)
**Live Site:** `https://pianopals.netlify.app/`

## Architecture & Key Files
- `index.html`, `app.js`, `styles.css` — Mobile/iPad-first Piano Pals practice companion: interactive practice timer, sticker prize backpack, room decorating studio, 100×100 & 150×150 kawaii colour-by-number sheets (`color-by-number.js`), and shared practice leaderboard.
- `art/` — Custom kawaii PNG assets (`scripts/make-kawaii-coloring.swift` / Pillow / ComfyUI `:8188`).
- `netlify/functions/leaderboard.mjs` — Serverless shared practice leaderboard backed by Netlify Blobs (stores screened nickname + aggregate unique practice-day score only; device pass stays in `localStorage`).
- `service-worker.js` — Network-first with offline cache fallback (`CACHE` version constant).

## Run / test / deploy
- Run unit tests (nickname screening, unique practice dates, leaderboard auth/sync): `npm test` (`node --test tests/*.test.mjs`)
- Regenerate kawaii colouring grids: `swift scripts/make-kawaii-coloring.swift`

## Multi-Agent Teamwork & Verification Gates (`Hermes <-> Antigravity`)
- **Hermes / Local Asset Scripts:**
  - Can run batch image/grid generation scripts (`scripts/make-kawaii-coloring.swift`, ComfyUI `:8188` workflows) and `npm test`.
- **Antigravity (`Gemini 3.8 Pro` / `Claude Opus 4.6` interactive IDE):**
  - Owns iPad/touch UI (`app.js`, `styles.css`, `color-by-number.js`), Netlify Functions (`netlify/functions/leaderboard.mjs`), and visual asset inspection.
- **Mandatory Verification Gates (Required before `git push` or reporting DONE):**
  1. **Visual Art & Transparency QA Gate:** Whenever generating or modifying PNGs in `art/` or colour-by-number palettes in `color-by-number.js`, inspect the rendered PNG via `view_file` to verify transparent alpha channels, crisp line art, and palette contrast before wiring into `app.js`.
  2. **Service Worker Cache Gate:** Whenever adding, renaming, or changing precached files (`index.html`, `app.js`, `styles.css`, `color-by-number.js`, `art/*`), bump the `CACHE` constant in `service-worker.js`.
  3. **Unit Test & Child-Privacy Gate:** Run `npm test` (must pass 100%) and verify zero child PII (real full names, emails, or contact details) is ever stored in the repo or transmitted to Netlify Blobs.

