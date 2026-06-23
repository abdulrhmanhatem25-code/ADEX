import api from "@/shared/lib/api";

// ── Semester (Term) APIs ──────────────────────────────────────────────────────

/** GET /api/Semester → returns array of semester objects */
export const fetchSemestersApi = () => api.get("/Semester");

/** POST /api/Semester → { semesterName, semesterType } */
export const addSemesterApi = (body) => api.post("/Semester", body);

/** DELETE /api/Semester/{id} */
export const deleteSemesterApi = (id) => api.delete(`/Semester/${id}`);

/** PUT /api/Semester/toggle/{id} */
export const toggleSemesterApi = (id) => api.put(`/Semester/toggle/${id}`);

// ── Meta APIs ─────────────────────────────────────────────────────────────────
export const fetchAvailabilityModesApi = () => api.get("/Meta/instructor-availability-modes");

// ── Semester-scoped Staff APIs ────────────────────────────────────────────────

/**
 * GET /api/semesters/instructors
 * Returns paginated instructors list. Filters by semesterId and type ("Doctor" or "Technical_Assistant")
 */
export const fetchSemesterStaffApi = (semesterId, type, PageNumber = 1, PageSize = 10, SearchValue = "", SortColumn = "", SortDirection = "ascending") =>
    api.get("/semesters/instructors", {
        params: { semesterId, type, PageNumber, PageSize, SearchValue, SortColumn, SortDirection }
    });

/**
 * POST /api/semesters/{semesterId}/instructors
 * Body: { firstName, lastName, email, password, instructorCode, instructorType,
 *         availabilityMode, excludedDay, availabilities, courseCodes }
 */
export const addSemesterStaffApi = (semesterId, body) =>
    api.post(`/semesters/${semesterId}/instructors`, body);

/**
 * PUT /api/semesters/{semesterId}/instructors/{instructorId}
 *
 * Request body:
 * {
 *   firstName, firstNameAr, lastName, lastNameAr, email, instructorCode,
 *   instructorType, availabilityMode, excludedDay (string),
 *   availabilities: [{ dayOfWeek, startTime, endTime }],
 *   courseCodes: string[]
 * }
 * (No password; no instructorTypeAr on this endpoint.)
 */
export const updateSemesterStaffApi = (semesterId, instructorId, body) =>
    api.put(`/semesters/${semesterId}/instructors/${instructorId}`, body);

/**
 * POST /api/semesters/{semesterId}/instructors/clone
 * Body: { fromSemesterId, instructorIds }
 */
export const cloneSemesterStaffApi = (targetSemesterId, body) =>
    api.post(`/semesters/${targetSemesterId}/instructors/clone`, body);

/**
 * POST /api/semesters/{semesterId}/instructors/clear
 * Body: { instructorIds }
 */
export const clearSemesterStaffApi = (semesterId, body) =>
    api.post(`/semesters/${semesterId}/instructors/clear`, body);
