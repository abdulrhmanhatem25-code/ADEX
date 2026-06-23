// ─── buildStatusMap ──────────────────────────────────────────────────────────
export function buildStatusMap(apiData) {
  const map = new Map();
  if (!apiData) return map;

  const addCourses = (list) => {
    (list ?? []).forEach((c) => {
      const priority = (c.priority ?? "").toLowerCase();
      const type =
        priority === "retake" ? "retake" :
          priority === "elective" ? "elective" : "core";
      map.set(c.courseCode, { type, reason: c.reason ?? "" });
    });
  };

  addCourses(apiData.suggested);
  addCourses(apiData.additionalEligible);

  (apiData.locked ?? []).forEach((c) => {
    map.set(c.courseCode, { type: "locked", reason: null });
  });

  return map;
}

// ─── parseProgram ─────────────────────────────────────────────────────────────
export function parseProgram(programData) {
  const items = [];
  const poolsMap = new Map();
  if (!programData || !Array.isArray(programData.levels)) return { items, pools: [] };

  programData.levels.forEach(lvlObj => {
    const level = lvlObj.level;
    (lvlObj.electivePools ?? []).forEach(pool => {
      if (!poolsMap.has(pool.groupName)) poolsMap.set(pool.groupName, { ...pool, level });
    });
    (lvlObj.semesters ?? []).forEach(semObj => {
      const semester = semObj.semester;
      const slotCounter = {};
      (semObj.courses ?? []).forEach((course, idx) => {
        const hasCode = Boolean(course.code);
        if (hasCode) {
          items.push({
            id: `${course.code}-L${level}-S${semester}`,
            level, semester,
            courseType: course.type ?? "",
            isSlot: false,
            isElective: false,
            course: { courseId: course.courseId, courseCode: course.code, courseName: course.name ?? "", courseNameAr: course.nameAr ?? "", creditHours: course.creditHours },
            slotName: null,
          });
        } else if (course.poolRef || course.slot) {
          const poolRef = course.poolRef || course.slot || `Elective-${idx}`;
          slotCounter[poolRef] = (slotCounter[poolRef] ?? 0) + 1;
          const slotIdx = slotCounter[poolRef];
          items.push({
            id: `SLOT-${poolRef}-L${level}-S${semester}-${slotIdx}`,
            level, semester,
            courseType: course.type ?? "Elective",
            isSlot: true,
            isElective: false,
            course: { courseCode: `Slot`, courseName: poolRef, creditHours: null },
            slotName: poolRef,
          });
        }
      });
    });
  });

  return { items, pools: [...poolsMap.values()] };
}
