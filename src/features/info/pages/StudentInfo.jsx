import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Map, Files, Calendar } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useProfile } from "@/app/providers/ProfileProvider";

import { CourseMap } from "@/features/course-map";
import AcademicRecords from "@/features/students/components/AcademicRecords";
import AcademicStatus from "@/features/students/components/AcademicStatus";
import { cn } from "@/shared/lib/utils";

/**
 * StudentInfo
 * A page for students to view their course map, academic records, and academic status.
 */
export default function StudentInfo() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { userProfile, currentStudentId } = useProfile();
    
    // Fallback if not loaded
    const studentCode = userProfile?.studentCode || userProfile?.student?.studentCode || user?.username;
    
    // Active tab state
    const [activeTab, setActiveTab] = useState("courseMap");

    const tabs = [
        { id: "courseMap", label: t("studentRegistration.tabCourseMap", "Course Map"), icon: Map },
        { id: "academicRecord", label: t("studentRegistration.tabAcademicRecord", "Academic Record"), icon: Files },
        { id: "status", label: t("studentRegistration.tabStatus", "Academic Status"), icon: Calendar },
    ];

    if (!studentCode) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-ui-text-subtle">
                <p>Loading student information...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-ui-bg p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto">
            {/* Header / Title */}
            <div>
                <h1 className="text-2xl font-bold text-ui-text">
                    {t("sidebar.studentInfo", "My Info")}
                </h1>
                <p className="text-sm text-ui-text-subtle mt-1">
                    {t("studentInfo.subtitle", "View your academic progress, records, and course map.")}
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-ui-border">
                <nav className="flex flex-wrap gap-2 sm:gap-4" aria-label="Student information sections">
                    {tabs.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-2 sm:px-3 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors",
                                    isActive
                                        ? "text-ui-text border-ui-text"
                                        : "text-ui-text-subtle border-transparent hover:text-ui-text-muted hover:border-ui-border"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-4 w-4 shrink-0",
                                        isActive ? "text-ui-text" : "text-ui-text-subtle"
                                    )}
                                />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 bg-ui-bg rounded-xl border border-ui-border overflow-hidden p-6 shadow-sm">
                {activeTab === "courseMap" && (
                    <CourseMap studentCode={studentCode} student={userProfile?.student || userProfile} />
                )}

                {activeTab === "academicRecord" && (
                    <AcademicRecords studentCode={studentCode} student={userProfile?.student || userProfile} />
                )}

                {activeTab === "status" && (
                    <AcademicStatus studentCode={studentCode} />
                )}
            </div>
        </div>
    );
}
