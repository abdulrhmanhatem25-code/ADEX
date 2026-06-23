import api from "@/shared/lib/api";

/**
 * GET /api/AuditLogs
 * Fetch paginated audit logs with optional filters.
 *
 * @param {Object} params
 * @param {number}  [params.PageNumber]
 * @param {number}  [params.PageSize]
 * @param {string}  [params.UserId]
 * @param {string}  [params.EntityName]
 * @param {string}  [params.Action]
 * @param {string}  [params.FromDate]  — ISO 8601 date string
 * @param {string}  [params.ToDate]    — ISO 8601 date string
 */
export const fetchAuditLogsApi = (params = {}) =>
    api.get("/AuditLogs", {
        params: Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== "" && v != null)
        ),
    });
