import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("coloring-giant-data.js exists and contains valid 200x200 sheet", () => {
  const filePath = path.resolve("coloring-giant-data.js");
  assert.ok(fs.existsSync(filePath), "coloring-giant-data.js must exist");

  const content = fs.readFileSync(filePath, "utf8");
  assert.ok(content.startsWith("window.COLORING_GIANT_SHEETS = "), "Must assign to window.COLORING_GIANT_SHEETS");

  const jsonStr = content.replace("window.COLORING_GIANT_SHEETS = ", "").replace(/;\s*$/, "");
  const sheets = JSON.parse(jsonStr);
  assert.ok(Array.isArray(sheets) && sheets.length > 0, "Must contain at least 1 sheet");

  const kuromi = sheets.find(s => s.id === "kuromi");
  assert.ok(kuromi, "Must have kuromi sheet");
  assert.equal(kuromi.width, 200);
  assert.equal(kuromi.height, 200);
  assert.equal(kuromi.cells.length, 40000, "Cells length must be 200 * 200 = 40,000");

  // Validate palette
  assert.ok(kuromi.palette.length >= 8 && kuromi.palette.length <= 36);
  for (const hex of kuromi.palette) {
    assert.match(hex, /^#[0-9a-fA-F]{6}$/, `Invalid hex color: ${hex}`);
  }

  // Validate cell characters
  const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, kuromi.palette.length);
  const validSet = new Set(digits);
  for (const char of kuromi.cells) {
    assert.ok(validSet.has(char), `Character ${char} out of palette range`);
  }

  // Check preview file
  const previewPath = path.resolve(kuromi.preview.replace(/^\.\//, ""));
  assert.ok(fs.existsSync(previewPath), `Preview file ${kuromi.preview} must exist`);
  assert.ok(fs.statSync(previewPath).size > 1000, "Preview file must have content");
});

test("service-worker.js precaches 200x200 coloring assets", () => {
  const swContent = fs.readFileSync(path.resolve("service-worker.js"), "utf8");
  assert.ok(swContent.includes("./coloring-giant-data.js"));
  assert.ok(swContent.includes("./art/kuromi.png"));
});

test("tools/build.mjs includes coloring-giant-data.js", () => {
  const buildContent = fs.readFileSync(path.resolve("tools/build.mjs"), "utf8");
  assert.ok(buildContent.includes("coloring-giant-data.js"));
});
