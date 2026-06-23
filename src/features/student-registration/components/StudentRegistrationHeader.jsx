import React from "react";
import { Clock, Star, BookOpen, CalendarDays } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import AdexCard from "@/shared/ui/AdexCard";

/**
 * StudentRegistrationHeader
 * ─────────────────────────
 * الجزء العلوي من الصفحة:
 * 1) كارت عريض: الاسم + رقم الطالب (زي الماكيت).
 * 2) صف من 4 كروت إحصائيات باستخدام AdexCard.Stat (نفس أسلوب المشروع).
 *
 * كل القيم `mock` — استبدلها ببيانات من الـ API لما تجهز.
 */
export default function StudentRegistrationHeader({
    fullName = "Abdelrhman hatem mohamed khalil",
    studentId = "222050001",
    allowedHours = 19,
    gpa = "3.51",
    registeredHours = 18,
    termLabel = "Fall - 2025-2026",
    className,
}) {
    return (
        <div className={cn("space-y-1", className)}>
            {/* كارت واحد عريض: الاسم والـ ID في سطر واحد */}
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5 shadow-sm">
                <p className="text-sm sm:text-base text-slate-800">
                    <span className="font-semibold text-slate-500">Name: </span>
                    <span className="font-bold">{fullName}</span>
                    <span className="mx-2 text-slate-300 hidden sm:inline">||</span>
                    <span className="font-semibold text-slate-500 sm:ml-0 ml-0 block sm:inline mt-1 sm:mt-0">
                        ID:{" "}
                    </span>
                    <span className="font-bold font-mono">{studentId}</span>
                </p>
            </div>

            {/* أربع كروت متساوية: ساعات مسموحة، GPA، ساعات مسجلة، الفصل الدراسي */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <AdexCard.Stat
                    value={allowedHours}
                    label="allowed hours"
                    icon={<Clock className="h-5 w-5" />}
                    iconBg="#e2e8f0"
                    iconColor="#475569"
                    iconSize="w-10 h-10"
                    iconRadius="rounded-xl"
                    padding="px-4 py-3"
                    valueSize="text-xl"
                />
                <AdexCard.Stat
                    value={gpa}
                    label="GPA"
                    icon={<Star className="h-5 w-5" />}
                    iconBg="#dbeafe"
                    iconColor="#2563eb"
                    iconSize="w-10 h-10"
                    iconRadius="rounded-xl"
                    padding="px-4 py-3"
                    valueSize="text-xl"
                />
                <AdexCard.Stat
                    value={registeredHours}
                    label="Registered Hours"
                    icon={<BookOpen className="h-5 w-5" />}
                    iconBg="#fce7f3"
                    iconColor="#db2777"
                    iconSize="w-10 h-10"
                    iconRadius="rounded-xl"
                    padding="px-4 py-3"
                    valueSize="text-xl"
                />
                <AdexCard.Stat
                    value={termLabel}
                    label="Semester"
                    icon={<CalendarDays className="h-5 w-5" />}
                    iconBg="#e0e7ff"
                    iconColor="#4f46e5"
                    iconSize="w-10 h-10"
                    iconRadius="rounded-xl"
                    padding="px-4 py-3"
                    valueSize="text-sm"
                    valueClassName="leading-tight"
                />
            </div>
        </div>
    );
}
