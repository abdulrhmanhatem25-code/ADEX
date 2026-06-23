import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { fetchStudentByIdApi } from "@/shared/services/studentsApi";
import { analyzeOfferingsApi } from "@/features/schedule/services/scheduleApi";
import {
  Loader2, Search, Users, ChevronDown, ChevronLeft,
  GraduationCap, RotateCcw, AlertCircle,
  User, Hash, BookOpen
} from "lucide-react";

/* ─── Category Config ──────────────────────────────────────── */
const CATEGORIES = [
  {
    key: "normal",
    label: "Normal Students",
    labelAr: "طلاب عاديين",
    idsField: "normalStudentIds",
    countField: "normalStudentsCount",
    icon: GraduationCap,
    dotClass: "bg-emerald-400",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    headerGradient: "from-emerald-500 to-emerald-600",
  },
  {
    key: "retake",
    label: "Retake Students",
    labelAr: "طلاب إعادة",
    idsField: "retakeStudentIds",
    countField: "retakeStudentsCount",
    icon: RotateCcw,
    dotClass: "bg-rose-400",
    bgClass: "bg-rose-50",
    textClass: "text-rose-700",
    borderClass: "border-rose-200",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
    headerGradient: "from-rose-500 to-rose-600",
  },
  {
    key: "mandatory",
    label: "Mandatory Students",
    labelAr: "طلاب إجباري",
    idsField: "mandatoryStudentIds",
    countField: "mandatoryStudentsCount",
    icon: AlertCircle,
    dotClass: "bg-amber-400",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    headerGradient: "from-amber-500 to-amber-600",
  },
];

/* ─── Student Card ─────────────────────────────────────────── */
function StudentCard({ student }) {
  return (
    <div className="group bg-white border border-slate-200/80 rounded-xl p-3.5 hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm">
          {student.imageUrl ? (
            <img
              src={student.imageUrl}
              alt={student.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-4.5 h-4.5 text-slate-400" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-slate-800 truncate leading-snug">
            {student.fullName}
          </p>
          {student.fullNameAr && (
            <p className="text-[11px] text-slate-400 truncate font-medium" dir="rtl">
              {student.fullNameAr}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5">
              <Hash className="w-2.5 h-2.5" />
              {student.studentCode}
            </span>
            <span className="text-[10px] text-slate-300">•</span>
            <span className="text-[10px] font-semibold text-slate-400 truncate">
              {student.programName}
            </span>
          </div>
        </div>

        {/* Right side stats */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
            student.gpa >= 3.0
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
              : student.gpa >= 2.0
                ? "bg-amber-50 text-amber-600 border border-amber-200/50"
                : "bg-rose-50 text-rose-600 border border-rose-200/50"
          )}>
            GPA {student.gpa?.toFixed(2)}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/50">
            L{student.currentLevel}
          </span>
          {student.isAcademicWarning && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/50">
              ⚠ Warning
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Category Section ─────────────────────────────────────── */
function CategorySection({ category, students, loading, search }) {
  const [expanded, setExpanded] = useState(true);
  const Icon = category.icon;

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(s =>
      s.fullName?.toLowerCase().includes(q) ||
      s.fullNameAr?.includes(search) ||
      s.studentCode?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.programName?.toLowerCase().includes(q)
    );
  }, [students, search]);

  if (students.length === 0 && !loading) return null;

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden transition-all duration-200 shadow-sm",
      category.borderClass, "border-opacity-60"
    )}>
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3 transition-colors duration-150",
          category.bgClass
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
            category.badgeBg
          )}>
            <Icon className={cn("w-4 h-4", category.textClass)} />
          </div>
          <span className={cn("text-sm font-bold", category.textClass)}>
            {category.label}
          </span>
          <span className={cn(
            "text-[11px] font-extrabold px-2 py-0.5 rounded-full",
            category.badgeBg, category.badgeText
          )}>
            {loading ? "…" : filtered.length}
            {search.trim() && !loading && filtered.length !== students.length && (
              <span className="opacity-60"> / {students.length}</span>
            )}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-200",
          category.textClass,
          expanded && "rotate-180"
        )} />
      </button>

      {/* Section Content */}
      {expanded && (
        <div className="bg-white/50 p-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10">
              <Loader2 className={cn("w-5 h-5 animate-spin", category.textClass)} />
              <span className="text-xs font-medium text-slate-400">Loading students…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-1.5">
              <Search className="w-6 h-6 text-slate-300" />
              <p className="text-xs font-medium">
                {search.trim() ? "No students match your search" : "No students in this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {filtered.map(student => (
                <StudentCard key={student.studentId} student={student} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function CourseStudents() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const semesterId = searchParams.get("semesterId");
  const courseId = searchParams.get("courseId");

  const [course, setCourse] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [studentsByCategory, setStudentsByCategory] = useState({
    normal: [],
    retake: [],
    mandatory: [],
  });
  const [loadingCategories, setLoadingCategories] = useState({
    normal: false,
    retake: false,
    mandatory: false,
  });
  const [search, setSearch] = useState("");

  // 1) Fetch course data from analyze-offerings
  useEffect(() => {
    if (!semesterId || !courseId) {
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    analyzeOfferingsApi(semesterId)
      .then(res => {
        const found = res.data?.suggestedCourses?.find(
          c => String(c.courseId) === String(courseId)
        );
        setCourse(found || null);
        setPageLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPageLoading(false);
      });
  }, [semesterId, courseId]);

  // 2) Fetch students when course is loaded
  useEffect(() => {
    if (!course) return;

    CATEGORIES.forEach(cat => {
      const ids = course[cat.idsField] || [];
      if (ids.length === 0) {
        setLoadingCategories(prev => ({ ...prev, [cat.key]: false }));
        return;
      }

      setLoadingCategories(prev => ({ ...prev, [cat.key]: true }));

      const BATCH_SIZE = 20;
      const batches = [];
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        batches.push(ids.slice(i, i + BATCH_SIZE));
      }

      const fetchBatch = async (batchIds) => {
        const results = await Promise.allSettled(
          batchIds.map(id => fetchStudentByIdApi(id))
        );
        return results
          .filter(r => r.status === "fulfilled")
          .map(r => r.value.data);
      };

      (async () => {
        const allStudents = [];
        for (const batch of batches) {
          const batchStudents = await fetchBatch(batch);
          allStudents.push(...batchStudents);
          setStudentsByCategory(prev => ({
            ...prev,
            [cat.key]: [...allStudents],
          }));
        }
        setLoadingCategories(prev => ({ ...prev, [cat.key]: false }));
      })();
    });
  }, [course]);

  const totalStudents = (course?.normalStudentIds?.length || 0)
    + (course?.retakeStudentIds?.length || 0)
    + (course?.mandatoryStudentIds?.length || 0);

  // ── Loading state ──
  if (pageLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-slate-500">Loading course data…</p>
      </div>
    );
  }

  // ── Course not found ──
  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <BookOpen className="w-12 h-12 text-slate-300" />
        <p className="text-sm font-medium">Course not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 max-w-[1100px] mx-auto space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_50%)]" />
        <div className="relative z-10 px-5 pt-5 pb-4">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold mb-3 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Offerings
          </button>

          {/* Course info */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-extrabold text-white tracking-tight truncate">
                {course.courseName}
              </h1>
              {course.courseNameAr && (
                <p className="text-sm text-slate-400 mt-0.5 font-medium" dir="rtl">
                  {course.courseNameAr}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 text-slate-400 text-xs">
                <span className="font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded text-[11px]">
                  {course.courseCode}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {totalStudents} students
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {course.creditHours} credit hrs
                </span>
                {course.isElective && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">Elective</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Category summary pills */}
          <div className="flex items-center gap-2 mt-4">
            {CATEGORIES.map(cat => {
              const count = course[cat.countField] || 0;
              if (count === 0) return null;
              return (
                <span
                  key={cat.key}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 text-white/80"
                >
                  <span className={cn("w-2 h-2 rounded-full", cat.dotClass)} />
                  {cat.label.split(" ")[0]}: {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Search Bar ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="course-students-search"
            name="courseStudentsSearch"
            type="text"
            placeholder="Search students by name, code, email, or program…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all font-medium text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ── Category Sections ───────────────────────────────── */}
      <div className="space-y-4">
        {CATEGORIES.map(cat => (
          <CategorySection
            key={cat.key}
            category={cat}
            students={studentsByCategory[cat.key]}
            loading={loadingCategories[cat.key]}
            search={search}
          />
        ))}

        {/* All empty state */}
        {totalStudents === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 bg-white rounded-xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300" />
            <p className="text-sm font-medium">No students enrolled in this course</p>
          </div>
        )}
      </div>
    </div>
  );
}
