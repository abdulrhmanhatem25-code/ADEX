import React, { useRef } from "react";
import { Loader2, AlertCircle, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

import LevelRow from "./components/LevelRow";
import ElectivesSection from "./components/ElectivesSection";
import ConnectionsLayer from "./components/ConnectionsLayer";

import { useCourseMapData } from "./hooks/useCourseMapData";
import { useCourseMapInteractions } from "./hooks/useCourseMapInteractions";
import { useCourseMapExport } from "./hooks/useCourseMapExport";

export default function CourseMap({ studentCode, student }) {
  // ─── Data ──────────────────────────────────────────────────────────────────
  const {
    programId,
    specializationLabel,
    specializationLabelAr,
    gridItems,
    electivePools,
    prereqMap,
    completedCodes,
    statusMap,
    loading,
    prereqLoading,
    error,
  } = useCourseMapData(studentCode, student);

  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  // ─── Interactions ──────────────────────────────────────────────────────────
  const {
    hoveredCourse,
    focusedCourse,
    relatedCourses,
    nodesRef,
    registerRef,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    clearFocus,
  } = useCourseMapInteractions(prereqMap);

  // ─── Export ────────────────────────────────────────────────────────────────
  const containerRef = useRef(null);
  const displayLabel = isAr ? specializationLabelAr : specializationLabel;
  const { isExporting, exportToPDF } = useCourseMapExport(containerRef, displayLabel, programId);

  // ─── Render guards ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">{t("courseMap.loading")}</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
      <AlertCircle className="h-8 w-8 text-rose-400" />
      <p className="text-xs text-center max-w-sm">{error}</p>
    </div>
  );

  // ─── Derived data ──────────────────────────────────────────────────────────
  const regItems = gridItems.filter(i => !i.isElective);
  const electiveItems = gridItems.filter(i => i.isElective);
  const levels = [...new Set(regItems.map(c => c.level))].sort((a, b) => a - b);

  // Shared props passed to every course row/section
  const sharedProps = {
    completedCodes,
    statusMap,
    hoveredCourse,
    focusedCourse,
    relatedCourses,
    isExporting,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
    registerRef,
  };

  // ─── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-bold text-slate-700">
          {t("courseMap.curriculum", { label: isAr ? (specializationLabelAr || (programId === 2 ? "تقنية المعلومات" : "علوم الحاسب")) : (specializationLabel || (programId === 2 ? "IT" : "CS")) })}
        </h3>
        <div className="flex items-center gap-3">
          {focusedCourse && (
            <button
              onClick={clearFocus}
              className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              {t("courseMap.clearFocus")}
            </button>
          )}
          {prereqLoading && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("courseMap.prerequisitesLoading")}
            </span>
          )}
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs bg-white text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {isExporting ? t("courseMap.exporting") : t("courseMap.exportPdf")}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 flex-wrap px-1">
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-cmap-completed-bg border border-cmap-completed-border"></div>{isAr ? "مكتمل" : "Completed"}</div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-cmap-core-bg border border-cmap-core-border"></div>{isAr ? "متاح / أساسي" : "Available / Core"}</div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-cmap-elective-bg border border-cmap-elective-border"></div>{isAr ? "متاح / اختياري" : "Available / Elective"}</div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-cmap-retake-bg border border-cmap-retake-border"></div>{isAr ? "إعادة" : "Retake"}</div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-cmap-locked-bg border border-cmap-locked-border border-dashed"></div>{isAr ? "مغلق" : "Locked"}</div>
      </div>

      {/* Map Canvas */}
      <div className="w-full overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 bg-slate-50 min-h-[500px]">
        <div ref={containerRef} className="relative inline-block min-w-full p-6 md:p-8">

          {/* SVG connection lines */}
          <ConnectionsLayer
            containerRef={containerRef}
            nodesRef={nodesRef}
            prereqMap={prereqMap}
            items={gridItems}
            hoveredCourse={hoveredCourse}
            focusedCourse={focusedCourse}
            relatedCourses={relatedCourses}
            isExporting={isExporting}
          />

          {/* Course grid */}
          <div className={`relative z-10 flex w-max min-w-full ${isExporting ? "flex-row gap-8" : "flex-row md:flex-col gap-8 md:gap-6"}`}>
            {levels.map(level => (
              <LevelRow
                key={level}
                level={level}
                courses={regItems.filter(c => c.level === level)}
                {...sharedProps}
              />
            ))}
            <ElectivesSection
              pools={electivePools}
              items={electiveItems}
              {...sharedProps}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
