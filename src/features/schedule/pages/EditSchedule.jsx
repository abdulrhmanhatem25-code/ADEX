import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchSemestersApi,
  analyzeOfferingsApi,
} from "@/features/schedule/services/scheduleApi";
import {
  ChevronDown, Loader2, Users, BookOpen,
  AlertTriangle, Search, BarChart3
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";

/* ─── Custom Semester Dropdown ─────────────────────────────── */
function SemesterDropdown({ semesters, selectedId, onChange, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = semesters.find(s => String(s.semesterId) === String(selectedId));

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 bg-white shadow-sm",
          open
            ? "border-primary ring-2 ring-primary/15 shadow-md"
            : "border-slate-200 hover:border-slate-300"
        )}
      >
        <span className={cn("truncate", selected ? "text-slate-800" : "text-slate-400")}>
          {selected
            ? `${selected.semesterName} — ${selected.semesterType} ${selected.academicYear}`
            : t("scheduleEdit.chooseSemester")}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
          open && "rotate-180"
        )} />
      </button>

      {/* Dropdown panel */}
      <div className={cn(
        "absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top",
        open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
      )}>
        <div
          className="max-h-52 overflow-y-auto py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.semester-list::-webkit-scrollbar { display: none; }`}</style>
          <div className="semester-list max-h-52 overflow-y-auto py-1">
            {semesters.map(sem => {
              const isActive = String(sem.semesterId) === String(selectedId);
              return (
                <button
                  key={sem.semesterId}
                  type="button"
                  onClick={() => {
                    onChange(String(sem.semesterId));
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3.5 py-2 text-sm transition-colors flex items-center justify-between gap-2",
                    isActive
                      ? "bg-primary/5 text-primary font-bold"
                      : "text-slate-700 hover:bg-slate-50 font-medium"
                  )}
                >
                  <span className="truncate">
                    {sem.semesterName} — {sem.semesterType} {sem.academicYear}
                  </span>
                  {sem.isActive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                      {t("scheduleEdit.active")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Course Card (clickable) ──────────────────────────────── */
function CourseCard({ course, t, onClick }) {
  return (
    <button
      type="button"
      className="group bg-white border border-slate-200/80 rounded-xl p-3.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 cursor-pointer text-left w-full"
      onClick={() => {
        
        onClick();
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800 text-[13px] leading-snug truncate group-hover:text-primary transition-colors" title={course.courseName}>
            {course.courseName}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 tracking-wide border border-slate-200/50">
              {course.courseCode}
            </span>
            {course.isElective && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 tracking-wide border border-amber-200/50">
                {t("scheduleEdit.electiveBadge")}
              </span>
            )}
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-400 shrink-0">
          #{course.courseId}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 text-[11px] font-semibold">
        <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-md flex-1 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          <span className="truncate">{t("scheduleEdit.demand")}</span>
          <span className="text-slate-700 ml-auto font-bold">{course.totalDemand}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 bg-emerald-50/60 px-2 py-1 rounded-md flex-1 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="truncate">{t("scheduleEdit.normal")}</span>
          <span className="text-emerald-700 ml-auto font-bold">{course.normalStudentsCount}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 bg-rose-50/60 px-2 py-1 rounded-md flex-1 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
          <span className="truncate">{t("scheduleEdit.retake")}</span>
          <span className="text-rose-700 ml-auto font-bold">{course.retakeStudentsCount}</span>
        </div>
      </div>

      {/* Click hint */}
      <div className="mt-2 text-[10px] font-semibold text-slate-300 group-hover:text-primary/50 transition-colors flex items-center gap-1">
        <Users className="w-3 h-3" />
        Click to view students
      </div>
    </button>
  );
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function EditSchedule() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Semesters
  const [semesters, setSemesters] = useState([]);
  const [semLoading, setSemLoading] = useState(true);
  const [selectedSemId, setSelectedSemId] = useState("");

  // Offerings data
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  // Search
  const [search, setSearch] = useState("");

  // Load semesters on mount
  useEffect(() => {
    fetchSemestersApi()
      .then(res => {
        const list = res.data || [];
        setSemesters(list);
        // Auto-select the active semester if one exists
        const active = list.find(s => s.isActive);
        if (active) setSelectedSemId(String(active.semesterId));
        setSemLoading(false);
      })
      .catch(err => {
        console.error(err);
        setSemLoading(false);
      });
  }, []);

  // Fetch offerings when semester changes
  useEffect(() => {
    if (!selectedSemId) {
      setData(null);
      return;
    }
    setDataLoading(true);
    setData(null);
    analyzeOfferingsApi(selectedSemId)
      .then(res => {
        setData(res.data);
        setDataLoading(false);
      })
      .catch(err => {
        console.error(err);
        setDataLoading(false);
      });
  }, [selectedSemId]);

  // Filter courses
  const filteredCourses = data?.suggestedCourses?.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.courseName?.toLowerCase().includes(q) ||
      c.courseCode?.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="p-4 sm:p-5 max-w-[1100px] mx-auto space-y-5">
      {/* ── Header Bar ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none">
              Analyze Offerings
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Review suggested courses for the selected semester
            </p>
          </div>
        </div>

        {semLoading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium">Loading…</span>
          </div>
        ) : (
          <SemesterDropdown
            semesters={semesters}
            selectedId={selectedSemId}
            onChange={setSelectedSemId}
            t={t}
          />
        )}
      </div>

      {/* ── Loading state ──────────────────────────────────── */}
      {dataLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 animate-in fade-in duration-300">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-semibold text-sm text-slate-500">Analyzing offerings…</p>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────── */}
      {!dataLoading && !data && selectedSemId && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <BookOpen className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-medium">No data available for this semester</p>
        </div>
      )}

      {/* ── No semester selected ───────────────────────────── */}
      {!selectedSemId && !semLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <Search className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-medium">Select a semester to view offerings</p>
        </div>
      )}

      {/* ── Data View ──────────────────────────────────────── */}
      {data && !dataLoading && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Students</p>
                <p className="text-xl font-extrabold text-slate-800 leading-none mt-0.5">{data.totalActiveStudents}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suggested Courses</p>
                <p className="text-xl font-extrabold text-slate-800 leading-none mt-0.5">{data.suggestedCourses?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Overlaps Warning */}
          {data.electiveOverlaps?.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-[0.06]">
                <AlertTriangle className="w-16 h-16 text-amber-500" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-sm">Elective Overlaps Detected</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {data.electiveOverlaps.map((overlap, idx) => (
                    <div key={idx} className="bg-white/60 border border-amber-200/60 rounded-lg px-2.5 py-1.5 text-xs text-amber-800 flex justify-between items-center backdrop-blur-sm">
                      <span className="font-semibold text-amber-900">Course {overlap.courseAId} & {overlap.courseBId}</span>
                      <span className="bg-amber-200/50 px-2 py-0.5 rounded font-bold text-amber-900">{overlap.overlapCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Course list header + search */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Suggested Courses</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="course-search"
                  name="courseSearch"
                  type="text"
                  placeholder="Search courses…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all font-medium text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Course grid */}
            <div
              className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto bg-slate-50/30"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`.course-grid::-webkit-scrollbar { display: none; }`}</style>
              <div className="course-grid contents">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    t={t}
                    onClick={() => {
                      navigate(`/course-students?semesterId=${selectedSemId}&courseId=${course.courseId}`);
                    }}
                  />
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-slate-400 gap-1.5">
                  <Search className="w-7 h-7 text-slate-300" />
                  <p className="text-xs font-medium">No courses match your search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
