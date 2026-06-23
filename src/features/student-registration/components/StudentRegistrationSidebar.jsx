import React from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { STUDENT_REGISTRATION_SIDEBAR_COL } from "@/features/student-registration/components/studentRegistrationConstants";

const TRACK_IDS = [
    { id: "cs", label: "CS" },
    { id: "it", label: "IT" },
];

/**
 * StudentRegistrationSidebar
 * ───────────────────────────
 * Props:
 *   students        — قائمة الطلاب [{ id, displayLine, ... }]
 *   selectedId      — الـ id المختار حالياً
 *   onSelectStudent  — callback(student) عند الاختيار
 *   activeTrack     — "cs" | "it"
 *   onTrackChange   — callback(track)
 *   isLoading       — boolean: يعرض spinner
 *   error           — string | null: رسالة خطأ
 *   showTrackToggle  — boolean: هل يظهر toggle CS/IT
 *   extraBottom     — JSX: أي محتوى يظهر في أسفل السايدبار (pagination مثلاً)
 *   searchValue     — قيمة البحث الخارجية (controlled من الـ parent)
 *   onSearchChange  — callback(value) لتحديث البحث في الـ parent
 */
export default function StudentRegistrationSidebar({
    students = [],
    className,
    onSelectStudent,
    selectedId = null,
    activeTrack = "cs",
    onTrackChange,
    isLoading = false,
    error = null,
    showTrackToggle = true,
    extraBottom = null,
    searchValue = "",
    onSearchChange,
}) {

    return (
        <aside
            className={cn(
                "flex flex-col rounded-xl border border-ui-border bg-ui-bg shadow-sm overflow-hidden min-h-0",
                "lg:h-full lg:min-h-0",
                STUDENT_REGISTRATION_SIDEBAR_COL,
                className
            )}
        >
            {/* CS / IT toggle — يظهر فقط للـ TH */}
            {showTrackToggle && (
                <div
                    className="grid grid-cols-2 border-b border-ui-border"
                    role="tablist"
                    aria-label="Program track"
                >
                    {TRACK_IDS.map(({ id, label }) => {
                        const isOn = activeTrack === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={isOn}
                                onClick={() => onTrackChange?.(id)}
                                className={cn(
                                    "flex flex-col items-center pt-2.5 pb-0 w-full min-w-0",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                                )}
                            >
                                <span
                                    className={cn(
                                        "text-sm font-bold",
                                        isOn ? "text-ui-text" : "text-ui-text-subtle"
                                    )}
                                >
                                    {label}
                                </span>
                                <span
                                    className={cn(
                                        "mt-2 h-[3px] w-[82%] max-w-[7rem] shrink-0 rounded-sm transition-colors",
                                        isOn ? "bg-ui-text" : "bg-transparent"
                                    )}
                                    aria-hidden
                                />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* عنوان */}
            <div className="px-3 pt-3 pb-1">
                <h2 className="text-sm font-medium text-ui-text">Students</h2>
            </div>

            {/* بحث — controlled من الـ parent (بيبحث في كل الداتا بالـ API) */}
            <div className="px-3 pb-3 border-b border-ui-border">
                <div className="relative">
                    <Input
                        id="student-search"
                        name="studentSearch"
                        autoComplete="off"
                        value={searchValue}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder="Search student..."
                        className="h-9 rounded-full border-ui-border bg-ui-bg-hover pr-9 pl-3 text-xs"
                        aria-label="Search students"
                    />
                    <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ui-text-subtle" />
                </div>
            </div>

            {/* قائمة الطلاب — المنطقة الوحيدة اللي بتعمل سكرول؛ الباجينيشن تحتها مباشرة */}
            <div className="min-h-0 flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-ui-text-subtle">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-xs">Loading students...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-ui-text-subtle">
                        <AlertCircle className="h-5 w-5 text-rose-400" />
                        <p className="text-xs text-center px-2">{error}</p>
                    </div>
                ) : students.length === 0 ? (
                    <p className="p-4 text-xs text-ui-text-subtle text-center">No students available</p>
                ) : (
                    <ul className="divide-y divide-ui-border">
                        {students.map((s, index) => {
                            const isDark = index % 2 === 1;
                            const isSelected = selectedId != null && s.id === selectedId;
                            return (
                                <li key={s.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectStudent?.(s)}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 text-xs font-medium transition-colors",
                                            isDark
                                                ? "bg-schedule-card-lec/70 border border-schedule-card-lec-border text-text hover:bg-schedule-sidebar-hover"   // new---
                                                : "bg-ui-bg text-text hover:bg-schedule-sidebar-hover",    // new---
                                            isSelected && "ring-1 ring-inset ring-icon-4" // new---
                                        )}
                                    >
                                        {s.displayLine}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {extraBottom ? (
                <div className="shrink-0 border-t border-ui-border bg-ui-bg px-3 py-1.5">
                    {extraBottom}
                </div>
            ) : null}
        </aside>
    );
}
