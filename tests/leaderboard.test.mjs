import test from "node:test";
import assert from "node:assert/strict";
import { cleanNickname, countPracticeDays, createHandler } from "../netlify/lib/leaderboard-core.mjs";

class MemoryStore {
  values = new Map();
  async list() { return { blobs: [...this.values.keys()].map(key => ({ key })) }; }
  async get(key) { return this.values.get(key)?.data ?? null; }
  async getWithMetadata(key) { return this.values.get(key) ?? null; }
  async setJSON(key, data, options = {}) {
    const prior = this.values.get(key);
    if (options.onlyIfNew && prior) return { modified: false };
    if (options.onlyIfMatch && prior?.etag !== options.onlyIfMatch) return { modified: false };
    const etag = `"${Number(prior?.etag.replaceAll('"', '') || 0) + 1}"`;
    this.values.set(key, { data, etag });
    return { modified: true, etag };
  }
  async delete(key) { this.values.delete(key); }
}

const today = new Date().toISOString().slice(0, 10);
const request = (body, origin = "https://pianopals.netlify.app") => new Request(`${origin}/.netlify/functions/leaderboard`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });

test("nickname screening and unique practice dates", () => {
  assert.equal(cleanNickname(" StarPiano "), "StarPiano");
  assert.throws(() => cleanNickname("Two Names"));
  assert.throws(() => cleanNickname("fUck"));
  assert.equal(countPracticeDays([today, today]), 1);
  assert.throws(() => countPracticeDays(["2026-02-30"]));
});

test("join, sync, read, reject wrong pass, and leave", async () => {
  const store = new MemoryStore();
  const handler = createHandler(() => store);
  const joined = await handler(request({ action: "join", nickname: "StarPiano", days: [today, today] }));
  assert.equal(joined.status, 201);
  const { player, secret } = await joined.json();
  assert.equal(player.score, 1);
  assert.equal((await handler(request({ action: "sync", id: player.id, secret: "0".repeat(64), nickname: "StarPiano", days: [today] }))).status, 401);
  const sync = await handler(request({ action: "sync", id: player.id, secret, nickname: "MoonKeys", days: [today] }));
  assert.equal(sync.status, 200);
  assert.equal((await sync.json()).player.nickname, "MoonKeys");
  const board = await (await handler(new Request("https://pianopals.netlify.app/.netlify/functions/leaderboard"))).json();
  assert.deepEqual(board.entries.map(({ nickname, score }) => ({ nickname, score })), [{ nickname: "MoonKeys", score: 1 }]);
  assert.equal(JSON.stringify(board).includes(secret), false);
  assert.equal((await handler(request({ action: "leave", id: player.id, secret }))).status, 200);
  assert.deepEqual((await (await handler(new Request("https://pianopals.netlify.app/.netlify/functions/leaderboard"))).json()).entries, []);
});
