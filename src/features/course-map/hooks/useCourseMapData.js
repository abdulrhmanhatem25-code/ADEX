import { useState, useEffect, useCallback } from "react";
import { fetchProgramCoursesApi, fetchPrereqsApi } from "@/shared/services/coursesApi";
import { fetchAcademicRecordsApi, fetchSuggestedCoursesApi } from "@/shared/services/studentsApi";
import { buildStatusMap, parseProgram } from "../utils/courseMapUtils";

/**
 * Fetches all data needed for the Course Map:
 * - Program courses & elective pools
 * - Completed course codes from the student's academic record
 * - Suggested course status map
 * - Prerequisite map for all courses
 */
export function useCourseMapData(studentCode, student) {
  const studentId = student?.studentId ?? student?.id ?? null;

  const [programId, setProgramId] = useState(() => {
    const dept = (student?.departmentName || "").toLowerCase();
    return dept.includes("it") ? 2 : 1;
  });
  const [specializationLabel, setSpecializationLabel] = useState(student?.departmentName || "");
  const [specializationLabelAr, setSpecializationLabelAr] = useState(student?.departmentNameAr || "");

  const [gridItems, setGridItems] = useState([]);
  const [electivePools, setElectivePools] = useState([]);
  const [prereqMap, setPrereqMap] = useState({});
  const [completedCodes, setCompletedCodes] = useState(new Set());
  const [statusMap, setStatusMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [prereqLoading, setPrereqLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPrereqMap({});

    (async () => {
      try {
        let resolvedProgramId = programId;

        if (studentCode) {
          try {
            const recRes = await fetchAcademicRecordsApi(studentCode);
            if (cancelled) return;
            const rawRec = recRes.data;
            const recData = rawRec?._value ?? rawRec?.value ?? rawRec;

            const spec = recData?.specialization || recData?.departmentName || recData?.program || "";
            const specLower = spec.toLowerCase();
            const isIT = specLower.includes("information technology") || specLower === "it" || specLower.startsWith("it ");
            resolvedProgramId = isIT ? 2 : 1;

            if (!cancelled) {
              setProgramId(resolvedProgramId);
              if (spec) setSpecializationLabel(spec);
            }

            const done = new Set();
            (recData?.categories ?? []).forEach(cat =>
              (cat.courses ?? []).forEach(c => {
                if (c.code && c.grade && c.grade !== "F" && c.grade !== "—") done.add(c.code);
              })
            );
            if (!cancelled) setCompletedCodes(done);
          } catch { /* academic record is optional */ }
        }

        if (cancelled) return;

        const courseRes = await fetchProgramCoursesApi(resolvedProgramId);
        if (cancelled) return;

        const raw = courseRes.data;
        const programData = raw ;

        if (!cancelled && (programData?.programName || programData?.programCode)) {
          setSpecializationLabel(programData.programName || programData.programCode);
          setSpecializationLabelAr(programData.programNameAr || programData.programName || programData.programCode);
        }

        let items = [], pools = [];
        if (programData) {
          const parsed = parseProgram(programData);
          items = parsed.items;
          pools = parsed.pools;
        } else if (Array.isArray(raw)) {
          const seen = new Map();
          raw.forEach(item => {
            const code = item?.course?.courseCode;
            if (!code) return;
            if (!seen.has(code) || item.id > seen.get(code).id) seen.set(code, item);
          });
          items = [...seen.values()].map(item => ({
            ...item, 
            isSlot: false, 
            isElective: false, 
            id: item.course.courseCode,
            course: {
              ...item.course,
              courseNameAr: item.course.nameAr ?? item.course.courseNameAr ?? ""
            }
          }));
        }

        const regularItems = items.filter(i => !i.isElective);
        const maxRegLevel = regularItems.reduce((m, it) => Math.max(m, it.level), 0);
        const ELECTIVE_LEVEL = maxRegLevel + 1;

        const regularCodes = new Set(regularItems.filter(i => !i.isSlot).map(i => i.course.courseCode));
        const electiveItems = [];
        pools.forEach((pool, pi) => {
          (pool.courses ?? []).forEach(pc => {
            if (!regularCodes.has(pc.code)) {
              electiveItems.push({
                id: `EPOOL-${pc.code}`,
                level: ELECTIVE_LEVEL,
                semester: pi + 1,
                courseType: pool.courseType ?? "Elective",
                isSlot: false,
                isElective: true,
                poolName: pool.groupName,
                course: { courseId: pc.courseId, courseCode: pc.code, courseName: pc.name ?? "", courseNameAr: pc.nameAr ?? "", creditHours: pc.creditHours },
              });
            }
          });
        });

        const allItems = [...regularItems, ...electiveItems];

        if (cancelled) return;
        setGridItems(allItems);
        setElectivePools(pools);
        setLoading(false);

        if (studentId) {
          fetchSuggestedCoursesApi(studentId)
            .then(res => { if (!cancelled) setStatusMap(buildStatusMap(res.data)); })
            .catch(() => { });
        }

        const allCodes = [...new Set(allItems.filter(i => !i.isSlot).map(i => i.course.courseCode))];
        if (allCodes.length > 0) {
          setPrereqLoading(true);
          const results = await Promise.allSettled(allCodes.map(c => fetchPrereqsApi(c)));
          if (cancelled) return;
          const map = {};
          results.forEach((r, idx) => {
            if (r.status === "fulfilled") {
              const prereqs = r.value.data?.prerequisites ?? [];
              if (prereqs.length) map[allCodes[idx]] = prereqs.map(p => p.courseCode);
            }
          });
          setPrereqMap(map);
          setPrereqLoading(false);
        }

      } catch (e) {
        console.error("[CourseMap] fetch error:", e);
        if (!cancelled) { setError("Failed to load curriculum data."); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [studentCode, studentId]);

  return {
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
  };
}
