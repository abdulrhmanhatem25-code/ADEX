import api from "@/shared/lib/api";

/**
 * Fetch dashboard summary data
 * GET /Dashboard/summary
 * Includes Arabic fields: levelNameAr, dayAr, userNameAr, actionAr, timeAgoAr
 */
export const getDashboardSummary = () => api.get("/Dashboard/summary");
