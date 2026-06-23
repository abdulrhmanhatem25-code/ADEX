import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { fetchCurrentUserApi, revokeTokenApi } from "@/features/auth/services/authApi";
import { registerAuthFailureHandler } from "@/shared/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);         // from /api/Auth/me (id, firstName, lastName, email, roles, permissions)
    const [isLoading, setIsLoading] = useState(true);

    // ── Derived — single source of truth, never manually set ─────────────────
    const isAuthenticated = user !== null;

    // ── Fetch identity from /api/Auth/me (roles & permissions) ───────────────
    const fetchCurrentUser = useCallback(async () => {
        try {
            const res = await fetchCurrentUserApi();
            setUser(res.data);
            return true;
        } catch {
            // 401 or network error → user is not authenticated
            setUser(null);
            return false;
        }
    }, []);

    // ── On mount: check if user has a valid session cookie ────────────────────
    useEffect(() => {
        fetchCurrentUser().finally(() => setIsLoading(false));
    }, [fetchCurrentUser]);

    // ── Force-logout: registered with api.js via callback ────────────────────
    useEffect(() => {
        const handleForceLogout = () => {
            setUser(null);
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("/login");
        };
        registerAuthFailureHandler(handleForceLogout);
        return () => registerAuthFailureHandler(null);
    }, []);

    // ── initializeSession: called AFTER loginApi() succeeds ──────────────────
    /**
     * Hydrates client-side auth state from the session cookie.
     *
     * IMPORTANT: This does NOT perform login. The caller must first call
     * loginApi(email, password) which causes the backend to set HTTP-only
     * cookies. This function then reads those cookies by calling /Auth/me.
     *
     * Two-step flow:
     *   1. await loginApi(email, password)   → backend sets cookies
     *   2. await initializeSession()         → client reads session
     */
    const initializeSession = useCallback(async () => {
        const success = await fetchCurrentUser();
        if (!success) {
            throw new Error("Failed to fetch user identity after login");
        }
    }, [fetchCurrentUser]);

    // ── Logout: revoke refresh token, clear state ────────────────────────────
    const logout = useCallback(async () => {
        try {
            await revokeTokenApi(); // POST /api/Auth/revoke — clears cookies on backend
        } catch {
            // Even if revoke fails, clear client state
        }
        setUser(null);
    }, []);

    // ── Permission check — uses /api/Auth/me data directly ───────────────────
    const hasPermission = useCallback((permissionName) => {
        if (!user) return false;

        const roles = user.roles || [];
        // SuperAdmin always has all permissions
        if (roles.includes("SuperAdmin")) return true;

        const permissions = user.permissions || [];
        return permissions.includes(permissionName);
    }, [user]);

    // ── Derived role helpers ─────────────────────────────────────────────────
    const authHelpers = useMemo(() => {
        const roles = user?.roles || [];

        const isSuperAdmin = roles.includes("SuperAdmin");
        const isStudent    = roles.includes("Student");
        const isInstructor = !isStudent && !isSuperAdmin && roles.length > 0;

        return {
            roles,
            isStudent,
            isInstructor,
            isSuperAdmin,
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, initializeSession, logout, hasPermission, ...authHelpers }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

