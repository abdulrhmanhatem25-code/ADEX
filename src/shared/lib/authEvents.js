/**
 * authEvents — a lightweight event bus for cross-boundary communication.
 *
 * NOTE: Core auth failure flow uses registerAuthFailureHandler (callback)
 * in api.js instead of this event bus. This bus is retained for potential
 * future non-critical extensions (e.g. analytics, logging).
 *
 * Strict event contract:
 * @typedef {"forceLogout"} AuthEventType
 *   - "forceLogout" — session is unrecoverable (refresh token expired).
 *                     Payload: undefined.
 *
 * Usage:
 *   Emitter  → authEvents.emit("forceLogout")
 *   Listener → authEvents.on("forceLogout", handler)
 *              authEvents.off("forceLogout", handler)
 */
const listeners = {};

const authEvents = {
    on(event, handler) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(handler);
    },
    off(event, handler) {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter((h) => h !== handler);
    },
    emit(event, payload) {
        (listeners[event] || []).forEach((h) => h(payload));
    },
    /** Remove all listeners for a given event, or all events if none specified. */
    removeAllListeners(event) {
        if (event) {
            listeners[event] = [];
        } else {
            Object.keys(listeners).forEach((k) => { listeners[k] = []; });
        }
    },
};

export default authEvents;
