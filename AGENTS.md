# Piano Pals deployment

- Primary live site: https://pianopals.netlify.app/
- GitHub Pages mirror: https://civik.peji.ca/zo/
- Public source repository: https://github.com/p3ji/zo
- GitHub Pages deploys on pushes to `main` through `.github/workflows/deploy.yml`. The deploy command in a checkout of the public repository is `git push origin main` after committing the app files.
- The Netlify site's build connection was not inspected. Verify the primary URL after future updates; deploy there through its Netlify dashboard if it does not update from GitHub.
- The service worker fetches current files when online and keeps an offline copy. Bump the `CACHE` value in `service-worker.js` when changing the precached asset list.
- Progress lives only in the browser's `localStorage`. Do not add child contact details or other personal information to this public app repository.
