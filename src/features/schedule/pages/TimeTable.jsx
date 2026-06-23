import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, BookOpen, GraduationCap, UserCheck, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useProfile } from "@/app/providers/ProfileProvider";
import { fetchInstructorTimetable, fetchStudentTimetable } from "@/shared/services/timetableApi";
import { WeeklyScheduleGrid } from "@/features/student-registration";
import AdexCard from "@/shared/ui/AdexCard";
import { cn } from "@/shared/lib/utils";

// ── خريطة أيام الأسبوع (إنجليزي → رقم عمود في الشبكة) ───────────────────────
const DAY_TO_INDEX = {
    Saturday: 0,
    Sunday: 1,
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
};

// ── تحويل "HH:MM" إلى رقم ساعة ───────────────────────────────────────────────
function parseHour(timeStr) {
    if (!timeStr) return 9;
    const [h, m] = timeStr.split(":");
    return parseInt(h, 10) + (parseInt(m || "0", 10) / 60);
}

// ── تحويل "HH:MM - HH:MM" إلى ساعة بداية ونهاية ─────────────────────────────
function parseTimeRange(timeRange) {
    if (!timeRange) return { start: 9, end: 11 };
    const parts = timeRange.split("-").map((s) => s.trim());
    const [startH, startM] = parts[0].split(":").map(Number);
    const [endH] = parts[1] ? parts[1].split(":").map(Number) : [startH + 2];
    return { start: startH, end: endH };
}

// ── تنسيق الوقت لعرض في بطاقة الحصة ─────────────────────────────────────────
function formatTimeLabel(start, end) {
    const fmt = (timeVal) => {
        const h = Math.floor(timeVal);
        const m = Math.round((timeVal - h) * 60);
        const period = h < 12 ? "AM" : "PM";
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const mm = m === 0 ? "00" : m.toString().padStart(2, "0");
        return `${h12}:${mm} ${period}`;
    };
    return `${fmt(start)} - ${fmt(end)}`;
}

/**
 * تحويل بيانات جدول المحاضر إلى sessions مناسبة لـ WeeklyScheduleGrid
 */
function mapInstructorSessions(data) {
    if (!data?.courseRegistrations) return [];
    const sessions = [];
    data.courseRegistrations.forEach((reg, ri) => {
        (reg.sessions || []).forEach((sec, si) => {
            const startHour = parseHour(sec.time?.split("-")[0]?.trim());
            const endHour = parseHour(sec.time?.split("-")[1]?.trim());
            sessions.push({
                id: `inst-${ri}-${si}`,
                dayIndex: DAY_TO_INDEX[sec.day] ?? 0,
                startHour,
                endHour,
                timeRange: formatTimeLabel(startHour, endHour),
                courseName: reg.courseName,
                sessionLabel: `${sec.sessionType} — ${reg.classGroupName}`,
                instructorName: reg.courseCode,
                locationText: sec.room || "TBA",
                selected: true, // المحاضرين دايماً أزرق
            });
        });
    });
    return sessions;
}

/**
 * تحويل بيانات جدول الطالب إلى sessions مناسبة لـ WeeklyScheduleGrid
 * Lecture = أزرق (selected=true) | Lab/Section = بينك (selected=false)
 */
function mapStudentSessions(data, isAr = false) {
    if (!data?.enrollments) return [];
    const sessions = [];
    data.enrollments.forEach((enrollment, ei) => {
        // NEW API shape: enrollment.sessions (was: enrollment.sections)
        (enrollment.sessions || enrollment.sections || []).forEach((sec, si) => {
            const startHour = parseHour(sec.startTime);
            const endHour = parseHour(sec.endTime);
            const cName = isAr && enrollment.courseNameAr ? enrollment.courseNameAr : enrollment.courseName;
            const sType = isAr && sec.sessionTypeAr ? sec.sessionTypeAr : sec.sessionType;
            const gName = isAr && sec.groupNameAr ? sec.groupNameAr : sec.groupName;
            const iName = isAr && sec.instructorNameAr ? sec.instructorNameAr : sec.instructorName;
            const rName = isAr && sec.roomAr ? sec.roomAr : sec.room;
            sessions.push({
                id: `std-${ei}-${si}`,
                dayIndex: DAY_TO_INDEX[sec.day] ?? 0,
                startHour,
                endHour,
                timeRange: formatTimeLabel(startHour, endHour),
                courseName: cName,
                sessionLabel: `${sType} — ${gName}`,
                instructorName: iName,
                locationText: rName || "TBA",
                // Lecture = أزرق, باقي أنواع (Lab, Section) = بينك
                selected: sec.sessionType === "Lecture",
            });
        });
    });
    return sessions;
}

// ─── Badge نوع الجلسة ────────────────────────────────────────────────────────
function LegendBadge({ color, label }) {
    return (
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
            />
            {label}
        </span>
    );
}

// ─── حالة التحميل ─────────────────────────────────────────────────────────────
function LoadingState() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            <p className="text-sm font-medium">{t("timetable.loading")}</p>
        </div>
    );
}

// ─── حالة الخطأ ───────────────────────────────────────────────────────────────
function ErrorState({ message }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <AlertCircle className="h-8 w-8 text-rose-400" />
            <p className="text-sm font-semibold text-slate-600">{t("timetable.loadFailed")}</p>
            <p className="text-xs text-slate-400 max-w-sm text-center">{message}</p>
        </div>
    );
}

// ─── حالة فارغة ──────────────────────────────────────────────────────────────
function EmptyState() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <CalendarDays className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">{t("timetable.noSessions")}</p>
            <p className="text-xs text-center max-w-xs">{t("timetable.noSessionsDesc")}</p>
        </div>
    );
}

// ─── هيدر الصفحة ─────────────────────────────────────────────────────────────
// isStudent=true  → يستخدم userProfile.student مباشرةً (متاح قبل الـ timetable API)
// isStudent=false → يستخدم timetableData (من API المحاضر)
function TimetableHeader({ isStudent, userProfile, timetableData }) {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    if (isStudent) {
        const s = userProfile?.student;
        if (!s) return null;

        const displayName  = (isAr && userProfile.fullNameAr) ? userProfile.fullNameAr : userProfile.fullName;
        const program      = (isAr && s.programNameAr)        ? s.programNameAr        : s.programName;
        const advisorName  = (isAr && s.advisorNameAr)        ? s.advisorNameAr        : s.advisorName;

        return (
            <div className="space-y-1">
                {/* بطاقة الاسم */}
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5 shadow-sm">
                    <p className="text-sm sm:text-base text-slate-800">
                        <span className="font-semibold text-slate-500">{t("timetable.name")}: </span>
                        <span className="font-bold">{displayName}</span>
                        <span className="mx-2 text-slate-300 hidden sm:inline">||</span>
                        <span className="font-semibold text-slate-500 block sm:inline mt-1 sm:mt-0">ID: </span>
                        <span className="font-bold font-mono">{s.studentCode}</span>
                        {advisorName ? (
                            <>
                                <span className="mx-2 text-slate-300 hidden sm:inline">||</span>
                                <span className="font-semibold text-slate-500 block sm:inline">{t("advisor.advisor")}: </span>
                                <span className="font-bold">{advisorName}</span>
                            </>
                        ) : (
                            <>
                                <span className="mx-2 text-slate-300 hidden sm:inline">||</span>
                                <span className="font-semibold text-slate-500 block sm:inline">{t("advisor.advisor")}: </span>
                                <span className="font-bold text-slate-400">—</span>
                            </>
                        )}
                    </p>
                </div>

                {/* إحصائيات */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
                    <AdexCard.Stat value={s.allowedHours ?? "–"}    label={t("timetable.allowedHours")}    icon={<BookOpen className="h-5 w-5" />}     iconBg="#e2e8f0" iconColor="#475569" iconSize="w-10 h-10" iconRadius="rounded-xl" padding="px-4 py-3" valueSize="text-xl" />
                    <AdexCard.Stat value={s.registeredHours ?? "–"}  label={t("timetable.registeredHours")}  icon={<CalendarDays className="h-5 w-5" />} iconBg="#dbeafe" iconColor="#2563eb" iconSize="w-10 h-10" iconRadius="rounded-xl" padding="px-4 py-3" valueSize="text-xl" />
                    <AdexCard.Stat value={s.gpa != null ? Number(s.gpa).toFixed(2) : "–"} label={t("students.gpa")} icon={<GraduationCap className="h-5 w-5" />} iconBg="#fce7f3" iconColor="#db2777" iconSize="w-10 h-10" iconRadius="rounded-xl" padding="px-4 py-3" valueSize="text-xl" />
                    <AdexCard.Stat value={s.currentLevel != null ? `Level ${s.currentLevel}` : "–"} label={t("students.level")} icon={<CalendarDays className="h-5 w-5" />} iconBg="#e0e7ff" iconColor="#4f46e5" iconSize="w-10 h-10" iconRadius="rounded-xl" padding="px-4 py-3" valueSize="text-xs" valueClassName="leading-tight" />
                </div>
            </div>
        );
    }

    // ── Instructor Header (relies on timetable API response) ──────────────────
    if (!timetableData) return null;

    const instructorCoursesCount = timetableData.courseRegistrations?.length ?? 0;
    const instructorTotalSessions = timetableData.courseRegistrations?.reduce((acc, curr) => acc + (curr.sessions?.length || 0), 0) ?? 0;

    return (
        <div className="space-y-1">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5 shadow-sm">
                <p className="text-sm sm:text-base text-slate-800">
                    <span className="font-semibold text-slate-500">{t("timetable.name")}: </span>
                    <span className="font-bold">{timetableData.instructorName}</span>
                    <span className="mx-2 text-slate-300 hidden sm:inline">||</span>
                    <span className="font-semibold text-slate-500 block sm:inline mt-1 sm:mt-0">
                        {t("timetable.type")}:{" "}
                    </span>
                    <span className="font-bold">{timetableData.instructorType}</span>
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
                <AdexCard.Stat value={instructorTotalSessions} label={t("timetable.totalSessions")} icon={<CalendarDays className="h-5 w-5" />} iconBg="#e2e8f0" iconColor="#475569" iconSize="w-10 h-10" iconRadius="rounded-xl" padding="px-4 py-3" valueSize="text-xl" />
                <AdexCard.Stat value={instructorCoursesCount} label={t("dashboard.courses")} icon={<BookOpen className="h-5 w-5" />} iconBg="#dbeafe" iconColor="#2563eb" iconSize="w-10 h-10" iconRadius="rounded-xl" padding="px-4 py-3" valueSize="text-xl" />
                <AdexCard.Stat value={timetableData.instructorType ?? "–"} label={t("timetable.instructorType")} icon={<UserCheck className="h-5 w-5" />} iconBg="#e0e7ff" iconColor="#4f46e5" iconSize="w-10 h-10" iconRadius="rounded-xl" padding="px-4 py-3" valueSize="text-sm" />
            </div>
        </div>
    );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function TimeTable() {
    const { isStudent } = useAuth();
    const { currentStudentId, currentInstructorId, userProfile, refreshProfile } = useProfile();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    const [timetableData, setTimetableData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // جدّد بيانات البروفايل (ساعات مسجلة، GPA، إلخ) كل ما الصفحة تتحمل
    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    // currentStudentId  ← userProfile.student.studentId
    // currentInstructorId ← userProfile.instructor.instructorId
    // userProfile يتحمل async — لازم ننتظره قبل ما نقرر إن الـ ID مش موجود
    const targetId = isStudent ? currentStudentId : currentInstructorId;
    const profileReady = userProfile !== null;

    useEffect(() => {
        // Profile لسه بيتحمل — نفضل في حالة loading بدون error
        if (!profileReady) {
            setLoading(true);
            setError(null);
            return;
        }

        // Profile اتحمل بس مفيش ID — مشكلة حقيقية
        if (!targetId) {
            setLoading(false);
            setError("Could not determine your user ID from the session.");
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        const fetchFn = isStudent
            ? fetchStudentTimetable(targetId)
            : fetchInstructorTimetable(targetId);

        fetchFn
            .then((res) => {
                if (!cancelled) {
                    setTimetableData(res.data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error("Timetable fetch error:", err);
                    setError(
                        err?.response?.data?.message ||
                        (typeof err?.response?.data === "string" ? err.response.data : null) ||
                        "Failed to load timetable. Please try again."
                    );
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [targetId, isStudent, profileReady]);

    // تحويل البيانات إلى sessions للشبكة
    const sessions = useMemo(() => {
        if (!timetableData) return [];
        return isStudent
            ? mapStudentSessions(timetableData, isAr)
            : mapInstructorSessions(timetableData);
    }, [timetableData, isStudent, isAr]);

    return (
        <div className="min-h-0 max-w-full space-y-2">
            <h1 className="sr-only">My Timetable</h1>

            {/* هيدر الصفحة:
                 طالب  → يظهر فوراً من userProfile (مش محتاج timetableData)
                 محاضر → يظهر بعد ما timetableData يتحمل */}
            {isStudent && profileReady && (
                <TimetableHeader isStudent={true} userProfile={userProfile} timetableData={null} />
            )}
            {!isStudent && !loading && !error && timetableData && (
                <TimetableHeader isStudent={false} userProfile={null} timetableData={timetableData} />
            )}

            {/* منطقة الجدول */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm min-h-[400px]">

                {/* عنوان + شرح الألوان */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-slate-600" />
                        <h2 className="text-sm font-bold text-slate-800">{t("timetable.weeklySchedule")}</h2>
                    </div>
                    {!loading && (
                        <div className="flex items-center gap-4">
                            <LegendBadge color="#5a8ec4" label={t("timetable.lecture")} />
                            {isStudent && <LegendBadge color="#f9cfe4" label={t("timetable.labSection")} />}
                        </div>
                    )}
                </div>

                {/* المحتوى */}
                {loading && <LoadingState />}
                {!loading && error && <ErrorState message={error} />}
                {!loading && !error && (
                    <div 
                        className="max-lg:-mx-3 max-lg:px-3 overflow-x-auto no-scrollbars"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        <style>{`
                            .no-scrollbars::-webkit-scrollbar { display: none; }
                        `}</style>
                        <WeeklyScheduleGrid sessions={sessions} />
                    </div>
                )}
            </div>
        </div>
    );
}
