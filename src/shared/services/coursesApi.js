import api from "@/shared/lib/api";

export const fetchCoursesApi = (page = 1, limit = 6, search = "", sortColumn = "", sortDirection = "") =>
    api.get("/Courses", {
        params: {
            PageNumber: page,
            PageSize: limit,
            ...(search && { SearchValue: search }),
            ...(sortColumn && { SortColumn: sortColumn }),
            ...(sortDirection && { SortDirection: sortDirection }),
        }
    });

export const bulkImportCoursesApi = (body) => api.post("/Courses/bulk-import", body);
export const updateCourseApi = (body) => api.put("/Courses/bulk-update", body);
export const toggleCourseApi = (courseCode) => api.put("/Courses/toggle", { courseCode });
export const fetchPrereqsApi = (courseCode) => api.get(`/Prerequisites/Course/${courseCode}`);

// GET /api/ProgramCourses/:programId 
export const fetchProgramCoursesApi = (programId) => api.get(`/ProgramCourses/${programId}`);
export const fetchProgramsApi = () => api.get("/Programs");
