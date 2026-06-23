import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    CalendarDays, User2, GraduationCap, ChevronRight, ChevronLeft,
    Search, Loader2, AlertCircle, Users,
} from "lucide-react";
import { fetchSemesterStaffApi } from "@/features/staff/services/semesterApi";
import { fetchStudentsApi } from "@/shared/services/studentsApi";
import { fetchInstructorTimetable, fetchStudentTimetable } from "@/shared/services/timetableApi";
import { WeeklyScheduleGrid } from "@/features/student-registration";

// ── Day map ────────────────────────────────────────────────────────────────────
const DAY_TO_INDEX = {
    Saturday: 0, Sunday: 1, Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5,
};

function parseHour(timeStr) {
    if (!timeStr) return 9;
    const [h, m] = timeStr.split(":");
    return parseInt(h, 10) + (parseInt(m || "0", 10) / 60);
}

function formatTimeLabel(start, end) {
    const fmt = (v) => {
        const h = Math.floor(v);
        const m = Math.round((v - h) * 60);
        const p = h < 12 ? "AM" : "PM";
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${h12}:${m === 0 ? "00" : m.toString().padStart(2, "0")} ${p}`;
    };
    return `${fmt(start)} - ${fmt(end)}`;
}

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
                startHour, endHour,
                timeRange: formatTimeLabel(startHour, endHour),
                courseName: reg.courseName,
                sessionLabel: `${sec.sessionType} — ${reg.classGroupName}`,
                instructorName: reg.courseCode,
                locationText: sec.room || "TBA",
                selected: true,
            });
        });
    });
    return sessions;
}

function mapStudentSessions(data, isAr = false) {
    if (!data?.enrollments) return [];
    const sessions = [];
    data.enrollments.forEach((enrollment, ei) => {
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
                startHour, endHour,
                timeRange: formatTimeLabel(startHour, endHour),
                courseName: cName,
                sessionLabel: `${sType} — ${gName}`,
                instructorName: iName,
                locationText: rName || "TBA",
                selected: sec.sessionType === "Lecture",
            });
        });
    });
    return sessions;
}

// ── View constants ─────────────────────────────────────────────────────────────
const VIEW_ROLES = "roles";
const VIEW_LIST = "list";
const VIEW_TIMETABLE = "timetable";

const PAGE_SIZE = 12;

// ── Role Card ──────────────────────────────────────────────────────────────────
function RoleCard({ icon: Icon, label, subtitle, gradient, border, iconColor, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`group relative flex items-center justify-between gap-4 p-6 rounded-2xl
                border-2 ${border} bg-gradient-to-br ${gradient}
                shadow-sm hover:shadow-lg transition-all duration-200
                hover:-translate-y-1 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                    bg-white/80 border ${border} shadow-sm
                    group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-7 w-7 ${iconColor}`} />
                </div>
                <div>
                    <p className="text-lg font-bold text-slate-800 leading-tight">{label}</p>
                    <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
        </button>
    );
}

// ── Person Card ────────────────────────────────────────────────────────────────
function PersonCard({ name, subtitle, code, imageUrl, onClick }) {
    return (
        <button
            onClick={onClick}
            className="group flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white
                shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5
                transition-all duration-200 text-left w-full focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
            {/* Avatar */}
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow">
                {imageUrl ? (
                    <img src={imageUrl} className="w-full h-full object-cover" alt={name} />
                ) : (
                    <User2 className="h-5 w-5 text-indigo-400" />
                )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    {code && <span className="font-mono">{code}</span>}
                    {code && subtitle && <span>·</span>}
                    {subtitle && <span className="truncate">{subtitle}</span>}
                </div>
            </div>
            {/* Arrow */}
            <CalendarDays className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
        </button>
    );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, totalCount, from, to, onPageChange }) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
        if (start > 1) { pages.push(1); if (start > 2) pages.push("..."); }
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages) { if (end < totalPages - 1) pages.push("..."); pages.push(totalPages); }
        return pages;
    };

    return (
        <div className="flex items-center justify-between px-1 py-3 text-xs text-slate-500">
            <span>Showing {from}–{to} of {totalCount}</span>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">‹</button>
                {getPageNumbers().map((pg, i) => pg === "..." ? (
                    <span key={`e-${i}`} className="w-7 text-center">…</span>
                ) : (
                    <button key={pg} onClick={() => onPageChange(pg)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold transition-colors ${page === pg ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-600"}`}>
                        {pg}
                    </button>
                ))}
                <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">›</button>
            </div>
        </div>
    );
}

// ── Legend Badge ────────────────────────────────────────────────────────────────
function LegendBadge({ color, label }) {
    return (
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
            {label}
        </span>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ViewSchedulesPage() {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    // ── Navigation state ──────────────────────────────────────────────────
    const [view, setView] = useState(VIEW_ROLES);
    const [selectedRole, setSelectedRole] = useState(null); // "doctor" | "ta" | "student"
    const [selectedPerson, setSelectedPerson] = useState(null);

    // ── List state ────────────────────────────────────────────────────────
    const [people, setPeople] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // ── Timetable state ───────────────────────────────────────────────────
    const [timetableData, setTimetableData] = useState(null);
    const [ttLoading, setTtLoading] = useState(false);
    const [ttError, setTtError] = useState(null);

    // ── Fetch people ──────────────────────────────────────────────────────
    const fetchPeople = useCallback(async (role, pg, q) => {
        setListLoading(true);
        setListError(null);
        try {
            if (role === "student") {
                const res = await fetchStudentsApi(pg, PAGE_SIZE, q);
                const d = res.data;
                setPeople(d?.items ?? []);
                setTotalCount(d?.totalCount ?? 0);
                setTotalPages(d?.totalPages ?? 1);
            } else {
                const type = role === "doctor" ? "doctor" : "ta";
                const res = await fetchSemesterStaffApi(null, type, pg, PAGE_SIZE, q);
                const d = res.data?.instructors ?? res.data ?? {};
                setPeople(d?.items ?? []);
                setTotalCount(d?.totalCount ?? 0);
                setTotalPages(d?.totalPages ?? 1);
            }
        } catch (err) {
            console.error("Failed to fetch people:", err);
            setListError(err?.response?.data?.message || err.message || "Failed to load list");
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === VIEW_LIST && selectedRole) {
            fetchPeople(selectedRole, page, search);
        }
    }, [view, selectedRole, page, search, fetchPeople]);

    // ── Fetch timetable ───────────────────────────────────────────────────
    useEffect(() => {
        if (view !== VIEW_TIMETABLE || !selectedPerson) return;
        let cancelled = false;
        setTtLoading(true);
        setTtError(null);

        const isStudentRole = selectedRole === "student";
        const id = isStudentRole
            ? (selectedPerson.studentId ?? selectedPerson.id)
            : (selectedPerson.instructorId ?? selectedPerson.id);

        const fetchFn = isStudentRole
            ? fetchStudentTimetable(id)
            : fetchInstructorTimetable(id);

        fetchFn
            .then((res) => { if (!cancelled) setTimetableData(res.data); })
            .catch((err) => {
                if (!cancelled) {
                    console.error("Timetable error:", err);
                    setTtError(err?.response?.data?.message || "Failed to load timetable");
                }
            })
            .finally(() => { if (!cancelled) setTtLoading(false); });

        return () => { cancelled = true; };
    }, [view, selectedPerson, selectedRole]);

    // ── Session mapping ───────────────────────────────────────────────────
    const sessions = useMemo(() => {
        if (!timetableData) return [];
        return selectedRole === "student"
            ? mapStudentSessions(timetableData, isAr)
            : mapInstructorSessions(timetableData);
    }, [timetableData, selectedRole, isAr]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setSearch("");
        setPage(1);
        setPeople([]);
        setView(VIEW_LIST);
    };

    const handlePersonSelect = (person) => {
        setSelectedPerson(person);
        setTimetableData(null);
        setView(VIEW_TIMETABLE);
    };

    const handleBackToRoles = () => {
        setView(VIEW_ROLES);
        setSelectedRole(null);
        setPeople([]);
        setSearch("");
        setPage(1);
    };

    const handleBackToList = () => {
        setView(VIEW_LIST);
        setSelectedPerson(null);
        setTimetableData(null);
    };

    // ── Derived ───────────────────────────────────────────────────────────
    const from = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, totalCount);

    const personName = (p) => {
        if (selectedRole === "student") {
            return isAr && p.fullNameAr ? p.fullNameAr : (p.fullName ?? p.name ?? "—");
        }
        return isAr && p.nameAr ? p.nameAr : (p.name ?? "—");
    };

    const personCode = (p) => {
        if (selectedRole === "student") return p.studentCode ?? "";
        return p.code ?? p.instructorCode ?? "";
    };

    const personSubtitle = (p) => {
        if (selectedRole === "student") {
            return isAr && p.programNameAr ? p.programNameAr : (p.programName ?? "");
        }
        return isAr && p.typeAr ? p.typeAr : (p.type ?? "");
    };

    const personImage = (p) => p.imageUrl ?? "";

    const roleLabel = selectedRole === "doctor"
        ? t("viewSchedules.doctors")
        : selectedRole === "ta"
            ? t("viewSchedules.assistants")
            : t("viewSchedules.students");

    const selectedPersonName = selectedPerson ? personName(selectedPerson) : "";

    // ═══════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-0 max-w-full space-y-5 pb-20">
            <h1 className="sr-only">{t("viewSchedules.title")}</h1>

            {/* ════════ VIEW: ROLE SELECTION ════════ */}
            {view === VIEW_ROLES && (
                <>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-indigo-500" />
                            {t("viewSchedules.title")}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">{t("viewSchedules.subtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <RoleCard
                            icon={User2}
                            label={t("viewSchedules.doctors")}
                            subtitle={t("viewSchedules.doctorsDesc")}
                            gradient="from-blue-50/60 to-indigo-50/60"
                            border="border-indigo-200"
                            iconColor="text-indigo-600"
                            onClick={() => handleRoleSelect("doctor")}
                        />
                        <RoleCard
                            icon={GraduationCap}
                            label={t("viewSchedules.assistants")}
                            subtitle={t("viewSchedules.assistantsDesc")}
                            gradient="from-pink-50/60 to-rose-50/60"
                            border="border-pink-200"
                            iconColor="text-pink-600"
                            onClick={() => handleRoleSelect("ta")}
                        />
                        <RoleCard
                            icon={Users}
                            label={t("viewSchedules.students")}
                            subtitle={t("viewSchedules.studentsDesc")}
                            gradient="from-emerald-50/60 to-teal-50/60"
                            border="border-emerald-200"
                            iconColor="text-emerald-600"
                            onClick={() => handleRoleSelect("student")}
                        />
                    </div>
                </>
            )}

            {/* ════════ VIEW: PERSON LIST ════════ */}
            {view === VIEW_LIST && (
                <>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleBackToRoles}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
                                bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            <ChevronLeft className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
                            {t("viewSchedules.title")}
                        </button>
                        <span className="text-slate-300">/</span>
                        <span className="text-sm font-bold text-slate-700">{roleLabel}</span>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className={`absolute ${isAr ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                        <input
                            id="schedule-search"
                            name="scheduleSearch"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder={t("viewSchedules.searchPlaceholder")}
                            className={`w-full ${isAr ? "pr-9 pl-4" : "pl-9 pr-4"} py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition`}
                        />
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {listLoading && people.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="text-sm">{t("viewSchedules.loading")}</span>
                            </div>
                        ) : listError ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                                <AlertCircle className="h-6 w-6 text-rose-400" />
                                <span className="text-sm text-rose-500">{listError}</span>
                            </div>
                        ) : people.length === 0 ? (
                            <div className="py-20 text-center text-slate-400 text-sm">
                                {search ? t("viewSchedules.noSearchMatch") : t("viewSchedules.noResults")}
                            </div>
                        ) : (
                            <>
                                {/* Count badge */}
                                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500">
                                        {roleLabel} <span className="text-indigo-600">({totalCount})</span>
                                    </span>
                                    {listLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                                </div>

                                {/* Cards grid */}
                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {people.map((p, i) => (
                                        <PersonCard
                                            key={selectedRole === "student" ? (p.studentId ?? i) : (p.instructorId ?? i)}
                                            name={personName(p)}
                                            code={personCode(p)}
                                            subtitle={personSubtitle(p)}
                                            imageUrl={personImage(p)}
                                            onClick={() => handlePersonSelect(p)}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="px-5 border-t border-slate-100">
                                    <Pagination
                                        page={page}
                                        totalPages={totalPages}
                                        totalCount={totalCount}
                                        from={from}
                                        to={to}
                                        onPageChange={setPage}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* ════════ VIEW: TIMETABLE ════════ */}
            {view === VIEW_TIMETABLE && (
                <>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleBackToRoles}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
                                bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            <ChevronLeft className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
                            {t("viewSchedules.title")}
                        </button>
                        <span className="text-slate-300">/</span>
                        <button
                            onClick={handleBackToList}
                            className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            {roleLabel}
                        </button>
                        <span className="text-slate-300">/</span>
                        <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{selectedPersonName}</span>
                    </div>

                    {/* Timetable Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm min-h-[400px]">
                        {/* Header + Legend */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-slate-600" />
                                <h2 className="text-sm font-bold text-slate-800">
                                    {selectedPersonName} — {t("timetable.weeklySchedule")}
                                </h2>
                            </div>
                            {!ttLoading && (
                                <div className="flex items-center gap-4">
                                    <LegendBadge color="#5a8ec4" label={t("timetable.lecture")} />
                                    {selectedRole === "student" && <LegendBadge color="#f9cfe4" label={t("timetable.labSection")} />}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        {ttLoading && (
                            <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
                                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                                <p className="text-sm font-medium">{t("timetable.loading")}</p>
                            </div>
                        )}
                        {!ttLoading && ttError && (
                            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
                                <AlertCircle className="h-8 w-8 text-rose-400" />
                                <p className="text-sm font-semibold text-slate-600">{t("timetable.loadFailed")}</p>
                                <p className="text-xs text-slate-400 max-w-sm text-center">{ttError}</p>
                            </div>
                        )}
                        {!ttLoading && !ttError && (
                            <div
                                className="max-lg:-mx-3 max-lg:px-3 overflow-x-auto no-scrollbars"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                <style>{`.no-scrollbars::-webkit-scrollbar { display: none; }`}</style>
                                {sessions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
                                        <CalendarDays className="h-10 w-10 text-slate-300" />
                                        <p className="text-sm font-semibold text-slate-500">{t("timetable.noSessions")}</p>
                                    </div>
                                ) : (
                                    <WeeklyScheduleGrid sessions={sessions} />
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
