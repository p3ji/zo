# Piano Pals

A small, local browser game for tracking piano practice and earning tickets. The tasks, ticket values, animal list, prizes, and seasonal ideas come from `Ideas for Ticket Pet-2.md`.

**Play online:** https://pianopals.netlify.app/

Open `index.html` in a browser, or serve this folder with `python3 -m http.server 8000` and visit `http://localhost:8000`.

Practice details, tickets, rewards, and artwork are saved in this browser's `localStorage`. They are not synced between devices or accounts. Clearing browser data resets that progress. Real prize redemptions are recorded in the app; a grown-up fulfills them separately.

The optional **Leaderboard** shares only a nickname and total practice-day score through a Netlify Function and Netlify Blobs. Joining creates a private browser pass in `localStorage`, so the same browser can update or remove its entry without sign-in. Scores are based on local practice history and are an honour system; the app does not store practice dates online. The public GitHub Pages mirror links to the Netlify leaderboard. For local development, `npm ci && npm run build` checks the static bundle; the shared board needs Netlify Functions or a local API mock.

The **My things** area lets players decorate a school bag, skates, suitcase, and lunch bag with draggable stickers. Each item keeps its own stickers and position across sessions. Existing bag decorations stay on the school bag. The prize shop groups stickers, books, and outings; themed digital stickers join the original real sticker rewards.

The colouring studio has four original 40 × 40 sheets, three detailed 100 × 100 sheets, and three kawaii 150 × 150 sheets. It includes a free starter picture, numbered colours, drag painting, picture zoom, hints, and saved progress. Page pinch and double-tap zoom are disabled for touch play; the studio's picture zoom buttons remain available. See [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md) for the next ideas.

On an iPad, open the live HTTPS link in Safari, tap **Share**, then **Add to Home Screen**. After the first visit, the app can reopen offline. Keep using the same browser or home screen installation to retain progress.
