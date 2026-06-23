import React, { useEffect, useState } from "react";
import {
    Users,
    Loader2,
    BookOpen,
    GraduationCap,
    FlaskConical,
    Search,
    UserCircle,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "react-i18next";
import { fetchMyColleaguesApi } from "../services/teachingApi";

/* ── Color palettes for course cards ──────────────────────────────── */
const COURSE_PALETTES = [
    { gradient: "from-indigo-500 to-violet-600", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", badgeDark: "dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800", icon: "text-indigo-500", iconBg: "bg-indigo-50 dark:bg-indigo-950/30" },
    { gradient: "from-emerald-500 to-teal-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", badgeDark: "dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800", icon: "text-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { gradient: "from-amber-500 to-orange-600", badge: "bg-amber-50 text-amber-700 border-amber-200", badgeDark: "dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800", icon: "text-amber-500", iconBg: "bg-amber-50 dark:bg-amber-950/30" },
    { gradient: "from-rose-500 to-pink-600", badge: "bg-rose-50 text-rose-700 border-rose-200", badgeDark: "dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800", icon: "text-rose-500", iconBg: "bg-rose-50 dark:bg-rose-950/30" },
    { gradient: "from-cyan-500 to-blue-600", badge: "bg-cyan-50 text-cyan-700 border-cyan-200", badgeDark: "dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800", icon: "text-cyan-500", iconBg: "bg-cyan-50 dark:bg-cyan-950/30" },
    { gradient: "from-purple-500 to-fuchsia-600", badge: "bg-purple-50 text-purple-700 border-purple-200", badgeDark: "dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800", icon: "text-purple-500", iconBg: "bg-purple-50 dark:bg-purple-950/30" },
];

/* ── Session type badge ───────────────────────────────────────────── */
function SessionBadge({ type, t }) {
    const isLecture = type === "Lecture";
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors",
                isLecture
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                    : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800"
            )}
        >
            {isLecture ? <BookOpen size={11} /> : <FlaskConical size={11} />}
            {isLecture ? t("colleagues.lecture") : t("colleagues.lab")}
        </span>
    );
}

/* ── Role badge ───────────────────────────────────────────────────── */
function RoleBadge({ role, roleAr, isRtl, t }) {
    const isDoctor = role === "Doctor";
    const displayRole = isRtl ? roleAr : role;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors",
                isDoctor
                    ? "bg-staff-role-doc-bg text-staff-role-doc-icon border-staff-role-doc-border"
                    : "bg-staff-role-ta-bg text-staff-role-ta-icon border-staff-role-ta-border"
            )}
        >
            {isDoctor ? <GraduationCap size={13} /> : <UserCircle size={13} />}
            {displayRole}
        </span>
    );
}

/* ── Colleague card ───────────────────────────────────────────────── */
function ColleagueCard({ colleague, isRtl, t, palette }) {
    const name = isRtl ? colleague.instructorNameAr : colleague.instructorName;
    const initials = (colleague.instructorName || "?")
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");

    return (
        <div className="group relative rounded-xl border border-ui-border bg-ui-bg p-4 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-start gap-3">
                {/* Avatar */}
                {colleague.imageUrl ? (
                    <img
                        src={colleague.imageUrl}
                        alt={name}
                        className="w-11 h-11 rounded-xl object-cover shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-sm"
                    />
                ) : (
                    <div
                        className={cn(
                            "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm",
                            palette.gradient
                        )}
                    >
                        {initials}
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ui-text truncate" title={name}>
                        {name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <RoleBadge
                            role={colleague.role}
                            roleAr={colleague.roleAr}
                            isRtl={isRtl}
                            t={t}
                        />
                        {colleague.sessionTypes?.map((st) => (
                            <SessionBadge key={st} type={st} t={t} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Course section ───────────────────────────────────────────────── */
function CourseSection({ course, index, isRtl, t, searchQuery }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const palette = COURSE_PALETTES[index % COURSE_PALETTES.length];

    const courseName = isRtl ? course.courseNameAr : course.courseName;
    const doctors = course.colleagues?.filter((c) => c.role === "Doctor") || [];
    const assistants = course.colleagues?.filter((c) => c.role !== "Doctor") || [];

    // Filter colleagues by search
    const filterColleagues = (list) => {
        if (!searchQuery) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(
            (c) =>
                c.instructorName?.toLowerCase().includes(q) ||
                c.instructorNameAr?.includes(searchQuery) ||
                c.role?.toLowerCase().includes(q) ||
                c.roleAr?.includes(searchQuery)
        );
    };

    const filteredDoctors = filterColleagues(doctors);
    const filteredAssistants = filterColleagues(assistants);
    const totalFiltered = filteredDoctors.length + filteredAssistants.length;

    // If search is active and no matches in this course, hide it
    if (searchQuery && totalFiltered === 0) return null;

    return (
        <div className="rounded-2xl border border-ui-border bg-ui-bg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Course header with gradient accent */}
            <div
                className="relative cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Top gradient bar */}
                <div className={cn("h-1 bg-gradient-to-r", palette.gradient)} />

                <div className="p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", palette.iconBg)}>
                            <BookOpen className={cn("w-5 h-5", palette.icon)} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    className={cn(
                                        "px-2.5 py-0.5 rounded-lg text-xs font-extrabold border",
                                        palette.badge,
                                        palette.badgeDark
                                    )}
                                >
                                    {course.courseCode}
                                </span>
                                <h2 className="text-base font-bold text-ui-text truncate">
                                    {courseName}
                                </h2>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-ui-text-muted">
                                <span className="flex items-center gap-1">
                                    <GraduationCap size={12} />
                                    {doctors.length} {t("colleagues.doctors")}
                                </span>
                                <span className="flex items-center gap-1">
                                    <UserCircle size={12} />
                                    {assistants.length} {t("colleagues.assistants")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-ui-text-subtle hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {/* Colleagues grid */}
            {isExpanded && (
                <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Doctors section */}
                    {filteredDoctors.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                <span className="text-[11px] font-bold text-ui-text-subtle uppercase tracking-wider flex items-center gap-1.5">
                                    <GraduationCap size={12} />
                                    {t("colleagues.doctors")}
                                </span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {filteredDoctors.map((c) => (
                                    <ColleagueCard
                                        key={c.instructorId}
                                        colleague={c}
                                        isRtl={isRtl}
                                        t={t}
                                        palette={palette}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assistants section */}
                    {filteredAssistants.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                <span className="text-[11px] font-bold text-ui-text-subtle uppercase tracking-wider flex items-center gap-1.5">
                                    <UserCircle size={12} />
                                    {t("colleagues.assistants")}
                                </span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                                {filteredAssistants.map((c) => (
                                    <ColleagueCard
                                        key={c.instructorId}
                                        colleague={c}
                                        isRtl={isRtl}
                                        t={t}
                                        palette={palette}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No results in this course */}
                    {filteredDoctors.length === 0 && filteredAssistants.length === 0 && (
                        <div className="text-center py-4 text-sm text-ui-text-subtle">
                            {t("colleagues.noColleagues")}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Stats summary ────────────────────────────────────────────────── */
function StatsBar({ courses, t }) {
    const totalCourses = courses.length;
    const allColleagues = courses.flatMap((c) => c.colleagues || []);
    const uniqueIds = new Set(allColleagues.map((c) => c.instructorId));
    const totalDoctors = new Set(
        allColleagues.filter((c) => c.role === "Doctor").map((c) => c.instructorId)
    ).size;
    const totalAssistants = new Set(
        allColleagues.filter((c) => c.role !== "Doctor").map((c) => c.instructorId)
    ).size;

    const stats = [
        {
            label: t("colleagues.totalCourses"),
            value: totalCourses,
            icon: BookOpen,
            accent: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
        },
        {
            label: t("colleagues.totalColleagues"),
            value: uniqueIds.size,
            icon: Users,
            accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
        },
        {
            label: t("colleagues.doctors"),
            value: totalDoctors,
            icon: GraduationCap,
            accent: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
        },
        {
            label: t("colleagues.assistants"),
            value: totalAssistants,
            icon: UserCircle,
            accent: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="rounded-xl border border-ui-border bg-ui-bg p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
                >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.accent)}>
                        <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xl font-extrabold text-ui-text leading-tight">{s.value}</p>
                        <p className="text-[11px] text-ui-text-subtle mt-0.5">{s.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Main Page ────────────────────────────────────────────────────── */
export default function MyColleaguesPage() {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";

    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchMyColleaguesApi();
                if (!cancelled) setCourses(data ?? []);
            } catch (err) {
                if (!cancelled) setError(err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filteredCourses = courses.filter((course) => {
        if (!search) return true;
        const q = search.toLowerCase();
        // Match course-level
        if (
            course.courseCode?.toLowerCase().includes(q) ||
            course.courseName?.toLowerCase().includes(q) ||
            course.courseNameAr?.includes(search)
        )
            return true;
        // Match any colleague
        return course.colleagues?.some(
            (c) =>
                c.instructorName?.toLowerCase().includes(q) ||
                c.instructorNameAr?.includes(search)
        );
    });

    return (
        <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-5" dir={isRtl ? "rtl" : "ltr"}>
            {/* Header */}
            <div>
                <h1 className="text-lg font-extrabold text-ui-text flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    {t("colleagues.title")}
                </h1>
                <p className="text-sm text-ui-text-subtle mt-1">
                    {t("colleagues.subtitle")}
                </p>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-ui-border bg-ui-bg p-10 text-ui-text-subtle justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">{t("colleagues.loading")}</span>
                </div>
            )}

            {/* Error */}
            {!isLoading && error && (
                <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-8 text-center">
                    <p className="text-sm text-red-600 dark:text-red-400">{t("colleagues.loadFailed")}</p>
                </div>
            )}

            {/* Content */}
            {!isLoading && !error && (
                <>
                    {/* Stats */}
                    <StatsBar courses={courses} t={t} />

                    {/* Search */}
                    <div className="relative">
                        <Search className={cn(
                            "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-ui-text-subtle",
                            isRtl ? "right-3" : "left-3"
                        )} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("colleagues.searchPlaceholder")}
                            className={cn(
                                "w-full py-2.5 rounded-xl border border-ui-border bg-ui-bg text-sm text-ui-text placeholder:text-ui-text-subtle focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-700 transition-all",
                                isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
                            )}
                        />
                    </div>

                    {/* Course list */}
                    {filteredCourses.length === 0 ? (
                        <div className="rounded-2xl border border-ui-border bg-ui-bg p-10 text-center">
                            <Users className="w-10 h-10 text-ui-text-subtle mx-auto mb-3 opacity-40" />
                            <p className="text-sm text-ui-text-subtle">{t("colleagues.noResults")}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCourses.map((course, i) => (
                                <CourseSection
                                    key={course.courseCode}
                                    course={course}
                                    index={i}
                                    isRtl={isRtl}
                                    t={t}
                                    searchQuery={search}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
