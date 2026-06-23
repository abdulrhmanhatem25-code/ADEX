# ADEX API Endpoints Documentation

This document lists all the API endpoints used by the frontend application, organized by feature area. This list can be used to identify unused endpoints in the backend.

**Base URL (Dev):** `https://nub-adex.runasp.net/api` (proxied via `/api`)

---

## 1. Authentication    1   
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **POST** | `/Auth` | Login with email and password | `Login.jsx` |

## 2. Dashboard
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **GET** | `/Dashboard/summary` | Fetch dashboard statistics summary | `dashboardApi.js` |

## 3. Rooms Management
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **GET** | `/Rooms` | Fetch list of rooms with filters | `roomsApi.js` |
| **POST** | `/Rooms` | Create a new room | `roomsApi.js` |
| **PUT** | `/Rooms` | Update an existing room | `roomsApi.js` |
| **PUT** | `/Rooms/toggle-status/{roomId}` | Toggle room active/inactive status | `roomsApi.js` |

## 4. Scheduling & Semester Management
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **GET** | `/Semester` | Fetch all semesters | `semesterApi.js`, `scheduleApi.js` |
| **POST** | `/Semester` | Create a new semester | `semesterApi.js` |
| **PUT** | `/Semester/toggle/{id}` | Toggle semester status | `semesterApi.js` |
| **DELETE** | `/Semester/{id}` | Delete a semester | `semesterApi.js` |
| **GET** | `/Scheduling/analyze-offerings` | Analyze course offerings for a semester | `scheduleApi.js` |
| **POST** | `/Scheduling/approve-offerings` | Approve selected offerings | `scheduleApi.js` |
| **POST** | `/Scheduling/generate-master` | Generate the master schedule | `scheduleApi.js` |
| **GET** | `/Scheduling/generated-schedules` | Fetch generated schedules by level | `scheduleApi.js` |
| **GET** | `/semesters/instructors` | Fetch instructors for a specific semester | `semesterApi.js` |
| **POST** | `/semesters/{semesterId}/instructors` | Add instructors to a semester | `semesterApi.js` |
| **PUT** | `/semesters/{semesterId}/instructors/{instructorId}` | Update instructor in a semester | `semesterApi.js` |
| **POST** | `/semesters/{targetSemesterId}/instructors/clone` | Clone instructors from another semester | `semesterApi.js` |
| **POST** | `/semesters/{semesterId}/instructors/clear` | Clear all instructors from a semester | `semesterApi.js` |

## 5. Courses & Programs
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **GET** | `/Courses` | Fetch list of courses with pagination/search | `coursesApi.js`, `scheduleApi.js` |
| **POST** | `/Courses/bulk-import` | Bulk import courses | `coursesApi.js` |
| **PUT** | `/Courses/bulk-update` | Bulk update courses | `coursesApi.js` |
| **PUT** | `/Courses/toggle` | Toggle course active status | `coursesApi.js` |
| **GET** | `/Programs` | Fetch list of programs | `coursesApi.js` |
| **GET** | `/ProgramCourses/{programId}` | Fetch courses belonging to a program | `coursesApi.js` |
| **GET** | `/Prerequisites/Course/{courseCode}` | Fetch prerequisites for a course | `coursesApi.js` |

## 6. Enrollments & Registration
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **GET** | `/Enrollments/available/{studentId}` | Fetch available courses for registration | `enrollmentsApi.js` |
| **POST** | `/Enrollments/apply-bulk` | Bulk apply for enrollments | `enrollmentsApi.js` |
| **POST** | `/Enrollments/drop-courses` | Drop selected courses | `enrollmentsApi.js` |
| **GET** | `/Enrollments/all-offered-courses` | Fetch all offered courses for a student | `enrollmentsApi.js` |
| **GET** | `/Enrollments/timetable/{studentId}` | Fetch timetable for a specific student | `studentsApi.js`, `timetableApi.js` |

## 7. Staff (Instructors) Management
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **GET** | `/Instructors` | Fetch basic list of instructors | `scheduleApi.js` |
| **GET** | `/Instructors/all-with-availability` | Fetch staff with their availability | `staffApi.js` |
| **POST** | `/Instructors` | Add a new staff member | `staffApi.js` |
| **PUT** | `/Instructors` | Update staff member details | `staffApi.js` |
| **PUT** | `/Instructors/toggle/{id}` | Toggle staff member status | `staffApi.js` |
| **PUT** | `/Instructors/{id}/image` | Upload/Update staff member image | `staffApi.js` |
| **POST** | `/Instructors/setup-existing` | Save setup for existing instructors | `scheduleApi.js` |
| **GET** | `/Instructors/{instructorId}/timetable` | Fetch timetable for an instructor | `timetableApi.js` |

## 8. Advisor Dashboard
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **GET** | `/Instructors/advisor/students` | Fetch students assigned to an advisor | `advisorApi.js` |
| **GET** | `/Instructors/all-advisors-progress` | Fetch progress for all advisors | `advisorApi.js` |
| **GET** | `/Instructors/my-advisees` | Fetch advisees for current instructor | `studentsApi.js` |

## 9. Student Records
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **GET** | `/Students` | Fetch list of students with pagination | `studentsApi.js` |
| **GET** | `/StudentAcademicRecords/academic-status/{code}` | Fetch academic status by student code | `studentsApi.js` |
| **GET** | `/StudentAcademicRecords/student-code/{code}` | Fetch academic records by student code | `studentsApi.js` |
| **GET** | `/Students/my-suggested-courses` | Fetch suggested courses for a student | `studentsApi.js` |

## 10. User Profile & Management
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **GET** | `/Profiles` | Fetch current user profile | `profileApi.js` |
| **PATCH** | `/Profiles/info` | Update user profile information | `profileApi.js` |
| **PUT** | `/Profiles/image` | Update user profile image | `profileApi.js` |
| **POST** | `/Profiles/change-password` | Change user password | `profileApi.js` |
| **GET** | `/Users` | Fetch all users (Admin) | `usersApi.js` |
| **PUT** | `/Users/{userId}/roles` | Update user roles | `usersApi.js` |
| **GET** | `/Users/{userId}/permissions` | Fetch user permissions | `usersApi.js` |
| **PUT** | `/Users/{userId}/permissions` | Update user permissions | `usersApi.js` |

## 11. Metadata & Constants
| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **GET** | `/Meta/room-types` | Fetch room types list | `metaApi.js` |
| **GET** | `/Meta/room-availability-modes` | Fetch room availability modes | `metaApi.js` |
| **GET** | `/Meta/instructor-availability-modes` | Fetch instructor availability modes | `semesterApi.js` |
| **GET** | `/Meta/week-days` | Fetch list of week days | `metaApi.js` |
