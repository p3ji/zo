import { cp, mkdir } from "node:fs/promises";

await mkdir("dist", { recursive: true });
for (const file of ["index.html", "style.css", "app.js", "play.js", "leaderboard.js", "calendar.js", "coloring-data.js", "coloring-large-data.js", "coloring-kawaii-data.js", "coloring-giant-data.js", "surface-art.js", "service-worker.js", "manifest.json"]) {
  await cp(file, `dist/${file}`);
}
for (const folder of ["art", "icons"]) await cp(folder, `dist/${folder}`, { recursive: true });
