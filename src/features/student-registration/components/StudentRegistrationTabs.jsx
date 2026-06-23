import React from "react";
import { useTranslation } from "react-i18next";
import {
    LayoutGrid,
    Calendar,
    Files,
    ClipboardList,
    Map,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * تعريف التابات — id يُستخدم في الـ parent لمعرفة المحتوى المعروض
 */
export const STUDENT_REGISTRATION_TAB_IDS = [
    "schedule",
    "status",
    "academicRecord",
    "registration",
    "courseMap",
];

/** ستاك التاب النشط: خط تحت سميك */
export function registrationTabUnderlineClasses(isActive) {
    return cn(
        "flex items-center gap-1 px-1 sm:px-1.5 py-2 text-xs font-bold border-b-2 -mb-px transition-colors",
        isActive
            ? "text-ui-text border-ui-text"
            : "text-ui-text-subtle border-transparent hover:text-ui-text-muted"
    );
}

/**
 * StudentRegistrationTabs — التابات الرئيسية فقط (Schedule … Registration).
 * CS/IT داخل StudentRegistrationSidebar حسب الماكيت.
 */
export default function StudentRegistrationTabs({ activeTab, onTabChange, className }) {
    const { t } = useTranslation();
    const items = [
        { id: "schedule", label: t("studentRegistration.tabSchedule"), icon: LayoutGrid },
        { id: "status", label: t("studentRegistration.tabStatus"), icon: Calendar },
        { id: "academicRecord", label: t("studentRegistration.tabAcademicRecord"), icon: Files },
        { id: "registration", label: t("studentRegistration.tabRegistration"), icon: ClipboardList },
        { id: "courseMap", label: t("studentRegistration.tabCourseMap", "Course Map"), icon: Map },
    ];

    return (
        <div className={cn("border-b border-ui-border", className)}>
            <nav
                className="flex flex-wrap gap-2 sm:gap-4"
                aria-label="Student registration sections"
            >
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onTabChange(item.id)}
                            className={registrationTabUnderlineClasses(isActive)}
                        >
                            <Icon
                                className={cn(
                                    "h-3.5 w-3.5 shrink-0",
                                    isActive ? "text-ui-text" : "text-ui-text-subtle"
                                )}
                            />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
