import api from "@/shared/lib/api";

/**
 * POST /api/Auth
 * Login with email and password.
 * Response: { message, firstName, lastName, email }
 * Tokens are set as HTTP-Only cookies by the backend.
 */
export const loginApi = (email, password) =>
    api.post("/Auth", { email, password });

/**
 * GET /api/Auth/me
 * Returns the current user's identity, roles, and permissions.
 * Response: { id, firstName, lastName, email, roles[], permissions[] }
 * Relies on HTTP-Only cookie for authentication.
 */
export const fetchCurrentUserApi = () =>
    api.get("/Auth/me");

/**
 * POST /api/Auth/refresh
 * Refreshes the access token using the refresh token cookie.
 * Both cookies are updated automatically by the backend.
 */
export const refreshTokenApi = () =>
    api.post("/Auth/refresh");

/**
 * POST /api/Auth/revoke
 * Revokes the refresh token and clears cookies (logout).
 */
export const revokeTokenApi = () =>
    api.post("/Auth/revoke-refresh-token");
