const DAYS_MAP = {
    Saturday: 0, Sunday: 1, Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5
};

export function parseHour(str) {
    if (!str) return 9;
    const [h, m] = str.trim().split(":");
    return parseInt(h, 10) + (parseInt(m || "0", 10) / 60);
}

export function parseScheduledSection(section, courseName, type) {
    const [startStr, endStr] = (section.schedule?.time || "09:00 - 11:00").split(" - ");
    const startHour = parseHour(startStr);
    const endHour = parseHour(endStr);
    return {
        id: `${type}-${section.sectionId}`,
        dayIndex: DAYS_MAP[section.schedule?.day] ?? 0,
        startHour,
        endHour,
        timeRange: section.schedule?.time || "",
        courseName,
        sessionLabel: `${type} — ${section.name}`,
        instructorName: section.instructor || "",
        locationText: section.schedule?.room || "TBA",
        selected: type === "Lecture",
    };
}

export function checkConflictWithBase(section, baseSessions) {
    if (!section.schedule?.day || !section.schedule?.time) return null;
    const dayIndex = DAYS_MAP[section.schedule.day];
    if (dayIndex === undefined) return null;

    const [startStr, endStr] = section.schedule.time.split(" - ");
    if (!startStr || !endStr) return null;
    const startHour = parseHour(startStr);
    const endHour = parseHour(endStr);

    for (const base of baseSessions) {
        if (base.dayIndex === dayIndex) {
            if (Math.max(startHour, base.startHour) < Math.min(endHour, base.endHour)) {
                return `Conflicts with ${base.courseName} (${base.sessionLabel})`;
            }
        }
    }
    return null;
}

/* ── Separate "Project" courses from mandatory ── */
export function separateProjectCourses(mandatoryCourses) {
    const mandatory = [];
    const projects = [];
    (mandatoryCourses || []).forEach(c => {
        if (c.courseName === "Project") projects.push(c);
        else mandatory.push(c);
    });
    return { mandatory, projects };
}

/* ── Generic course aggregator across groups (dedup sections by sectionId) ── */
function aggregateCourses(groups, courseExtractor) {
    const courseMap = new Map();
    for (const group of groups) {
        const courses = courseExtractor(group) || [];
        for (const course of courses) {
            if (!courseMap.has(course.courseId)) {
                courseMap.set(course.courseId, {
                    courseId: course.courseId,
                    courseName: course.courseName,
                    creditHours: course.creditHours,
                    level: course.level,
                    category: course.category,
                    advisorNote: course.advisorNote,
                    lectureSections: [],
                    labSections: [],
                    _lecIds: new Set(),
                    _labIds: new Set(),
                });
            }
            const entry = courseMap.get(course.courseId);
            for (const sec of (course.lectureSections || [])) {
                if (!entry._lecIds.has(sec.sectionId)) {
                    entry._lecIds.add(sec.sectionId);
                    entry.lectureSections.push({ ...sec, classGroupId: group.classGroupId });
                }
            }
            for (const sec of (course.labSections || [])) {
                if (!entry._labIds.has(sec.sectionId)) {
                    entry._labIds.add(sec.sectionId);
                    entry.labSections.push({ ...sec, classGroupId: group.classGroupId });
                }
            }
        }
    }
    return [...courseMap.values()].map(({ _lecIds, _labIds, ...c }) => c);
}

/* ── Aggregate injected mandatory + Project courses ── */
export function aggregateInjectedCourses(groups) {
    const injected = aggregateCourses(groups, g => g.injectedMandatoryCourses);
    const projects = aggregateCourses(groups, g =>
        (g.mandatoryCourses || []).filter(c => c.courseName === "Project")
    );
    return [...injected, ...projects];
}

/* ── Aggregate elective courses ── */
export function aggregateElectiveCourses(groups) {
    return aggregateCourses(groups, g => g.electiveCourses?.courses);
}

/* ── Build session list for WeeklyScheduleGrid ── */
export function buildGroupSessions(group, mandatoryChoices, sidebarSelections) {
    const sessions = [];
    if (!group) return sessions;

    const { mandatory } = separateProjectCourses(group.mandatoryCourses);
    mandatory.forEach(course => {
        const ch = mandatoryChoices?.[course.courseId] || {};

        const lecture = ch.lectureId
            ? course.lectureSections?.find(s => s.sectionId === ch.lectureId)
            : course.lectureSections?.[0];
        if (lecture) sessions.push(parseScheduledSection(lecture, course.courseName, "Lecture"));

        const lab = ch.labId
            ? course.labSections?.find(s => s.sectionId === ch.labId)
            : course.labSections?.[0];
        if (lab) sessions.push(parseScheduledSection(lab, course.courseName, "Lab"));
    });

    // Sidebar selections (injected + elective + project)
    (sidebarSelections || []).forEach(({ course, lectureSection, labSection }) => {
        if (lectureSection) sessions.push(parseScheduledSection(lectureSection, course.courseName, "Lecture"));
        if (labSection) sessions.push(parseScheduledSection(labSection, course.courseName, "Lab"));
    });

    return sessions;
}

/* ── Build apply-bulk payload ── */
export function buildPayload(studentId, group, mandatoryChoices, sidebarSelections) {
    const gId = group.classGroupId;
    const selections = [];

    const { mandatory } = separateProjectCourses(group.mandatoryCourses);
    mandatory.forEach(course => {
        const ch = mandatoryChoices?.[course.courseId] || {};
        selections.push({
            classGroupId: gId,
            courseId: course.courseId,
            lectureSectionId: ch.lectureId ?? course.lectureSections?.[0]?.sectionId ?? null,
            labSectionId: ch.labId ?? course.labSections?.[0]?.sectionId ?? null,
        });
    });

    (sidebarSelections || []).forEach(({ course, lectureSection, labSection }) => {
        selections.push({
            classGroupId: lectureSection?.classGroupId ?? labSection?.classGroupId ?? gId,
            courseId: course.courseId,
            lectureSectionId: lectureSection?.sectionId ?? null,
            labSectionId: labSection?.sectionId ?? null,
        });
    });

    return { studentId: Number(studentId), selections };
}
