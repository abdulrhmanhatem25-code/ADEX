import api from "@/shared/lib/api";

export const fetchInstructorsApi = () => api.get("/Instructors");
export const fetchAllCoursesApi = () => api.get("/Courses");
export const saveSetupApi = (payload) => api.post("/Instructors/setup-existing", payload);

/**
 * Generated schedules for a level: array of groups with nested courses (lectures + labs).
 * @see `normalizeGeneratedSchedulesPayload` in `@/features/schedule/utils/generatedSchedule`
 */
export const fetchGeneratedSchedulesApi = (level) =>
  api.get(`/Scheduling/generated-schedules?level=${level}`);

// Schedule Workflow APIs
export const fetchSemestersApi = () => api.get("/Semester");
export const analyzeOfferingsApi = (semesterId) => 
  api.get(`/Scheduling/analyze-offerings?semesterId=${semesterId}`);
export const approveOfferingsApi = (payload) => 
  api.post("/Scheduling/approve-offerings", payload);
export const generateMasterScheduleApi = () => 
  api.post("/Scheduling/generate-master");

// Generation page — sync external data
export const syncExternalApi = () =>
  api.post("/Scheduling/sync-external");
