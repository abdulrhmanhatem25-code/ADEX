export function parseHour(str) {
    if (!str) return 0;
    const [h, m] = str.trim().split(":");
    return parseInt(h, 10) + (parseInt(m || "0", 10) / 60);
}

export function timesOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
}

export function dayShort(day) {
    return day?.slice(0, 3) ?? "?";
}

function getPrefix(name) {
    if (!name) return "";
    if (name.includes("-LEC-")) return name.split("-LEC-")[0];
    if (name.includes("-LAB-")) return name.split("-LAB-")[0];
    return name.split("-")[0];
}

/**
 * Build a Map<courseName, { courseId, courseName, creditHours, category, advisorNote, groups }>
 * Each group = { classGroupId, classGroupName, courseId, lecture, labs }
 *
 * Dedup rules:
 *   - Sections with same sectionId → skip duplicate
 *   - Labs are strictly paired to their parent lecture by matching the prefix (e.g. L4G1)
 */
export function buildCourseMap(options) {
    const map = new Map();

    (options ?? []).forEach(group => {
        const allCourses = [
            ...(group.mandatoryCourses ?? []),
            ...(group.injectedMandatoryCourses ?? []),
            ...(group.electiveCourses?.courses ?? []),
        ];

        allCourses.forEach(course => {
            if (!map.has(course.courseName)) {
                map.set(course.courseName, {
                    courseId: course.courseId,
                    courseName: course.courseName,
                    creditHours: course.creditHours,
                    category: course.category,
                    advisorNote: course.advisorNote,
                    groups: [],
                    _allLecs: new Map(), // sectionId -> lecture object
                    _allLabs: new Map(), // sectionId -> lab object
                });
            }

            const entry = map.get(course.courseName);

            // Update category/advisorNote if not set yet (prefer Backlog info)
            if (!entry.category && course.category) entry.category = course.category;
            if (!entry.advisorNote && course.advisorNote) entry.advisorNote = course.advisorNote;
            if (course.category === "Backlog") {
                entry.category = course.category;
                if (course.advisorNote) entry.advisorNote = course.advisorNote;
            }

            // Collect all unique lectures and labs globally for this course
            (course.lectureSections ?? []).forEach(lec => {
                if (!entry._allLecs.has(lec.sectionId)) {
                    entry._allLecs.set(lec.sectionId, {
                        ...lec,
                        classGroupId: group.classGroupId,
                        classGroupName: group.classGroupName,
                    });
                }
            });

            (course.labSections ?? []).forEach(lab => {
                if (!entry._allLabs.has(lab.sectionId)) {
                    entry._allLabs.set(lab.sectionId, {
                        ...lab,
                        classGroupId: group.classGroupId,
                        classGroupName: group.classGroupName,
                    });
                }
            });
        });
    });

    // Now build the groups array by matching labs to lectures by prefix
    for (const [, entry] of map.entries()) {
        const lecs = Array.from(entry._allLecs.values());
        const labs = Array.from(entry._allLabs.values());

        if (lecs.length === 0 && labs.length > 0) {
            // No lectures, just labs. Put them all in one "no-lecture" group
            // (or optionally group them by lab prefix, but one group is usually fine for no-lec)
            entry.groups.push({
                classGroupId: labs[0].classGroupId,
                classGroupName: labs[0].classGroupName,
                courseId: entry.courseId,
                lecture: null,
                labs: labs,
            });
        } else {
            // Group labs under the correct lecture by comparing prefixes
            lecs.forEach(lec => {
                const lecPrefix = getPrefix(lec.name);
                const matchingLabs = labs.filter(lab => getPrefix(lab.name) === lecPrefix);
                
                entry.groups.push({
                    classGroupId: lec.classGroupId,
                    classGroupName: lec.classGroupName,
                    courseId: entry.courseId,
                    lecture: lec,
                    labs: matchingLabs,
                });
            });
        }

        // Clean up tracking Maps
        delete entry._allLecs;
        delete entry._allLabs;
    }

    return map;
}
