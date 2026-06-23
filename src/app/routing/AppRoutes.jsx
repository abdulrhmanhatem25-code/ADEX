import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layout/DashboardLayout";
import { LoginPage } from "@/features/auth";
import ProtectedRoute from "@/app/routing/ProtectedRoute";
import { Loader2 } from "lucide-react";

// ── Lazy-loaded pages (code splitting) ──────────────────────────────────────
const Home = lazy(() => import("@/features/dashboard").then(m => ({ default: m.HomePage })));
const Dashboard = lazy(() => import("@/features/dashboard").then(m => ({ default: m.DashboardPage })));
const AuditLogs = lazy(() => import("@/features/dashboard").then(m => ({ default: m.AuditLogsPage })));
const TimeTable = lazy(() => import("@/features/schedule").then(m => ({ default: m.TimeTablePage })));
const Settings = lazy(() => import("@/features/settings").then(m => ({ default: m.SettingsPage })));
const GenerateSchedule = lazy(() => import("@/features/schedule").then(m => ({ default: m.GenerateSchedulePage })));
const EditSchedule = lazy(() => import("@/features/schedule").then(m => ({ default: m.EditSchedulePage })));
const CourseStudents = lazy(() => import("@/features/schedule").then(m => ({ default: m.CourseStudentsPage })));
const ViewSchedule = lazy(() => import("@/features/schedule").then(m => ({ default: m.ViewSchedulePage })));
const Courses = lazy(() => import("@/features/courses").then(m => ({ default: m.CoursesPage })));
const Rooms = lazy(() => import("@/features/rooms").then(m => ({ default: m.RoomsPage })));
const Students = lazy(() => import("@/features/students").then(m => ({ default: m.StudentsPage })));
const StudentDetail = lazy(() => import("@/features/students").then(m => ({ default: m.StudentDetailPage })));
const Staff = lazy(() => import("@/features/staff").then(m => ({ default: m.StaffPage })));
const AcademicRegistration = lazy(() => import("@/features/academic-registration").then(m => ({ default: m.AcademicRegistrationPage })));
const Ratings = lazy(() => import("@/features/academic-registration").then(m => ({ default: m.RatingsPage })));
const InstructorRating = lazy(() => import("@/features/academic-registration").then(m => ({ default: m.InstructorRatingPage })));
const UserManagement = lazy(() => import("@/features/user-management").then(m => ({ default: m.UserManagementPage })));
const StudentRegistration = lazy(() => import("@/features/student-registration").then(m => ({ default: m.StudentRegistrationPage })));
const ImportRecords = lazy(() => import("@/features/data-import").then(m => ({ default: m.ImportRecordsPage })));
const Welcome = lazy(() => import("@/features/auth").then(m => ({ default: m.WelcomePage })));
const AdvisorStudents = lazy(() => import("@/features/advisor").then(m => ({ default: m.AdvisorStudentsPage })));
const Reports = lazy(() => import("@/features/reports").then(m => ({ default: m.ReportsPage })));
const StudentInfo = lazy(() => import("@/features/info").then(m => ({ default: m.StudentInfoPage })));
const ViewSchedules = lazy(() => import("@/features/schedule").then(m => ({ default: m.ViewSchedulesPage })));
const MyColleagues = lazy(() => import("@/features/teaching").then(m => ({ default: m.MyColleaguesPage })));
const NotFound = lazy(() => import("@/features/auth").then(m => ({ default: m.NotFoundPage })));

// ── Shared loading fallback ──────────────────────────────────────────────────
function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center text-slate-400 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-medium">Loading...</span>
        </div>
    );
}

export default function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Welcome Screen (Authenticated, but no Dashboard Layout) */}
                <Route
                    path="/welcome"
                    element={
                        <ProtectedRoute>
                            <Welcome />
                        </ProtectedRoute>
                    }
                />

                {/* Protected App Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<Home />} />

                    {/* Schedule */}
                    <Route
                        path="/schedule-control"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Admin"]}>
                                <GenerateSchedule />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/edit-schedule"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Admin"]}>
                                <EditSchedule />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/course-students"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Admin"]}>
                                <CourseStudents />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/view-schedule"
                        element={
                            <ProtectedRoute>
                                <ViewSchedule />
                            </ProtectedRoute>
                        }
                    />

                    {/* Dashboard */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Admin"]}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Audit Logs */}
                    <Route
                        path="/audit-logs"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin"]}>
                                <AuditLogs />
                            </ProtectedRoute>
                        }
                    />

                    {/* Reports */}
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Admin"]}>
                                <Reports />
                            </ProtectedRoute>
                        }
                    />

                    {/* Data Management */}
                    <Route
                        path="/students"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Admin", "Technical Assistant"]}>
                                <Students />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/students/:studentCode"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Admin", "Technical Assistant"]}>
                                <StudentDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/courses"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Admin"]}>
                                <Courses />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/rooms"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Admin"]}>
                                <Rooms />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/staff"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Admin"]}>
                                <Staff />
                            </ProtectedRoute>
                        }
                    />

                    {/* Other */}
                    <Route path="/timetable" element={<TimeTable />} />
                    <Route
                        path="/academic-registration"
                        element={
                            <ProtectedRoute allowedRoles={["Student"]}>
                                <AcademicRegistration />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student-info"
                        element={
                            <ProtectedRoute allowedRoles={["Student"]}>
                                <StudentInfo />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/user-management"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin"]} allowedPermissions={["users:read"]}>
                                <UserManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/settings" element={<Settings />} />
                    {/* <Route path="/import-records" element={<ImportRecords />} /> */}
                    <Route
                        path="/student-registration"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Technical Assistant"]}>
                                <StudentRegistration />
                            </ProtectedRoute>
                        }
                    />

                    {/* Advisor Students */}
                    <Route
                        path="/advisor-students"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin", "Technical Assistant"]}>
                                <AdvisorStudents />
                            </ProtectedRoute>
                        }
                    />

                    {/* View Schedules (SuperAdmin) */}
                    <Route
                        path="/view-schedules"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin"]}>
                                <ViewSchedules />
                            </ProtectedRoute>
                        }
                    />

                    {/* Student Ratings (SuperAdmin) */}
                    <Route
                        path="/ratings"
                        element={
                            <ProtectedRoute allowedRoles={["SuperAdmin"]}>
                                <Ratings />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rate Instructor (Technical Assistant) */}
                    <Route
                        path="/rate-instructor"
                        element={
                            <ProtectedRoute allowedRoles={["Technical Assistant"]}>
                                <InstructorRating />
                            </ProtectedRoute>
                        }
                    />

                    {/* My Colleagues (Doctor & Technical Assistant) */}
                    <Route
                        path="/my-colleagues"
                        element={
                            <ProtectedRoute allowedRoles={["Doctor", "Technical Assistant"]}>
                                <MyColleagues />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback for authenticated users — show 404 */}
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* Global Fallback to Login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    );
}
