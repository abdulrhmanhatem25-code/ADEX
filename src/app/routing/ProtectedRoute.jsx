import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/app/providers/AuthProvider"

export default function ProtectedRoute({ children, allowedRoles, allowedPermissions }) {
    const { isAuthenticated, roles, isLoading, hasPermission } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Access control: AND between groups, OR within each group.
    //   - If ONLY roles specified     → user must have at least one matching role
    //   - If ONLY permissions specified → user must have at least one matching permission
    //   - If BOTH specified            → user must satisfy BOTH constraints
    const passedRoleCheck = !allowedRoles?.length || allowedRoles.some(r => roles.includes(r));
    const passedPermissionCheck = !allowedPermissions?.length || allowedPermissions.some(p => hasPermission(p));

    if (!passedRoleCheck || !passedPermissionCheck) {
        return <Navigate to="/" replace />;
    }

    return children
}

