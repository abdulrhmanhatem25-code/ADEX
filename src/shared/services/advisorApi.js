import api from "@/shared/lib/api";

/**
 * Fetch advisor's students with registration status
 * GET /Instructors/advisor/students?instructorId={id}
 * Returns: { students: [...], summary: {...} }
 */
export const getAdvisorStudents = (instructorId) =>
    api.get("/Instructors/advisor/students", { params: { instructorId } });

/**
 * Fetch all advisors' progress summary (SuperAdmin only)
 * GET /Instructors/all-advisors-progress
 * Returns: [{ instructorId, advisorName, totalStudents, studentsFinished, studentsRemaining, completionPercentage }]
 */
export const getAllAdvisorsProgress = (pageNumber = 1, pageSize = 12, search = "") =>
    api.get("/Instructors/all-advisors-progress", {
        params: { pageNumber, pageSize, search }
    });
