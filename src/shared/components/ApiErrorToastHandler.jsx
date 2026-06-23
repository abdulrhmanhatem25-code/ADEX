import { useEffect } from "react";
import api from "@/shared/lib/api";
import toast from "@/shared/lib/toast";
import { parseApiError } from "@/shared/utils/parseApiError";

/**
 * ApiErrorToastHandler — UI-layer global error display.
 *
 * Registers an Axios response interceptor that shows toast notifications
 * for non-401 API errors. This keeps the toast/UI logic OUT of the API
 * infrastructure layer (api.js) while preserving the previous behavior
 * where all API errors automatically showed user feedback.
 *
 * Must be rendered inside the React tree (UI layer).
 * Renders nothing — it's a side-effect-only component.
 */
export default function ApiErrorToastHandler() {
    useEffect(() => {
        const interceptorId = api.interceptors.response.use(
            (response) => response,
            (error) => {
                // Skip 401s — handled by the refresh/auth logic in api.js
                if (error.response?.status === 401) {
                    return Promise.reject(error);
                }

                const msg = parseApiError(error);
                if (msg) toast.error(msg);

                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptorId);
        };
    }, []);

    return null;
}
