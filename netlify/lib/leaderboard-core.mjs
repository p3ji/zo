import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { Filter } from "bad-words";

const filter = new Filter();
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 16_000;
const MAX_PLAYERS_READ = 500;

function reply(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function cleanNickname(value) {
  if (typeof value !== "string") throw new Error("Choose a nickname first.");
  const nickname = value.normalize("NFKC").trim();
  if (!/^[A-Za-z][A-Za-z0-9]{1,15}$/.test(nickname)) throw new Error("Use one nickname, 2–16 letters or numbers, starting with a letter.");
  const plain = nickname.toLowerCase().replace(/[0134578]/g, digit => ({ 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", 8: "b" })[digit]);
  if (filter.isProfane(nickname) || filter.isProfane(plain)) throw new Error("Please choose a kinder nickname.");
  return nickname;
}

export function countPracticeDays(value, now = Date.now()) {
  if (!Array.isArray(value) || value.length > 3700) throw new Error("Practice history is too long.");
  const days = new Set();
  for (const day of value) {
    if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Practice history has an invalid date.");
    const time = Date.parse(`${day}T12:00:00Z`);
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== day || time > now + 36 * 60 * 60 * 1000 || time < now - 10 * 365 * 24 * 60 * 60 * 1000) throw new Error("Practice history has an invalid date.");
    days.add(day);
  }
  return days.size;
}

function hash(secret) { return createHash("sha256").update(secret).digest(); }
function validSecret(provided, stored) {
  if (typeof provided !== "string" || !/^[a-f0-9]{64}$/.test(provided) || typeof stored !== "string" || !/^[a-f0-9]{64}$/.test(stored)) return false;
  return timingSafeEqual(hash(provided), Buffer.from(stored, "hex"));
}

async function getPlayer(store, id, secret) {
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return null;
  const entry = await store.getWithMetadata(`players/${id}`, { type: "json", consistency: "strong" });
  if (!entry || !validSecret(secret, entry.data.secretHash)) return null;
  return entry;
}

export function createHandler(getStore) {
  return async function leaderboard(request) {
    try {
      const store = getStore();
      if (request.method === "GET") {
        const { blobs } = await store.list({ prefix: "players/" });
        if (blobs.length > MAX_PLAYERS_READ) return reply({ error: "The board is busy. Please try again later." }, 503);
        const players = await Promise.all(blobs.map(({ key }) => store.get(key, { type: "json", consistency: "strong" })));
        const entries = players.filter(Boolean).map(({ id, nickname, score }) => ({ id, nickname, score }))
          .filter(player => ID_PATTERN.test(player.id) && typeof player.nickname === "string" && Number.isInteger(player.score))
          .sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname)).slice(0, 30);
        return reply({ entries });
      }
      if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
      // The browser uses this same-origin endpoint. Reject cross-site form posts.
      if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: "Request origin is not allowed." }, 403);
      if (!(request.headers.get("content-type") || "").startsWith("application/json")) return reply({ error: "Expected JSON." }, 415);
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return reply({ error: "Request is too large." }, 413);
      let input;
      try { input = JSON.parse(raw); } catch { return reply({ error: "Invalid request." }, 400); }
      if (!input || typeof input !== "object" || Array.isArray(input)) return reply({ error: "Invalid request." }, 400);

      if (input.action === "join") {
        const nickname = cleanNickname(input.nickname);
        const score = countPracticeDays(input.days);
        const id = randomUUID();
        const secret = randomBytes(32).toString("hex");
        const player = { id, nickname, score, secretHash: hash(secret).toString("hex") };
        const { modified } = await store.setJSON(`players/${id}`, player, { onlyIfNew: true });
        if (!modified) return reply({ error: "Please try again." }, 503);
        return reply({ player: { id, nickname, score }, secret }, 201);
      }

      const entry = await getPlayer(store, input.id, input.secret);
      if (!entry) return reply({ error: "This browser's leaderboard pass is missing. Join again with a new nickname." }, 401);
      if (input.action === "leave") {
        await store.delete(`players/${input.id}`);
        return reply({ removed: true });
      }
      if (input.action !== "sync") return reply({ error: "Unknown action." }, 400);
      const nickname = cleanNickname(input.nickname);
      const score = Math.max(entry.data.score, countPracticeDays(input.days));
      const player = { ...entry.data, nickname, score };
      const { modified } = await store.setJSON(`players/${input.id}`, player, { onlyIfMatch: entry.etag });
      if (!modified) return reply({ error: "The board changed. Please try again." }, 409);
      return reply({ player: { id: player.id, nickname, score } });
    } catch (error) {
      if (error.message?.startsWith("Practice history") || error.message?.startsWith("Choose") || error.message?.startsWith("Use one") || error.message?.startsWith("Please choose")) return reply({ error: error.message }, 400);
      console.error("Leaderboard request failed", error);
      return reply({ error: "The leaderboard is unavailable right now. Please try later." }, 503);
    }
  };
}
