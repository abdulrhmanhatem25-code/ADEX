import { useAuth } from "@/app/providers/AuthProvider";

export default function RequirePermission({ 
    permission, 
    permissions = [], 
    requireAll = false, 
    children, 
    fallback = null 
}) {
    const { hasPermission, isAuthenticated, isLoading } = useAuth();

    // Do not check permissions while authentication is still loading
    if (isLoading || !isAuthenticated) {
        return null;
    }

    let isAllowed = false;

    // Mode 1: Single Permission Check
    if (permission) {
        isAllowed = hasPermission(permission);
    } 
    // Mode 2: Multiple Permissions Check
    else if (permissions.length > 0) {
        if (requireAll) {
            // User must have ALL of the specified permissions
            isAllowed = permissions.every(p => hasPermission(p));
        } else {
            // User must have AT LEAST ONE of the specified permissions
            isAllowed = permissions.some(p => hasPermission(p));
        }
    } else {
        // If neither was provided, we assume it's publicly allowed (or optionally restrict it)
        isAllowed = true;
    }

    if (!isAllowed) {
        return fallback; // usually null, but allows returning a "Locked" or "Access Denied" UI
    }

    return children;
}
