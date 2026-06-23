/**
 * Global Toast Event Emitter
 * Works outside React (e.g. from api.js interceptors).
 * Usage:
 *   import toast from "@/shared/lib/toast";
 *   toast.success("Done!");
 *   toast.error("Something went wrong");
 */

const listeners = new Set();

function emit(type, message) {
    listeners.forEach((fn) => fn({ type, message, id: Date.now() }));
}

const toast = {
    success: (message) => emit("success", message),
    error: (message) => emit("error", message),
    subscribe: (fn) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
    },
};

export default toast;
