import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchStudentTimetable } from "@/shared/services/timetableApi";
import {
    getRegistrationPlan,
    fetchAllOfferedCoursesApi,
    applyBulkEnrollment,
    dropCoursesApi,
} from "@/shared/services/enrollmentsApi";
import { parseHour, timesOverlap, dayShort, buildCourseMap } from "../utils/registrationHelpers";
import toast from "@/shared/lib/toast";

/** Look up creditHours for a courseId from the course maps */
function findCreditHours(courseId, ...courseMaps) {
    for (const map of courseMaps) {
        for (const [, data] of map) {
            if (data.courseId === courseId) return data.creditHours ?? 0;
        }
    }
    return 0;
}

export function useRegistration({ studentId, studentCode, onSuccess }) {
    const [timetable, setTimetable] = useState(null);
    const [ttLoading, setTtLoading] = useState(false);
    const [droppingId, setDroppingId] = useState(null);

    const [availableOptions, setAvailableOptions] = useState([]);
    const [avLoading, setAvLoading] = useState(false);
    const [avError, setAvError] = useState(null);
    const [academicInsights, setAcademicInsights] = useState([]);

    const [offeredOptions, setOfferedOptions] = useState([]);
    const [offLoading, setOffLoading] = useState(false);
    const [offError, setOffError] = useState(null);

    const [pending, setPending] = useState([]);
    const [addConflictMsg, setAddConflictMsg] = useState(null);

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [openCourses, setOpenCourses] = useState(new Set());

    const fetchTimetable = useCallback(async () => {
        if (!studentId) return;
        setTtLoading(true);
        try {
            const res = await fetchStudentTimetable(studentId);
            setTimetable(res.data);
        } catch { /* silent */ }
        finally { setTtLoading(false); }
    }, [studentId]);

    useEffect(() => { fetchTimetable(); }, [fetchTimetable]);

    const fetchAvailable = useCallback(async () => {
        if (!studentId) return;
        setAvLoading(true); setAvError(null);
        try {
            const d = await getRegistrationPlan(studentId);
            setAvailableOptions(d?.enrollmentOptions ?? []);
            setAcademicInsights(d?.academicInsights ?? []);
        } catch (e) {
            setAvError(e?.message || "Failed to load available groups");
        } finally {
            setAvLoading(false);
        }
    }, [studentId]);

    const fetchOffered = useCallback(async () => {
        if (!studentCode) return;
        setOffLoading(true); setOffError(null);
        try {
            const d = await fetchAllOfferedCoursesApi(studentCode);
            setOfferedOptions(d?.enrollmentOptions ?? []);
        } catch (e) {
            setOffError(e?.message || "Failed to load offered courses");
        } finally {
            setOffLoading(false);
        }
    }, [studentCode]);

    useEffect(() => { fetchAvailable(); }, [fetchAvailable]);
    useEffect(() => { fetchOffered(); }, [fetchOffered]);

    const pendingIds = useMemo(() => new Set(pending.map(p => p.sectionId)), [pending]);

    const blockedIds = useMemo(() => {
        const blocked = new Map();

        const enrolledCourseNames = new Set((timetable?.enrollments || []).map(e => e.courseName));

        const allSections = [];
        [...availableOptions, ...offeredOptions].forEach(group => {
            const allCourses = [
                ...(group.mandatoryCourses ?? []),
                ...(group.injectedMandatoryCourses ?? []),
                ...(group.electiveCourses?.courses ?? []),
            ];
            allCourses.forEach(course => {
                const isEnrolled = enrolledCourseNames.has(course.courseName);
                (course.lectureSections ?? []).forEach(s => allSections.push({ ...s, _courseId: course.courseId, _type: "Lecture", _isEnrolled: isEnrolled }));
                (course.labSections ?? []).forEach(s => allSections.push({ ...s, _courseId: course.courseId, _type: "Lab", _isEnrolled: isEnrolled }));
            });
        });

        const pendingCourseTypes = new Set(pending.map(p => `${p.courseId}-${p.type}`));

        allSections.forEach(sec => {
            if (sec._isEnrolled) {
                blocked.set(sec.sectionId, "Course already enrolled");
                return;
            }

            const [startStr, endStr] = (sec.schedule?.time || "").split(" - ");
            const newStart = parseHour(startStr);
            const newEnd = parseHour(endStr);
            const newDay = sec.schedule?.day;

            if (newDay && !pendingIds.has(sec.sectionId)) {
                const conflict = pending.find(p => p.day === newDay && timesOverlap(newStart, newEnd, p.startHour, p.endHour));
                if (conflict) {
                    blocked.set(sec.sectionId, `Time conflict with ${conflict.courseName}`);
                    return;
                }
            }

            if (sec.hasTimeConflict) { blocked.set(sec.sectionId, sec.conflictMessage || "Time conflict"); return; }
            if (sec.conflictsWith?.some(id => pendingIds.has(id))) {
                blocked.set(sec.sectionId, "Time conflict with selected section");
                sec.conflictsWith.forEach(id => { if (pendingIds.has(id)) blocked.set(id, "Time conflict with selected section"); });
            }
            if (!pendingIds.has(sec.sectionId) && pendingCourseTypes.has(`${sec._courseId}-${sec._type}`)) {
                blocked.set(sec.sectionId, `A ${sec._type} is already selected for this course`);
            }
        });
        return blocked;
    }, [availableOptions, offeredOptions, pendingIds, pending, timetable]);

    const availableCourseMap = useMemo(() => buildCourseMap(availableOptions), [availableOptions]);
    const offeredCourseMap = useMemo(() => buildCourseMap(offeredOptions), [offeredOptions]);

    // ── Credit hours tracking ──────────────────────────────────────────────────
    const allowedHours = useMemo(() => {
        return timetable?.hours?.allowed ?? timetable?.allowedHours ?? 0;
    }, [timetable]);

    const registeredHours = useMemo(() => {
        return timetable?.hours?.registered ?? timetable?.registeredHours ?? 0;
    }, [timetable]);

    // Sum credit hours of unique pending courses (don't double-count lecture + lab of same course)
    const pendingCreditHours = useMemo(() => {
        const seen = new Set();
        let total = 0;
        pending.forEach(p => {
            if (!seen.has(p.courseId)) {
                seen.add(p.courseId);
                total += p.creditHours ?? 0;
            }
        });
        return total;
    }, [pending]);

    const totalHoursWithPending = registeredHours + pendingCreditHours;

    async function handleDrop(enrollmentId) {
        setDroppingId(enrollmentId);
        try {
            const res = await dropCoursesApi([enrollmentId]);
            if (res?.message) toast.success(res.message);
            await fetchTimetable();
            await Promise.all([fetchAvailable(), fetchOffered()]);
            onSuccess?.();
        } catch { /* error toast handled globally by api.js */ }
        finally { setDroppingId(null); }
    }

    function handleAdd(item) {
        if (blockedIds.has(item.sectionId) || pendingIds.has(item.sectionId)) return;

        const [startStr, endStr] = (item.schedule?.time || "").split(" - ");
        const newStart = parseHour(startStr);
        const newEnd = parseHour(endStr);
        const newDay = item.schedule?.day;

        const conflict = pending.find(p => {
            if (!newDay || p.day !== newDay) return false;
            return timesOverlap(newStart, newEnd, p.startHour, p.endHour);
        });

        if (conflict) {
            const msg = `Time conflict with pending: ${conflict.courseName} (${dayShort(conflict.day)} ${conflict.schedule?.time})`;
            setAddConflictMsg(msg);
            setTimeout(() => setAddConflictMsg(null), 4000);
            return;
        }

        let courseName = "Course";
        let creditHours = 0;
        for (const [name, data] of availableCourseMap) {
            if (data.groups.some(g =>
                g.lecture?.sectionId === item.sectionId || g.labs.some(l => l.sectionId === item.sectionId)
            )) { courseName = name; creditHours = data.creditHours ?? 0; break; }
        }
        if (courseName === "Course") {
            for (const [name, data] of offeredCourseMap) {
                if (data.groups.some(g =>
                    g.lecture?.sectionId === item.sectionId || g.labs.some(l => l.sectionId === item.sectionId)
                )) { courseName = name; creditHours = data.creditHours ?? 0; break; }
            }
        }

        // ── Credit hours validation: only count if this is a NEW course (not already pending) ──
        const isNewCourse = !pending.some(p => p.courseId === item.courseId);
        if (isNewCourse && allowedHours > 0) {
            const wouldBeTotal = totalHoursWithPending + creditHours;
            if (wouldBeTotal > allowedHours) {
                const msg = `Cannot add "${courseName}" (${creditHours}h) — would exceed allowed hours`;
                setAddConflictMsg(msg);
                setTimeout(() => setAddConflictMsg(null), 5000);
                return;
            }
        }

        setPending(prev => [...prev, {
            ...item, courseName, creditHours,
            day: newDay, startHour: newStart, endHour: newEnd
        }]);
        setSaveSuccess(false); setSaveError(null);
    }

    function handleRemovePending(sectionId) {
        setPending(prev => prev.filter(p => p.sectionId !== sectionId));
    }

    function toggleCourse(name) {
        setOpenCourses(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    }

    async function handleSave() {
        if (pending.length === 0) return;
        setSaving(true); setSaveError(null); setSaveSuccess(false);
        try {
            const grouped = {};
            pending.forEach(p => {
                const key = `${p.classGroupId}-${p.courseId}`;
                if (!grouped[key]) grouped[key] = {
                    classGroupId: p.classGroupId, courseId: p.courseId,
                    lectureSectionId: null, labSectionId: null
                };
                if (p.type === "Lecture") grouped[key].lectureSectionId = p.sectionId;
                if (p.type === "Lab") grouped[key].labSectionId = p.sectionId;
            });
            const res = await applyBulkEnrollment({ studentId, selections: Object.values(grouped) });
            // Show the backend response message as a success toast
            toast.success(res?.message);
            setSaveSuccess(true);
            setPending([]);
            await fetchTimetable();
            await Promise.all([fetchAvailable(), fetchOffered()]);
            onSuccess?.();
        } catch {
            // Error toast is handled globally by api.js interceptor
            setSaveError(true);
        } finally {
            setSaving(false);
        }
    }

    return {
        timetable, ttLoading, droppingId,
        availableCourseMap, avLoading, avError,
        offeredCourseMap, offLoading, offError,
        academicInsights,
        pending, addConflictMsg, pendingIds, blockedIds,
        saving, saveError, saveSuccess,
        openCourses,
        allowedHours, registeredHours, pendingCreditHours, totalHoursWithPending,
        handleDrop, handleAdd, handleRemovePending, toggleCourse, handleSave,
        clearConflictMsg: () => setAddConflictMsg(null)
    };
}
