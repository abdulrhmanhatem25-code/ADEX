export const ALL_PERMISSIONS = [
    "instructors:read",
    "instructors:add",
    "instructors:update",
    "instructors:manage-availability",
    "courses:read",
    "courses:add",
    "courses:update",
    "courses:delete",
    "offered-courses:read",
    "offered-courses:add",
    "offered-courses:update",
    "offered-courses:delete",
    "departments:read",
    "departments:add",
    "departments:update",
    "departments:delete",
    "programs:read",
    "programs:add",
    "programs:update",
    "programs:delete",
    "program-courses:read",
    "program-courses:add",
    "program-courses:delete",
    "prerequisites:read",
    "prerequisites:add",
    "prerequisites:delete",
    "students:read",
    "students:add",
    "students:update",
    "students:toggle",
    "enrollments:read",
    "enrollments:add",
    "enrollments:update",
    "enrollments:delete",
    "semesters:read",
    "semesters:add",
    "semesters:update",
    "semesters:delete",
    "rooms:read",
    "rooms:add",
    "rooms:update",
    "rooms:delete",
    "rooms:manage-availability",
    "timeslots:read",
    "timeslots:add",
    "timeslots:delete",
    "classgroups:read",
    "classgroups:add",
    "classgroups:update",
    "classgroups:delete",
    "student-groups:read",
    "student-groups:add",
    "student-groups:update",
    "student-groups:delete",
    "schedule:read",
    "schedule:manage",
    "schedule:generate",
    "academic-records:read",
    "academic-records:manage",
    "conflicts:read",
    "users:read",
    "users:add",
    "users:update",
    "roles:read",
    "roles:add",
    "roles:update",
    "dashboard:read",
    "statistics:read",
    "settings:manage",
];

// Helper to group permissions for the UI
export const getGroupedPermissions = () => {
    const groups = {};
    ALL_PERMISSIONS.forEach(perm => {
        const [domain] = perm.split(':');
        if (!groups[domain]) {
            groups[domain] = new Set();
        }
        groups[domain].add(perm);
    });
    return Object.entries(groups).map(([groupName, permissions]) => ({
        groupName,
        permissions: Array.from(permissions)
    }));
};
