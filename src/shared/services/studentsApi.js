import api from "@/shared/lib/api";

export const fetchStudentsApi = (page = 1, limit = 10, search = "", sortColumn = "", sortDirection = "") =>
    api.get("/Students", {
        params: {
            PageNumber: page,
            PageSize: limit,
            ...(search && { SearchValue: search }),
            ...(sortColumn && { SortColumn: sortColumn }),
            ...(sortDirection && { SortDirection: sortDirection }),
        }
    });

// GET /api/Students/my-advisees?programName=it|cs
// يجلب طلاب المرشد الأكاديمي (للـ TH / Technical Assistant)
export const fetchAdviseesApi = (programName = "", page = 1, limit = 10, search = "") =>
    api.get("/Instructors/my-advisees", {
        params: {
            ...(programName && { programName: programName }),
            PageNumber: page,
            PageSize: limit,
            ...(search && { SearchValue: search })
        }
    });

export const fetchAcademicStatusApi = (code) =>
    api.get(`/StudentAcademicRecords/academic-status/${code}`);

export const fetchAcademicRecordsApi = (code) =>
    api.get(`/StudentAcademicRecords/student-code/${code}`);

// GET /api/Enrollments/timetable/:studentId
// نفس الـ endpoint المستخدم في TimeTable.jsx ولكن بـ studentId رقمي
export const fetchStudentTimetableByIdApi = (studentId) =>
    api.get(`/Enrollments/timetable/${studentId}`);

// GET /api/Students/my-suggested-courses?studentId=:id
// يجلب المواد المقترحة والمقفولة للطالب (للـ CurriculumGraph)
export const fetchSuggestedCoursesApi = (studentId) =>
    api.get("/Students/my-suggested-courses", { params: { studentId } });

// PUT /api/Enrollments/approve/:studentId
// Advisor/Admin approves the student's enrollment schedule
export const approveEnrollmentApi = (studentId) =>
    api.put(`/Enrollments/approve/${studentId}`);

// PUT /api/Enrollments/credit-hours
// SuperAdmin updates a student's allowed credit-hours limit
export const updateCreditHoursApi = (studentId, newLimit) =>
    api.put("/Enrollments/credit-hours", { studentId, newLimit });

// GET /api/Students/id/:studentId
// Fetches a single student's details by their numeric ID
export const fetchStudentByIdApi = (studentId) =>
    api.get(`/Students/id/${studentId}`);
