import api from "@/shared/lib/api";

export async function getRegistrationPlan(studentId) {
  if (!studentId) throw new Error("studentId is required");
  const res = await api.get(`/Enrollments/available/${studentId}`);
  return res.data;
}

// POST /api/Enrollments/apply-bulk
export async function applyBulkEnrollment(payload) {
  const res = await api.post("/Enrollments/apply-bulk", payload);
  return res.data;
}

// POST /api/Enrollments/drop-courses
export async function dropCoursesApi(enrollmentIds) {
  const res = await api.post("/Enrollments/drop-courses", { enrollmentIds });
  return res.data;
}

// GET /api/Enrollments/all-offered-courses?studentCode=...
export async function fetchAllOfferedCoursesApi(studentCode) {
  const res = await api.get("/Enrollments/all-offered-courses", { params: { studentCode } });
  return res.data;
}

// POST /api/Enrollments/submit-rating
export async function submitRatingApi({ studentId, ratingScore, comment }) {
  const res = await api.post("/Enrollments/submit-rating", { studentId, ratingScore, comment });
  return res.data;
}

// GET /api/Enrollments/ratings
export async function fetchRatingsApi() {
  const res = await api.get("/Enrollments/ratings");
  return res.data;
}

// GET /api/Enrollments/instructor-ratings
export async function fetchInstructorRatingsApi() {
  const res = await api.get("/Enrollments/instructor-ratings");
  return res.data;
}

// POST /api/Enrollments/submit-instructor-rating
export async function submitInstructorRatingApi({ instructorId, ratingScore, comment }) {
  const res = await api.post("/Enrollments/submit-instructor-rating", { instructorId, ratingScore, comment });
  return res.data;
}
