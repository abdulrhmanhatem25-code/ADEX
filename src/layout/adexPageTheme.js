/**
 * Maps URL pathname → `data-adex-page` value for CSS page tokens (`--pg-*`, `--page-*`).
 * Keep keys in sync with `[data-adex-page="…"]` blocks in `src/index.css`.
 */
export const ADEX_PAGE_KEYS = {
  DEFAULT: "default",
  HOME: "home",
  DASHBOARD: "dashboard",
  SCHEDULE: "schedule",
  TIMETABLE: "timetable",
  STUDENTS: "students",
  COURSES: "courses",
  ROOMS: "rooms",
  STAFF: "staff",
  STUDENT_REGISTRATION: "student-registration",
  ADVISOR: "advisor",
  SETTINGS: "settings",
  IMPORT: "import",
  USER_MANAGEMENT: "user-management",
  ACADEMIC_REGISTRATION: "academic-registration",
  VIEW_SCHEDULES: "view-schedules",
};

/**
 * @param {string} pathname
 * @returns {string}
 */
export function getAdexPageKey(pathname) {
  if (!pathname) return ADEX_PAGE_KEYS.DEFAULT;
  const p = pathname.split("?")[0] || "";

  if (p === "/home" || p === "/") return ADEX_PAGE_KEYS.HOME;
  if (p === "/dashboard") return ADEX_PAGE_KEYS.DASHBOARD;
  if (p === "/schedule-control" || p === "/edit-schedule" || p === "/view-schedule") {
    return ADEX_PAGE_KEYS.SCHEDULE;
  }
  if (p === "/timetable") return ADEX_PAGE_KEYS.TIMETABLE;
  if (p.startsWith("/students/")) return ADEX_PAGE_KEYS.STUDENTS;
  if (p === "/students") return ADEX_PAGE_KEYS.STUDENTS;
  if (p === "/courses") return ADEX_PAGE_KEYS.COURSES;
  if (p === "/rooms") return ADEX_PAGE_KEYS.ROOMS;
  if (p === "/staff") return ADEX_PAGE_KEYS.STAFF;
  if (p === "/student-registration") return ADEX_PAGE_KEYS.STUDENT_REGISTRATION;
  if (p === "/advisor-students") return ADEX_PAGE_KEYS.ADVISOR;
  if (p === "/settings") return ADEX_PAGE_KEYS.SETTINGS;
  if (p === "/import-records") return ADEX_PAGE_KEYS.IMPORT;
  if (p === "/user-management") return ADEX_PAGE_KEYS.USER_MANAGEMENT;
  if (p === "/academic-registration") return ADEX_PAGE_KEYS.ACADEMIC_REGISTRATION;
  if (p === "/view-schedules") return ADEX_PAGE_KEYS.VIEW_SCHEDULES;

  return ADEX_PAGE_KEYS.DEFAULT;
}
