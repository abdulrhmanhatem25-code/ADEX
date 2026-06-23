/** English weekday keys used by the schedule grid (API `day` should match one of these). */
export const SCHEDULE_GRID_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

const DAY_NORMALIZE = (() => {
  const m = new Map();
  for (const d of SCHEDULE_GRID_DAYS) {
    m.set(d.toLowerCase(), d);
    m.set(d, d);
  }
  const pairs = [
    ["السبت", "Saturday"],
    ["الأحد", "Sunday"],
    ["الاحد", "Sunday"],
    ["الإثنين", "Monday"],
    ["الاثنين", "Monday"],
    ["الثلاثاء", "Tuesday"],
    ["الأربعاء", "Wednesday"],
    ["الاربعاء", "Wednesday"],
    ["الخميس", "Thursday"],
  ];
  for (const [k, v] of pairs) m.set(k, v);
  return m;
})();

/**
 * Map API `day` / `dayAr` to a grid column key in SCHEDULE_GRID_DAYS.
 */
export function normalizeGridDay(day, dayAr) {
  const candidates = [day, dayAr].filter(Boolean);
  for (const raw of candidates) {
    const t = String(raw).trim();
    if (SCHEDULE_GRID_DAYS.includes(t)) return t;
    const fromMap = DAY_NORMALIZE.get(t) ?? DAY_NORMALIZE.get(t.toLowerCase());
    if (fromMap) return fromMap;
  }
  return "";
}

/**
 * Map API session type to UI style bucket: "Lecture" | "Lab".
 */
export function normalizeSessionKind(type, typeAr) {
  const s = `${type ?? ""} ${typeAr ?? ""}`.toLowerCase();
  if (
    s.includes("lecture") ||
    s.includes("محاضرة") ||
    /\blec\b/.test(s)
  ) {
    return "Lecture";
  }
  return "Lab";
}

/**
 * Parse time string: supports "HH:MM - HH:MM", "h:mm AM - h:mm PM", or single slot.
 */
export function parseGeneratedTime(timeStr = "") {
  const s = String(timeStr).trim();
  if (!s) return { start: "", end: "" };
  const parts = s.split(/\s*-\s*/).map((t) => t.trim());
  if (parts.length >= 2) return { start: parts[0] ?? "", end: parts[1] ?? "" };
  return { start: s, end: "" };
}

/**
 * @returns {Array<{ groupId, groupName, groupNameAr, availableSeats, courses }>}
 */
export function normalizeGeneratedSchedulesPayload(data) {
  if (!data) return [];
  const arr = Array.isArray(data) ? data : data?.items ?? data?.groups ?? [];
  return arr.map((g) => ({
    groupId: g.groupId ?? 0,
    groupName: g.groupName ?? "",
    groupNameAr: g.groupNameAr ?? "",
    availableSeats: g.availableSeats ?? 0,
    courses: Array.isArray(g.courses)
      ? g.courses.map((c) => ({
          courseCode: c.courseCode ?? "",
          courseName: c.courseName ?? "",
          courseNameAr: c.courseNameAr ?? "",
          availableSeats: c.availableSeats ?? 0,
          lectures: Array.isArray(c.lectures) ? c.lectures : [],
          labs: Array.isArray(c.labs) ? c.labs : [],
        }))
      : [],
  }));
}
