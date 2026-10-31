import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const HALLOWEEN_COSTUMES = ["witch-hat", "pumpkin-hat", "bat-wings", "ghost-hood"];

test("all snake costume images exist in art directory", () => {
  const baseImg = path.resolve("art/snake.png");
  assert.ok(fs.existsSync(baseImg), "Base snake.png must exist");
  assert.ok(fs.statSync(baseImg).size > 1000, "Base snake.png must have content");

  for (const costume of HALLOWEEN_COSTUMES) {
    const costumeImg = path.resolve(`art/snake-${costume}.png`);
    assert.ok(fs.existsSync(costumeImg), `Costume image snake-${costume}.png must exist`);
    assert.ok(fs.statSync(costumeImg).size > 1000, `Costume image snake-${costume}.png must have content`);
  }
});

test("service-worker.js precaches all snake costume assets", () => {
  const swContent = fs.readFileSync(path.resolve("service-worker.js"), "utf8");
  assert.ok(swContent.includes("./art/snake.png"), "service worker must precache ./art/snake.png");
  for (const costume of HALLOWEEN_COSTUMES) {
    assert.ok(swContent.includes(`./art/snake-${costume}.png`), `service worker must precache ./art/snake-${costume}.png`);
  }
});

test("tools/build.mjs copies art directory into dist", () => {
  const buildContent = fs.readFileSync(path.resolve("tools/build.mjs"), "utf8");
  assert.ok(buildContent.includes('cp(folder, `dist/${folder}`'), "build tool must copy art recursively");
});
