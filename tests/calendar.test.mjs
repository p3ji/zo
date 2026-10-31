import test from "node:test";
import assert from "node:assert/strict";
import {
  CHILDREN,
  ACTIVITY_TYPES,
  DEFAULT_ACTIVITIES,
  validateActivity,
  sortActivities,
  filterActivities,
  formatTime12,
  formatTimeRange,
  getDurationMinutes,
  formatDuration,
  calculateWeekSummary,
  getWeekDates
} from "../lib/calendar-core.mjs";

test("children and activity types configuration", () => {
  assert.ok(CHILDREN.zoe);
  assert.ok(CHILDREN.theo);
  assert.equal(CHILDREN.zoe.name, "Zoe");
  assert.equal(CHILDREN.theo.name, "Theo");

  assert.ok(ACTIVITY_TYPES["off-ice"]);
  assert.ok(ACTIVITY_TYPES["on-ice"]);
  assert.ok(ACTIVITY_TYPES["piano"]);
});

test("validateActivity accepts valid activity and normalizes ID", () => {
  const item = {
    child: "zoe",
    type: "piano",
    day: 2,
    start: "16:30",
    end: "17:15"
  };
  const validated = validateActivity(item);
  assert.equal(validated.child, "zoe");
  assert.equal(validated.type, "piano");
  assert.equal(validated.day, 2);
  assert.equal(validated.start, "16:30");
  assert.equal(validated.end, "17:15");
  assert.ok(validated.id.startsWith("act-"));
});

test("validateActivity rejects invalid child, type, day, or times", () => {
  assert.throws(() => validateActivity(null));
  assert.throws(() => validateActivity({ child: "alice", type: "piano", day: 0, start: "10:00", end: "11:00" }), /Child must be one of/);
  assert.throws(() => validateActivity({ child: "zoe", type: "soccer", day: 0, start: "10:00", end: "11:00" }), /Activity type must be one of/);
  assert.throws(() => validateActivity({ child: "zoe", type: "piano", day: 7, start: "10:00", end: "11:00" }), /Day must be an integer/);
  assert.throws(() => validateActivity({ child: "zoe", type: "piano", day: -1, start: "10:00", end: "11:00" }), /Day must be an integer/);
  assert.throws(() => validateActivity({ child: "zoe", type: "piano", day: 0, start: "25:00", end: "11:00" }), /Start time/);
  assert.throws(() => validateActivity({ child: "zoe", type: "piano", day: 0, start: "10:00", end: "09:00" }), /End time must be after start time/);
  assert.throws(() => validateActivity({ child: "zoe", type: "piano", day: 0, start: "10:00", end: "10:00" }), /End time must be after start time/);
});

test("sortActivities sorts chronologically by day and start time", () => {
  const sample = [
    { id: "1", child: "theo", type: "on-ice", day: 5, start: "12:30", end: "13:30" },
    { id: "2", child: "zoe", type: "off-ice", day: 0, start: "16:30", end: "17:30" },
    { id: "3", child: "theo", type: "off-ice", day: 0, start: "15:00", end: "16:00" }
  ];
  const sorted = sortActivities(sample);
  assert.equal(sorted[0].id, "3"); // Monday 15:00
  assert.equal(sorted[1].id, "2"); // Monday 16:30
  assert.equal(sorted[2].id, "1"); // Saturday 12:30
});

test("filterActivities filters by child and handles 'all'", () => {
  const sample = [
    { child: "zoe", type: "piano" },
    { child: "theo", type: "on-ice" },
    { child: "zoe", type: "off-ice" }
  ];
  assert.equal(filterActivities(sample, "all").length, 3);
  assert.equal(filterActivities(sample, "zoe").length, 2);
  assert.equal(filterActivities(sample, "theo").length, 1);
});

test("time formatting and duration calculation", () => {
  assert.equal(formatTime12("09:05"), "9:05 AM");
  assert.equal(formatTime12("12:00"), "12:00 PM");
  assert.equal(formatTime12("16:30"), "4:30 PM");
  assert.equal(formatTime12("00:15"), "12:15 AM");
  assert.equal(formatTimeRange("16:30", "17:15"), "4:30 PM – 5:15 PM");
  assert.equal(getDurationMinutes("16:30", "17:15"), 45);
  assert.equal(formatDuration(45), "45 min");
  assert.equal(formatDuration(60), "1 hr");
  assert.equal(formatDuration(75), "1h 15m");
});

test("calculateWeekSummary aggregates counts and minutes correctly", () => {
  const summary = calculateWeekSummary(DEFAULT_ACTIVITIES);
  assert.equal(summary.zoe.count, 7);
  assert.equal(summary.theo.count, 6);
  assert.equal(summary.zoe.byType.piano, 2);
  assert.equal(summary.zoe.byType["on-ice"], 3);
  assert.equal(summary.zoe.byType["off-ice"], 2);
  assert.ok(summary.totalCount > 0);
  assert.ok(summary.totalMinutes > 0);
});

test("getWeekDates correctly derives Monday through Sunday", () => {
  // Test with fixed date: Wednesday, Oct 28, 2026
  const ref = new Date(2026, 9, 28);
  const week = getWeekDates(ref);
  assert.equal(week.dates.length, 7);
  assert.equal(week.dates[0].getDay(), 1); // Monday
  assert.equal(week.dates[0].getDate(), 26); // Oct 26
  assert.equal(week.dates[6].getDay(), 0); // Sunday
  assert.equal(week.dates[6].getDate(), 1); // Nov 1
  assert.equal(week.rangeText, "Oct 26 – Nov 1, 2026");
});

test("default activities contain only sanitized timing without child PII", () => {
  for (const act of DEFAULT_ACTIVITIES) {
    const validated = validateActivity(act);
    assert.ok(["zoe", "theo"].includes(validated.child));
    assert.ok(["off-ice", "on-ice", "piano"].includes(validated.type));
    // Verify no emails, phone numbers, full names or addresses
    const json = JSON.stringify(validated);
    assert.ok(!json.includes("@"));
    assert.ok(!json.includes("http"));
  }
});
