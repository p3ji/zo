export const CHILDREN = {
  zoe: { id: "zoe", name: "Zoe", emoji: "🌸", tone: "pink" },
  theo: { id: "theo", name: "Theo", emoji: "⭐", tone: "blue" }
};

export const ACTIVITY_TYPES = {
  "off-ice": { id: "off-ice", label: "Off-ice", icon: "🏃", tone: "peach" },
  "on-ice": { id: "on-ice", label: "On-ice", icon: "⛸️", tone: "blue" },
  "piano": { id: "piano", label: "Piano", icon: "🎹", tone: "lavender" }
};

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const DAY_SHORT_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DEFAULT_ACTIVITIES = [
  // Zoe's week
  { id: "def-zoe-1", child: "zoe", type: "off-ice", day: 0, start: "16:30", end: "17:30" },
  { id: "def-zoe-2", child: "zoe", type: "on-ice",  day: 1, start: "17:00", end: "18:00" },
  { id: "def-zoe-3", child: "zoe", type: "piano",   day: 2, start: "16:30", end: "17:15" },
  { id: "def-zoe-4", child: "zoe", type: "off-ice", day: 3, start: "16:00", end: "16:45" },
  { id: "def-zoe-5", child: "zoe", type: "on-ice",  day: 3, start: "17:00", end: "18:00" },
  { id: "def-zoe-6", child: "zoe", type: "piano",   day: 5, start: "10:00", end: "10:45" },
  { id: "def-zoe-7", child: "zoe", type: "on-ice",  day: 5, start: "11:30", end: "12:30" },
  // Theo's week
  { id: "def-theo-1", child: "theo", type: "off-ice", day: 0, start: "17:30", end: "18:15" },
  { id: "def-theo-2", child: "theo", type: "on-ice",  day: 1, start: "18:00", end: "19:00" },
  { id: "def-theo-3", child: "theo", type: "piano",   day: 2, start: "17:15", end: "17:45" },
  { id: "def-theo-4", child: "theo", type: "off-ice", day: 4, start: "16:30", end: "17:30" },
  { id: "def-theo-5", child: "theo", type: "piano",   day: 5, start: "10:45", end: "11:15" },
  { id: "def-theo-6", child: "theo", type: "on-ice",  day: 5, start: "12:30", end: "13:30" }
];

export function parseMinutes(timeStr) {
  if (typeof timeStr !== "string" || !/^\d{2}:\d{2}$/.test(timeStr)) return NaN;
  const [h, m] = timeStr.split(":").map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return NaN;
  return h * 60 + m;
}

export function formatTime12(timeStr) {
  const mins = parseMinutes(timeStr);
  if (Number.isNaN(mins)) return timeStr;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = String(minutes).padStart(2, "0");
  return `${displayHours}:${displayMins} ${ampm}`;
}

export function formatTimeRange(start, end) {
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}

export function getDurationMinutes(start, end) {
  const s = parseMinutes(start);
  const e = parseMinutes(end);
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return 0;
  return e - s;
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h}h ${m}m`;
}

export function validateActivity(activity) {
  if (!activity || typeof activity !== "object") {
    throw new Error("Activity must be an object");
  }
  if (!CHILDREN[activity.child]) {
    throw new Error(`Child must be one of: ${Object.keys(CHILDREN).join(", ")}`);
  }
  if (!ACTIVITY_TYPES[activity.type]) {
    throw new Error(`Activity type must be one of: ${Object.keys(ACTIVITY_TYPES).join(", ")}`);
  }
  const day = Number(activity.day);
  if (!Number.isInteger(day) || day < 0 || day > 6) {
    throw new Error("Day must be an integer between 0 (Monday) and 6 (Sunday)");
  }
  const startMins = parseMinutes(activity.start);
  if (Number.isNaN(startMins)) {
    throw new Error("Start time must be a valid 24h time in HH:MM format");
  }
  const endMins = parseMinutes(activity.end);
  if (Number.isNaN(endMins)) {
    throw new Error("End time must be a valid 24h time in HH:MM format");
  }
  if (endMins <= startMins) {
    throw new Error("End time must be after start time");
  }

  const id = typeof activity.id === "string" && activity.id.trim()
    ? activity.id.trim()
    : `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    child: activity.child,
    type: activity.type,
    day,
    start: activity.start,
    end: activity.end
  };
}

export function sortActivities(activities) {
  if (!Array.isArray(activities)) return [];
  return [...activities].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    const aStart = parseMinutes(a.start) || 0;
    const bStart = parseMinutes(b.start) || 0;
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = parseMinutes(a.end) || 0;
    const bEnd = parseMinutes(b.end) || 0;
    if (aEnd !== bEnd) return aEnd - bEnd;
    return a.child.localeCompare(b.child);
  });
}

export function filterActivities(activities, childFilter = "all") {
  if (!Array.isArray(activities)) return [];
  if (childFilter === "all" || !childFilter) return activities;
  return activities.filter(a => a.child === childFilter);
}

export function calculateWeekSummary(activities) {
  const summary = {
    zoe: { count: 0, minutes: 0, byType: { "off-ice": 0, "on-ice": 0, piano: 0 } },
    theo: { count: 0, minutes: 0, byType: { "off-ice": 0, "on-ice": 0, piano: 0 } },
    totalCount: 0,
    totalMinutes: 0
  };

  if (!Array.isArray(activities)) return summary;

  for (const act of activities) {
    if (!summary[act.child]) continue;
    const dur = getDurationMinutes(act.start, act.end);
    summary[act.child].count += 1;
    summary[act.child].minutes += dur;
    if (summary[act.child].byType[act.type] !== undefined) {
      summary[act.child].byType[act.type] += 1;
    }
    summary.totalCount += 1;
    summary.totalMinutes += dur;
  }

  return summary;
}

export function getWeekDates(refDate = new Date()) {
  const current = new Date(refDate);
  // Sunday is 0 in JS Date; we want Monday as 0, Sunday as 6
  const jsDay = current.getDay();
  const dayOffset = jsDay === 0 ? 6 : jsDay - 1; // 0 for Mon, 6 for Sun
  const monday = new Date(current.getFullYear(), current.getMonth(), current.getDate() - dayOffset);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    dates.push(d);
  }

  const startMonth = dates[0].toLocaleString("en-US", { month: "short" });
  const startDay = dates[0].getDate();
  const endMonth = dates[6].toLocaleString("en-US", { month: "short" });
  const endDay = dates[6].getDate();
  const year = dates[6].getFullYear();

  const rangeText = startMonth === endMonth
    ? `${startMonth} ${startDay} – ${endDay}, ${year}`
    : `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;

  return { dates, rangeText, mondayIndex: dayOffset };
}
