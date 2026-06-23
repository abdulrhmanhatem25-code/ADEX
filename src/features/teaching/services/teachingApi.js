import api from "@/shared/lib/api";

/**
 * GET /api/Instructors/my-colleagues
 * Returns array of courses with their colleague instructors.
 */
export async function fetchMyColleaguesApi() {
  const res = await api.get("/Instructors/my-colleagues");
  return res.data;
}
