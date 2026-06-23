import api from "@/shared/lib/api";

/**
 * Fetch available reports metadata
 * GET /api/Reports/export
 */
export const getReportsMetadata = async () => {
    return await api.get("/Reports/export");
};

/**
 * Download a dynamic report
 * GET /api/Reports/export/{reportKey}
 * Returns a file blob
 */
export const downloadDynamicReport = async (reportKey, params = {}) => {
    const response = await api.get(`/Reports/export/${reportKey}`, {
        params,
        responseType: "blob",
    });
    return response;
};
