import api from "@/shared/lib/api";

// GET /api/Users
// Fetch users with pagination and optional search
export const fetchUsersApi = (page = 1, limit = 12, search = "") =>
    api.get("/Users", {
        params: {
            PageNumber: page,
            PageSize: limit,
            ...(search && { SearchValue: search }),
        }
    });

// PUT /api/Users/${userId}/roles
// Update user roles
// Body expects an array of strings: [ "RoleName" ]
export const updateUserRoleApi = (userId, roles) =>
    api.put(`/Users/${userId}/roles`, roles);

// GET /api/Users/${userId}/permissions
// Fetch user permissions
export const getUserPermissionsApi = (userId) =>
    api.get(`/Users/${userId}/permissions`);

// PUT /api/Users/${userId}/permissions
// Update user permissions
// Body expects an array of strings: [ "permission:name" ]
export const updateUserPermissionsApi = (userId, permissions) =>
    api.put(`/Users/${userId}/permissions`, permissions);

