import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("coloring-giant-data.js exists and contains valid 200x200 sheets", () => {
  const filePath = path.resolve("coloring-giant-data.js");
  assert.ok(fs.existsSync(filePath), "coloring-giant-data.js must exist");

  const content = fs.readFileSync(filePath, "utf8");
  assert.ok(content.startsWith("window.COLORING_GIANT_SHEETS = "), "Must assign to window.COLORING_GIANT_SHEETS");

  const jsonStr = content.replace("window.COLORING_GIANT_SHEETS = ", "").replace(/;\s*$/, "");
  const sheets = JSON.parse(jsonStr);
  assert.equal(sheets.length, 2, "Must contain 2 giant sheets");

  for (const sheetId of ["kuromi", "cinnamoroll"]) {
    const sheet = sheets.find(s => s.id === sheetId);
    assert.ok(sheet, `Must have ${sheetId} sheet`);
    assert.equal(sheet.width, 200);
    assert.equal(sheet.height, 200);
    assert.equal(sheet.cells.length, 40000, "Cells length must be 200 * 200 = 40,000");

    // Validate palette
    assert.ok(sheet.palette.length >= 8 && sheet.palette.length <= 36);
    for (const hex of sheet.palette) {
      assert.match(hex, /^#[0-9a-fA-F]{6}$/, `Invalid hex color: ${hex}`);
    }

    // Validate cell characters
    const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, sheet.palette.length);
    const validSet = new Set(digits);
    for (const char of sheet.cells) {
      assert.ok(validSet.has(char), `Character ${char} out of palette range in ${sheetId}`);
    }

    // Check preview file
    const previewPath = path.resolve(sheet.preview.replace(/^\.\//, ""));
    assert.ok(fs.existsSync(previewPath), `Preview file ${sheet.preview} must exist`);
    assert.ok(fs.statSync(previewPath).size > 1000, `Preview file ${sheet.preview} must have content`);
  }
});

test("service-worker.js precaches 200x200 coloring assets", () => {
  const swContent = fs.readFileSync(path.resolve("service-worker.js"), "utf8");
  assert.ok(swContent.includes("./coloring-giant-data.js"));
  assert.ok(swContent.includes("./art/kuromi.png"));
  assert.ok(swContent.includes("./art/cinnamoroll.png"));
});

test("tools/build.mjs includes coloring-giant-data.js", () => {
  const buildContent = fs.readFileSync(path.resolve("tools/build.mjs"), "utf8");
  assert.ok(buildContent.includes("coloring-giant-data.js"));
});
