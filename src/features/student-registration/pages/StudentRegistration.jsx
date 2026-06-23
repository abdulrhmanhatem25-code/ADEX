import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useLocation } from "react-router-dom";
import useListPage from "@/shared/hooks/useListPage";
import { Activity, FileText, CalendarDays, BookOpen, GraduationCap, AlertCircle, Loader2, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck } from "lucide-react";
import toast from "@/shared/lib/toast";

import { useAuth } from "@/app/providers/AuthProvider";
import {
    fetchStudentsApi,
    fetchAdviseesApi,
    fetchStudentTimetableByIdApi,
    approveEnrollmentApi,
} from "@/shared/services/studentsApi";
import AdexButton from "@/shared/ui/AdexButton";

import StudentRegistrationHeader from "@/features/student-registration/components/StudentRegistrationHeader";
import StudentRegistrationTabs from "@/features/student-registration/components/StudentRegistrationTabs";
import WeeklyScheduleGrid from "@/features/student-registration/components/WeeklyScheduleGrid";
import StudentRegistrationSidebar from "@/features/student-registration/components/StudentRegistrationSidebar";
import { AcademicStatus, AcademicRecords } from "@/features/students";
import RegistrationTab from "@/features/student-registration/components/RegistrationTab";
import { CourseMap } from "@/features/course-map";
import AdexCard from "@/shared/ui/AdexCard";

// ── خريطة أيام الأسبوع ────────────────────────────────────────────────────────
const DAY_TO_INDEX = {
    Saturday: 0, Sunday: 1, Monday: 2,
    Tuesday: 3, Wednesday: 4, Thursday: 5,
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
        const period = h < 12 ? "AM" : "PM";
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const mm = m === 0 ? "00" : m.toString().padStart(2, "0");
        return `${h12}:${mm} ${period}`;
    };
    return `${fmt(start)} - ${fmt(end)}`;
}

function mapStudentSessions(data) {
    if (!data?.enrollments) return [];
    const sessions = [];
    data.enrollments.forEach((enrollment, ei) => {
        // NEW API: enrollment.sessions (was: enrollment.sections)
        (enrollment.sessions || enrollment.sections || []).forEach((sec, si) => {
            const startHour = parseHour(sec.startTime);
            const endHour = parseHour(sec.endTime);
            sessions.push({
                id: `std-${ei}-${si}`,
                dayIndex: DAY_TO_INDEX[sec.day] ?? 0,
                startHour,
                endHour,
                timeRange: formatTimeLabel(startHour, endHour),
                courseName: enrollment.courseName,
                sessionLabel: `${sec.sessionType} — ${sec.groupName}`,
                instructorName: sec.instructorName,
                locationText: sec.room || "TBA",
                selected: sec.sessionType === "Lecture",
            });
        });
    });
    return sessions;
}

// ─── Loading / Error / Empty ──────────────────────────────────────────────────
function LoadingState({ message = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-ui-text-subtle">
            <Loader2 className="h-8 w-8 animate-spin text-ui-text-subtle" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}
function ErrorState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-ui-text-subtle">
            <AlertCircle className="h-8 w-8 text-rose-400" />
            <p className="text-sm font-semibold text-ui-text-muted">Something went wrong</p>
            <p className="text-xs text-ui-text-subtle max-w-sm text-center">{message}</p>
        </div>
    );
}
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-ui-text-subtle">
            <CalendarDays className="h-10 w-10 text-ui-text-subtle" opacity="0.5" />
            <p className="text-sm font-semibold text-ui-text-muted">No schedule found for this student</p>
        </div>
    );
}

// ─── هيدر الجدول (مربوط ببيانات timetable API) ───────────────────────────────
function ScheduleHeader({ data }) {
    if (!data) return null;
    // Support both old shape (allowedHours) and new shape (hours.allowed)
    const allowed    = data.hours?.allowed    ?? data.allowedHours    ?? "–";
    const registered = data.hours?.registered ?? data.registeredHours ?? "–";
    const remaining  = data.hours?.remaining  ?? "–";
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 mb-2">
            <AdexCard.Stat
                value={allowed}
                label="Allowed Hours"
                icon={<BookOpen className="h-4 w-4" />}
                iconBg="#e2e8f0" iconColor="#475569"
                iconSize="w-8 h-8" iconRadius="rounded-lg"
                padding="px-3 py-2" valueSize="text-lg"
            />
            <AdexCard.Stat
                value={registered}
                label="Registered Hours"
                icon={<CalendarDays className="h-4 w-4" />}
                iconBg="#dbeafe" iconColor="#2563eb"
                iconSize="w-8 h-8" iconRadius="rounded-lg"
                padding="px-3 py-2" valueSize="text-lg"
            />
            <AdexCard.Stat
                value={remaining}
                label="Remaining Hours"
                icon={<GraduationCap className="h-4 w-4" />}
                iconBg="#fce7f3" iconColor="#db2777"
                iconSize="w-8 h-8" iconRadius="rounded-lg"
                padding="px-3 py-2" valueSize="text-lg"
            />
            <AdexCard.Stat
                value={data.semester ?? "–"}
                label="Semester"
                icon={<CalendarDays className="h-4 w-4" />}
                iconBg="#e0e7ff" iconColor="#4f46e5"
                iconSize="w-8 h-8" iconRadius="rounded-lg"
                padding="px-3 py-2" valueSize="text-xs"
                valueClassName="leading-tight"
            />
        </div>
    );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-2 py-1.5">
            <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="p-1.5 rounded-lg hover:bg-ui-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="h-4 w-4 text-ui-text-muted" />
            </button>
            <span className="text-xs font-semibold text-ui-text-muted">
                {page} / {totalPages}
            </span>
            <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="p-1.5 rounded-lg hover:bg-ui-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="h-4 w-4 text-ui-text-muted" />
            </button>
        </div>
    );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function StudentRegistration() {
    const { isSuperAdmin, roles } = useAuth();

    // تحديد نوع المستخدم
    // TH = Technical Assistant
    const isTH = roles.includes("Technical Assistant");

    // ── Navigation state (student passed from advisor page)
    const location = useLocation();
    const navStudent = location.state?.student ?? null; // full student object passed via navigate state

    // ── URL query params (fallback for bookmarkable deep-links)
    const [searchParams] = useSearchParams();
    const urlStudentId = searchParams.get("studentId");

    // ── حالة التابات الرئيسية
    const [activeTab, setActiveTab] = useState("schedule");

    // ── حالة track CS/IT (للـ TH)
    const [activeTrack, setActiveTrack] = useState("");

    // ── الطالب المحدد حالياً — يبدأ بالطالب من navigation state لو موجود
    const [selectedStudent, setSelectedStudent] = useState(navStudent);
    // ref عشان نطبق الـ navStudent مرة واحدة بس عند الـ mount، مش كل ما يتغير list.items
    const navStudentApplied = useRef(!!navStudent);

    // ── بيانات جدول الطالب
    const [timetableData, setTimetableData] = useState(null);
    const [timetableLoading, setTimetableLoading] = useState(false);
    const [timetableError, setTimetableError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRegistrationSaveSuccess = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ── Approve state
    const [approving, setApproving] = useState(false);

    // ── fetchFn ديناميكية تتكيف مع الـ role والـ track
    // useListPage بتنادي: fetchFn(page, limit, search)
    // fetchAdviseesApi بتتوقع: (programName, page, limit) → بنعمل wrapper
    const fetchFn = useMemo(() => {
        if (isSuperAdmin) {
            return fetchStudentsApi; // signature متطابقة: (page, limit, search)
        }
        // TH: نعمل wrapper يعدّل ترتيب الـ args
        return (page, limit, search) => fetchAdviseesApi(activeTrack, page, limit, search);
    }, [isSuperAdmin, activeTrack]);

    // ── useListPage — بيتولى: search debounce, pagination, loading, error
    const list = useListPage({ fetchFn, limit: 15 });

    // لما نيجي من صفحة الـ Advisor بـ student، نحط كوده في الـ search تلقائي
    // عشان يظهر قدامنا في الـ sidebar بدل ما يكون مستخبي في صفحة تانية
    const searchInitialized = useRef(false);
    useEffect(() => {
        if (!searchInitialized.current && navStudent?.studentCode) {
            searchInitialized.current = true;
            list.setSearch(navStudent.studentCode);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navStudent]);

    const initialTrackRender = useRef(true);
    // إعادة الصفحة والطالب المختار لما يتغير التراك أو الـ role
    useEffect(() => {
        if (initialTrackRender.current) {
            initialTrackRender.current = false;
            return;
        }
        list.setPage(1);
        setSelectedStudent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTrack, isSuperAdmin]);

    // اختيار أول طالب تلقائياً لما تجي قائمة جديدة
    // navStudent يِطبَق مرة واحدة بس عند أول تحميل، بعد كده الليست نفسها تتحكم
    useEffect(() => {
        // لو لسه تطبقناش الـ navStudent اللي جا من الـ navigate state
        if (navStudentApplied.current) {
            navStudentApplied.current = false; // بعدين خلي الليست تتحكم
            return;
        }
        if (list.items.length > 0) {
            if (urlStudentId) {
                const fromUrl = list.items.find(s => String(s.studentId) === String(urlStudentId));
                if (fromUrl) {
                    setSelectedStudent(fromUrl);
                    return;
                }
            }
            setSelectedStudent(prev => prev ?? list.items[0]);
        } else if (!urlStudentId && !navStudent) {
            setSelectedStudent(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list.items]);

    // ── جلب جدول الطالب المختار
    useEffect(() => {
        if (!selectedStudent) {
            setTimetableData(null);
            return;
        }
        const id = selectedStudent.studentId;
        if (!id) return;

        let cancelled = false;
        setTimetableLoading(true);
        setTimetableError(null);
        setTimetableData(null);

        fetchStudentTimetableByIdApi(id)
            .then(res => {
                if (!cancelled) {
                    setTimetableData(res.data);
                }
            })
            .catch(err => {
                if (!cancelled) {
                    setTimetableError(
                        err?.response?.data?.message ||
                        "Failed to load student timetable."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setTimetableLoading(false);
            });

        return () => { cancelled = true; };
    }, [selectedStudent, refreshTrigger]);

    // ── تحويل بيانات الجدول لـ WeeklyScheduleGrid sessions
    const sessions = useMemo(() => {
        if (!timetableData) return [];
        return mapStudentSessions(timetableData);
    }, [timetableData]);

    // ── بيانات header تأتي من timetable API
    const headerData = timetableData ?? null;

    // ── شكل عناصر السايدبار (من list.items بدل students)
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const sidebarStudents = useMemo(() =>
        list.items.map(s => ({
            id: s.studentId,
            studentCode: s.studentCode,
            displayLine: `${s.studentCode} - ${(isRtl && s.fullNameAr) ? s.fullNameAr : s.fullName}`,
            raw: s,
        })),
        [list.items, isRtl]
    );

    // ── بيانات الطالب لـ AcademicStatus و AcademicRecords
    const selectedStudentCode = selectedStudent?.studentCode ?? "";
    const selectedStudentObj = selectedStudent ?? {};

    // ── aliases واضحة من list
    const students       = list.items;
    const studentsLoading = list.isLoading;
    const studentsError  = null; // useListPage بتعمل console.error — ممكن نوسعها لو احتجنا

    return (
        <div className="min-h-0 max-w-full space-y-3">
            <h1 className="sr-only">Student Registration & Schedule</h1>

            {/* ── 1) هيدر info بتاع الطالب المختار (من timetable API) */}
            {headerData && !timetableLoading && (
                <div className="rounded-xl border border-ui-border bg-ui-bg px-3 py-2 sm:px-4 shadow-sm">
                    <p className="text-xs sm:text-sm text-ui-text mb-0.5">
                        <span className="font-semibold text-ui-text-muted">Name: </span>
                        <span className="font-bold">{headerData.studentName}</span>
                        <span className="mx-2 text-ui-text-subtle hidden sm:inline">||</span>
                        <span className="font-semibold text-ui-text-muted block sm:inline mt-1 sm:mt-0">
                            ID:{" "}
                        </span>
                        <span className="font-bold font-mono">{headerData.studentId}</span>
                        {headerData.academicAdvisor && (
                            <>
                                <span className="mx-2 text-ui-text-subtle hidden sm:inline">||</span>
                                <span className="font-semibold text-ui-text-muted block sm:inline">Advisor: </span>
                                <span className="font-bold">{headerData.academicAdvisor}</span>
                            </>
                        )}
                    </p>
                </div>
            )}

            {/* ── 2) التابات */}
            <div className="rounded-xl border border-ui-border bg-ui-bg px-2 sm:px-3 pt-2 shadow-sm">
                <StudentRegistrationTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            {/* ── 3) محتوى التابات */}
            <div className="rounded-xl border border-ui-border bg-ui-bg p-2.5 sm:p-3 shadow-sm min-h-0">

                {/* ── تاب Schedule ────────────────────────────────────────────── */}
                {activeTab === "schedule" && (
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4">
                        {/* يسار: stats + grid */}
                        <div className="flex-1 min-w-0 min-h-0 overflow-x-auto">
                            {timetableLoading && <LoadingState message="Loading schedule..." />}
                            {!timetableLoading && timetableError && <ErrorState message={timetableError} />}
                            {!timetableLoading && !timetableError && (
                                <>
                                    <ScheduleHeader data={timetableData} />

                                    {/* Legend */}
                                    {!timetableLoading && (
                                        <div className="flex items-center gap-4 mb-3 px-1">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-ui-text-muted" />
                                                <span className="text-sm font-bold text-ui-text">Weekly Schedule</span>
                                            </div>
                                            <div className="flex items-center gap-3 ml-auto">
                                                <span className="flex items-center gap-1.5 text-xs text-ui-text-muted">
                                                    <span className="inline-block w-3 h-3 rounded-sm bg-[#5a8ec4]" />
                                                    Lecture
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs text-ui-text-muted">
                                                    <span className="inline-block w-3 h-3 rounded-sm bg-[#f9cfe4]" />
                                                    Lab / Section
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {sessions.length === 0 && !selectedStudent && (
                                        <div className="flex flex-col items-center justify-center py-20 gap-2 text-ui-text-subtle">
                                            <GraduationCap className="h-10 w-10 text-ui-text-subtle" opacity="0.5" />
                                            <p className="text-sm">Select a student to view their schedule</p>
                                        </div>
                                    )}
                                    {selectedStudent && <WeeklyScheduleGrid sessions={sessions} />}

                                    {/* Approve button */}
                                    {selectedStudent && !timetableLoading && !timetableError && sessions.length > 0 && (
                                        <div className="flex flex-col items-center gap-3 mt-4 pt-3 border-t border-ui-border">
                                            <AdexButton
                                                variant="none"
                                                type="button"
                                                className={`rounded-xl h-10 px-8 text-sm font-semibold text-white transition-colors shadow-sm ${
                                                    selectedStudent?.isAdvisorApproved
                                                        ? "bg-sky-500 hover:bg-sky-600"
                                                        : "bg-emerald-500 hover:bg-emerald-600"
                                                }`}
                                                disabled={approving}
                                                icon={approving
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : selectedStudent?.isAdvisorApproved
                                                        ? <CheckCircle2 className="h-4 w-4" />
                                                        : <ShieldCheck className="h-4 w-4" />
                                                }
                                                onClick={async () => {
                                                    const actualId = selectedStudent.studentId || selectedStudent.id;
                                                    if (!actualId) {
                                                        console.error("Cannot approve: Student ID is missing.");
                                                        return;
                                                    }

                                                    setApproving(true);
                                                    try {
                                                        const res = await approveEnrollmentApi(actualId);
                                                        toast.success(res?.message || res?.data?.message);
                                                        // Update UI instantly
                                                        setSelectedStudent(prev => prev ? { ...prev, isAdvisorApproved: !prev.isAdvisorApproved } : prev);
                                                        // Reload list data in background
                                                        setTimeout(() => list.reload(), 1500);
                                                    } catch {
                                                        // Error toast handled globally by api.js
                                                    } finally {
                                                        setApproving(false);
                                                    }
                                                }}
                                            >
                                                {approving
                                                    ? t("advisor.approving")
                                                    : selectedStudent?.isAdvisorApproved
                                                        ? t("advisor.approved")
                                                        : t("advisor.approveSchedule")
                                                }
                                            </AdexButton>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* يمين: سايدبار الطلاب */}
                        <StudentRegistrationSidebar
                            students={sidebarStudents}
                            selectedId={selectedStudent?.studentId ?? null}
                            onSelectStudent={(s) => setSelectedStudent(s.raw ?? list.items.find(st => st.studentId === s.id))}
                            activeTrack={activeTrack}
                            onTrackChange={(track) => { setActiveTrack(track); setSelectedStudent(null); }}
                            isLoading={studentsLoading}
                            error={studentsError}
                            showTrackToggle={isTH}
                            searchValue={list.search}
                            onSearchChange={list.setSearch}
                            extraBottom={
                                list.totalPages > 1 ? (
                                    <Pagination
                                        page={list.page}
                                        totalPages={list.totalPages}
                                        onPageChange={list.setPage}
                                    />
                                ) : null
                            }
                        />
                    </div>
                )}

                {/* ── تاب Academic Status ─────────────────────────────────────── */}
                {activeTab === "status" && (
                    selectedStudentCode
                        ? <AcademicStatus studentCode={selectedStudentCode} student={selectedStudentObj} />
                        : <NeedStudentPrompt />
                )}

                {/* ── تاب Academic Records ────────────────────────────────────── */}
                {activeTab === "academicRecord" && (
                    selectedStudentCode
                        ? <AcademicRecords studentCode={selectedStudentCode} student={selectedStudentObj} />
                        : <NeedStudentPrompt />
                )}

                {/* ── تاب Registration ────────────────────────────────────────── */}
                {activeTab === "registration" && (
                    selectedStudent
                        ? <RegistrationTab
                            studentId={selectedStudent.studentId}
                            studentCode={selectedStudent.studentCode}
                            onSaveSuccess={handleRegistrationSaveSuccess}
                          />
                        : <NeedStudentPrompt />
                )}

                {/* ── تاب Course Map ──────────────────────────────────────────── */}
                {activeTab === "courseMap" && (
                    selectedStudentCode
                        ? <CourseMap studentCode={selectedStudentCode} student={selectedStudentObj} />
                        : <NeedStudentPrompt />
                )}
            </div>
        </div>
    );
}

function NeedStudentPrompt() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-ui-text-subtle">
            <GraduationCap className="h-10 w-10 text-ui-text-subtle" opacity="0.5" />
            <p className="text-sm font-medium">Select a student from the Schedule tab first</p>
        </div>
    );
}

function PlaceholderBlock({ title }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-ui-text-subtle gap-2">
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-center max-w-sm">
                Coming soon — this section will be linked to the API.
            </p>
        </div>
    );
}
