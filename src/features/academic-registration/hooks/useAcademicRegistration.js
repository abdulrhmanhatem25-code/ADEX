import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useProfile } from "@/app/providers/ProfileProvider";
import { getRegistrationPlan, applyBulkEnrollment, dropCoursesApi } from "@/shared/services/enrollmentsApi";
import { fetchStudentTimetable } from "@/shared/services/timetableApi";
import {
    aggregateInjectedCourses,
    aggregateElectiveCourses,
    separateProjectCourses,
    buildGroupSessions,
    buildPayload,
    checkConflictWithBase,
} from "../utils/academicHelpers";

function useStudentId() {
    const params = useParams();
    const location = useLocation();
    const qs = new URLSearchParams(location.search);
    return params.studentId ?? qs.get("studentId") ?? qs.get("id") ?? null;
}

export function useAcademicRegistration() {
    const urlStudentId = useStudentId();
    const { isLoading: isAuthLoading } = useAuth();
    const { currentStudentId, userProfile } = useProfile();
    const studentId = urlStudentId || currentStudentId;
    const isInitializing = !studentId && isAuthLoading;

    // Allowed hours from student profile
    const allowedHours = userProfile?.student?.allowedHours ?? 0;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [groups, setGroups] = useState([]);
    const [academicInsights, setAcademicInsights] = useState([]);
    const [rawInjectedCourses, setRawInjectedCourses] = useState([]);
    const [rawElectiveCourses, setRawElectiveCourses] = useState([]);


    // UI state
    const [openGroupId, setOpenGroupId] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);

    // Mandatory section choices per group: { [groupId]: { [courseId]: { lectureId, labId } } }
    const [mandatoryChoicesByGroup, setMandatoryChoicesByGroup] = useState({});
    // Injected selections: { [courseId]: { lectureId, labId } }
    const [selectedInjected, setSelectedInjected] = useState({});
    // Elective selections: { [courseId]: { lectureId, labId } }
    const [selectedElectives, setSelectedElectives] = useState({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    /* ── Load data ── */
    useEffect(() => {
        if (!studentId) return;
        let cancelled = false;
        async function load() {
            setIsLoading(true);
            setError(null);
            setSubmitSuccess(false);
            try {
                const data = await getRegistrationPlan(studentId);
                if (cancelled) return;
                const opts = data?.enrollmentOptions ?? [];
                setGroups(opts);
                setAcademicInsights(data?.academicInsights ?? []);
                setRawInjectedCourses(aggregateInjectedCourses(opts));
                setRawElectiveCourses(aggregateElectiveCourses(opts));
            } catch (e) {
                if (!cancelled) setError(e?.message || "Failed to load registration options");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [studentId]);


    const selectedGroup = groups.find(g => String(g.classGroupId) === selectedGroupId);
    const mandatoryChoices = mandatoryChoicesByGroup[selectedGroupId] || {};

    /* ── Compute Base Sessions for Conflict Checking ── */
    const baseSessions = useMemo(() => {
        if (!selectedGroup) return [];
        const sessions = buildGroupSessions(selectedGroup, mandatoryChoices, []);
        // Only check conflicts against the group's base lectures, not labs.
        return sessions.filter(s => s.id.startsWith("Lecture-"));
    }, [selectedGroup, mandatoryChoices]);

    /* ── Courses with computed time conflicts ── */
    const electiveCourses = useMemo(() => {
        if (!rawElectiveCourses) return [];
        if (!selectedGroup) return rawElectiveCourses;
        return rawElectiveCourses.map(course => {
            const mapSections = (sections) => sections?.map(sec => {
                const conflictMessage = checkConflictWithBase(sec, baseSessions);
                return { ...sec, hasTimeConflict: !!conflictMessage, conflictMessage };
            }) || [];
            
            const lectureSections = mapSections(course.lectureSections);
            const labSections = mapSections(course.labSections);
            
            const allLecturesConflict = lectureSections.length > 0 && lectureSections.every(s => s.hasTimeConflict);
            const allLabsConflict = labSections.length > 0 && labSections.every(s => s.hasTimeConflict);
            const isFullyConflicted = allLecturesConflict || allLabsConflict;

            return {
                ...course,
                lectureSections,
                labSections,
                isFullyConflicted
            };
        });
    }, [rawElectiveCourses, selectedGroup, baseSessions]);

    const injectedCourses = useMemo(() => {
        if (!rawInjectedCourses) return [];
        if (!selectedGroup) return rawInjectedCourses;
        return rawInjectedCourses.map(course => {
            const mapSections = (sections) => sections?.map(sec => {
                const conflictMessage = checkConflictWithBase(sec, baseSessions);
                return { ...sec, hasTimeConflict: !!conflictMessage, conflictMessage };
            }) || [];
            
            const lectureSections = mapSections(course.lectureSections);
            const labSections = mapSections(course.labSections);
            
            const allLecturesConflict = lectureSections.length > 0 && lectureSections.every(s => s.hasTimeConflict);
            const allLabsConflict = labSections.length > 0 && labSections.every(s => s.hasTimeConflict);
            const isFullyConflicted = allLecturesConflict || allLabsConflict;

            return {
                ...course,
                lectureSections,
                labSections,
                isFullyConflicted
            };
        });
    }, [rawInjectedCourses, selectedGroup, baseSessions]);

    /* ── Build sidebar selections for grid + payload ── */
    const sidebarSelections = useMemo(() => {
        const result = [];
        for (const [cid, ch] of Object.entries(selectedInjected)) {
            const course = injectedCourses.find(c => c.courseId === Number(cid));
            if (!course) continue;
            const lec = ch.lectureId ? course.lectureSections.find(s => s.sectionId === ch.lectureId) : null;
            const lab = ch.labId ? course.labSections.find(s => s.sectionId === ch.labId) : null;
            if (lec || lab) result.push({ course, lectureSection: lec, labSection: lab });
        }
        for (const [cid, ch] of Object.entries(selectedElectives)) {
            const course = electiveCourses.find(c => c.courseId === Number(cid));
            if (!course) continue;
            const lec = ch.lectureId ? course.lectureSections.find(s => s.sectionId === ch.lectureId) : null;
            const lab = ch.labId ? course.labSections.find(s => s.sectionId === ch.labId) : null;
            if (lec || lab) result.push({ course, lectureSection: lec, labSection: lab });
        }
        return result;
    }, [selectedInjected, selectedElectives, injectedCourses, electiveCourses]);

    /* ── Grid sessions ── */
    const sessions = useMemo(
        () => buildGroupSessions(selectedGroup, mandatoryChoices, sidebarSelections),
        [selectedGroup, mandatoryChoices, sidebarSelections]
    );

    /* ── Credit hours tracking ── */
    const mandatoryHours = useMemo(() => {
        const groupToUse = selectedGroup || groups[0];
        if (!groupToUse) return 0;
        const { mandatory } = separateProjectCourses(groupToUse.mandatoryCourses);
        return mandatory.reduce((sum, c) => sum + (c.creditHours || 0), 0);
    }, [selectedGroup, groups]);

    const electiveHours = useMemo(() => {
        return Object.keys(selectedElectives).reduce((sum, cid) => {
            const course = electiveCourses.find(c => c.courseId === Number(cid));
            return sum + (course?.creditHours || 0);
        }, 0);
    }, [selectedElectives, electiveCourses]);

    const injectedHours = useMemo(() => {
        return Object.keys(selectedInjected).reduce((sum, cid) => {
            const course = injectedCourses.find(c => c.courseId === Number(cid));
            return sum + (course?.creditHours || 0);
        }, 0);
    }, [selectedInjected, injectedCourses]);

    const totalSelectedHours = mandatoryHours + electiveHours + injectedHours;
    const remainingHours = Math.max(0, allowedHours - totalSelectedHours);
    const isOverLimit = allowedHours > 0 && totalSelectedHours > allowedHours;

    const hasAnyConflicts = useMemo(() => {
        if (!sessions || sessions.length === 0) return false;
        for (let i = 0; i < sessions.length; i++) {
            for (let j = i + 1; j < sessions.length; j++) {
                const s1 = sessions[i];
                const s2 = sessions[j];
                if (s1.dayIndex === s2.dayIndex) {
                    if (Math.max(s1.startHour, s2.startHour) < Math.min(s1.endHour, s2.endHour)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, [sessions]);

    const canConfirm = Boolean(selectedGroupId) && !isOverLimit && !hasAnyConflicts;

    /* ── Auto-Clean Conflicts on Group Change ── */
    useEffect(() => {
        if (!selectedGroupId) return;

        setSelectedElectives(prev => {
            let changed = false;
            const next = { ...prev };
            for (const [cid, choice] of Object.entries(next)) {
                const course = electiveCourses.find(c => c.courseId === Number(cid));
                if (!course || course.isFullyConflicted) {
                    delete next[cid];
                    changed = true;
                    continue;
                }
                let lecConflict = false;
                let labConflict = false;
                if (choice.lectureId) {
                    const sec = course.lectureSections?.find(s => s.sectionId === choice.lectureId);
                    if (sec?.hasTimeConflict) lecConflict = true;
                }
                if (choice.labId) {
                    const sec = course.labSections?.find(s => s.sectionId === choice.labId);
                    if (sec?.hasTimeConflict) labConflict = true;
                }
                if (lecConflict || labConflict) {
                    const newLec = course.lectureSections?.find(s => !s.hasTimeConflict);
                    const newLab = course.labSections?.find(s => !s.hasTimeConflict);
                    if ((course.lectureSections?.length > 0 && !newLec) || (course.labSections?.length > 0 && !newLab)) {
                        delete next[cid];
                    } else {
                        next[cid] = { lectureId: newLec?.sectionId ?? null, labId: newLab?.sectionId ?? null };
                    }
                    changed = true;
                }
            }
            return changed ? next : prev;
        });

        setSelectedInjected(prev => {
            let changed = false;
            const next = { ...prev };
            for (const [cid, choice] of Object.entries(next)) {
                const course = injectedCourses.find(c => c.courseId === Number(cid));
                if (!course || course.isFullyConflicted) {
                    delete next[cid];
                    changed = true;
                    continue;
                }
                let lecConflict = false;
                let labConflict = false;
                if (choice.lectureId) {
                    const sec = course.lectureSections?.find(s => s.sectionId === choice.lectureId);
                    if (sec?.hasTimeConflict) lecConflict = true;
                }
                if (choice.labId) {
                    const sec = course.labSections?.find(s => s.sectionId === choice.labId);
                    if (sec?.hasTimeConflict) labConflict = true;
                }
                if (lecConflict || labConflict) {
                    const newLec = course.lectureSections?.find(s => !s.hasTimeConflict);
                    const newLab = course.labSections?.find(s => !s.hasTimeConflict);
                    if ((course.lectureSections?.length > 0 && !newLec) || (course.labSections?.length > 0 && !newLab)) {
                        delete next[cid];
                    } else {
                        next[cid] = { lectureId: newLec?.sectionId ?? null, labId: newLab?.sectionId ?? null };
                    }
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [selectedGroupId, electiveCourses, injectedCourses]);

    /* ── Handlers ── */
    function handleGroupSelect(groupId) {
        setSelectedGroupId(String(groupId));
        setOpenGroupId(String(groupId));
        setSubmitError(null);
    }

    function handleMandatorySectionChange(groupId, courseId, type, sectionId) {
        setMandatoryChoicesByGroup(prev => ({
            ...prev,
            [String(groupId)]: {
                ...(prev[String(groupId)] || {}),
                [courseId]: {
                    ...(prev[String(groupId)]?.[courseId] || {}),
                    [type === "lecture" ? "lectureId" : "labId"]: sectionId,
                },
            },
        }));
    }

    function handleInjectedToggle(courseId) {
        setSelectedInjected(prev => {
            const next = { ...prev };
            if (next[courseId]) { delete next[courseId]; return next; }
            // Check if adding this course would exceed allowed hours
            const course = injectedCourses.find(c => c.courseId === courseId);
            if (course && allowedHours > 0) {
                const wouldBe = totalSelectedHours + (course.creditHours || 0);
                if (wouldBe > allowedHours) return prev; // Block
            }
            if (course) {
                const lect = course.lectureSections?.find(s => !s.hasTimeConflict) || course.lectureSections?.[0];
                const lab = course.labSections?.find(s => !s.hasTimeConflict) || course.labSections?.[0];
                next[courseId] = {
                    lectureId: lect?.sectionId ?? null,
                    labId: lab?.sectionId ?? null,
                };
            }
            return next;
        });
    }

    function handleInjectedSectionChange(courseId, type, sectionId) {
        setSelectedInjected(prev => ({
            ...prev,
            [courseId]: {
                ...(prev[courseId] || {}),
                [type === "lecture" ? "lectureId" : "labId"]: sectionId,
            },
        }));
    }

    function handleElectiveToggle(courseId) {
        setSelectedElectives(prev => {
            const next = { ...prev };
            if (next[courseId]) { delete next[courseId]; return next; }
            // Check if adding this course would exceed allowed hours
            const course = electiveCourses.find(c => c.courseId === courseId);
            if (course && allowedHours > 0) {
                const wouldBe = totalSelectedHours + (course.creditHours || 0);
                if (wouldBe > allowedHours) return prev; // Block
            }
            if (course) {
                const lect = course.lectureSections?.find(s => !s.hasTimeConflict) || course.lectureSections?.[0];
                const lab = course.labSections?.find(s => !s.hasTimeConflict) || course.labSections?.[0];
                next[courseId] = {
                    lectureId: lect?.sectionId ?? null,
                    labId: lab?.sectionId ?? null,
                };
            }
            return next;
        });
    }

    function handleElectiveSectionChange(courseId, type, sectionId) {
        setSelectedElectives(prev => ({
            ...prev,
            [courseId]: {
                ...(prev[courseId] || {}),
                [type === "lecture" ? "lectureId" : "labId"]: sectionId,
            },
        }));
    }

    async function handleConfirm() {
        if (!selectedGroup) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const timetableRes = await fetchStudentTimetable(studentId);
            const existing = timetableRes.data?.enrollments ?? [];
            if (existing.length > 0) {
                const ids = existing.map(e => e.enrollmentId).filter(Boolean);
                if (ids.length > 0) await dropCoursesApi(ids);
            }
            const payload = buildPayload(studentId, selectedGroup, mandatoryChoices, sidebarSelections);
            const result = await applyBulkEnrollment(payload);  
            setSubmitSuccess(true);
        } catch (e) {
            setSubmitError(e?.response?.data?.message || e?.message || "Enrollment failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        studentId, isInitializing, isLoading, error,
        groups, academicInsights,
        injectedCourses, electiveCourses,
        allowedHours, mandatoryHours, electiveHours, injectedHours,
        totalSelectedHours, remainingHours, isOverLimit, hasAnyConflicts,
        openGroupId, setOpenGroupId,
        selectedGroupId, selectedGroup, sidebarSelections,
        mandatoryChoicesByGroup, selectedInjected, selectedElectives,
        isSubmitting, submitSuccess, submitError, canConfirm,
        handleGroupSelect, handleMandatorySectionChange,
        handleInjectedToggle, handleInjectedSectionChange,
        handleElectiveToggle, handleElectiveSectionChange,
        handleConfirm,
    };
}
