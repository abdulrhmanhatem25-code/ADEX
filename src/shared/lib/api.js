import axios from "axios";

// ── Auth failure callback — set by AuthProvider, called on unrecoverable 401 ─
let _onAuthFailure = null;

/**
 * Register a handler that api.js calls when the session is unrecoverable
 * (refresh token expired / revoked). Pass `null` to unregister.
 *
 * This replaces the previous event bus coupling (authEvents.emit("forceLogout")).
 * The handler is expected to clear client state and redirect to /login.
 *
 * @param {(() => void) | null} handler
 */
export function registerAuthFailureHandler(handler) {
    _onAuthFailure = handler;
}

// ── Axios instance — cookies are sent automatically ─────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : "/api",
    withCredentials: true, // Required: sends HTTP-Only cookies with every request
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // Send current UI language so backend returns localized messages
        const lang = localStorage.getItem("i18nextLng") || "en";
        config.headers["Accept-Language"] = lang;
        // Let browser auto-set Content-Type for FormData (includes boundary)
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor — 401 refresh only (no UI logic) ───────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, response = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(response);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ── Handle 401 Unauthorized ──
        if (error.response?.status === 401) {
            // If this was the refresh request itself, reject immediately to avoid infinite loop
            if (originalRequest._isRefreshRequest) {
                return Promise.reject(error);
            }

            // Don't attempt refresh for auth-related endpoints like login/register (prevents infinite loop)
            // But DO allow refresh for /Auth/me, EXCEPT when the user is already on the login page.
            const isAuthEndpoint = originalRequest.url?.includes("/Auth") && !originalRequest.url?.includes("/Auth/me");
            const isLoginPage = window.location.pathname === "/login";

            if (originalRequest._retry || isAuthEndpoint || isLoginPage) {
                // Retry already happened, or this is a login/auth call — force logout if needed
                if (!isAuthEndpoint && originalRequest._retry && !isLoginPage) {
                    if (_onAuthFailure) _onAuthFailure();
                }
                return Promise.reject(error);
            }

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the access token using the HTTP-Only refresh cookie
                await api.post("/Auth/refresh", null, { _isRefreshRequest: true });
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                if (_onAuthFailure) _onAuthFailure();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // ── All other errors — simply reject ──
        // Error display (toasts) is the caller's / UI layer's responsibility.
        // Use parseApiError() from "@/shared/utils/parseApiError" at the call site.
        return Promise.reject(error);
    }
);

export default api;

