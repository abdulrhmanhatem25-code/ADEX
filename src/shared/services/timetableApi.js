import api from "@/shared/lib/api";

/**
 * جلب جدول المحاضر بالـ instructor ID
 * GET /api/Instructors/{id}/timetable
 */
export const fetchInstructorTimetable = (instructorId) =>
    api.get(`/Instructors/${instructorId}/timetable`);

/**
 * جلب جدول الطالب بالـ student ID
 * GET /api/Enrollments/timetable/{studentId}
 */
export const fetchStudentTimetable = (studentId) =>
    api.get(`/Enrollments/timetable/${studentId}`);
