import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { GraduationCap, CheckCircle2, Loader2, AlertCircle, AlertTriangle, Info, Syringe, BookOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import AdexButton from "@/shared/ui/AdexButton";
import { useAcademicRegistration } from "../hooks/useAcademicRegistration";
import GroupCard from "../components/GroupCard";
import ElectivePanel from "../components/ElectivePanel";
import InjectedCoursesPanel from "../components/InjectedCoursesPanel";
import RatingModal from "../components/RatingModal";
import toast from "@/shared/lib/toast";

const SEVERITY_STYLES = {
    Warning: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", icon: AlertTriangle },
    Error: { border: "border-red-200", bg: "bg-red-50", text: "text-red-700", icon: AlertCircle },
    Info: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", icon: Info },
};

export default function AcademicRegistration() {
    const { t, i18n } = useTranslation();
    const {
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
    } = useAcademicRegistration();

    const [showRating, setShowRating] = useState(false);
    const [ratingDismissed, setRatingDismissed] = useState(false);

    // Show rating modal when enrollment succeeds
    React.useEffect(() => {
        if (submitSuccess && !ratingDismissed) {
            setShowRating(true);
        }
    }, [submitSuccess, ratingDismissed]);

    // Track conflict changes to show a toast
    const prevHasConflicts = React.useRef(false);
    React.useEffect(() => {
        if (!prevHasConflicts.current && hasAnyConflicts) {
            toast.error(
                i18n.language === 'ar'
                    ? "يوجد تعارض في مواعيد بعض المواد، يرجى اختيار مواعيد بديلة."
                    : "Schedule conflict detected. Please select an alternative time."
            );
        }
        prevHasConflicts.current = hasAnyConflicts;
    }, [hasAnyConflicts, i18n.language]);

    if (submitSuccess && ratingDismissed) {
        return (
            <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                <h2 className="text-xl font-extrabold text-slate-900">Enrollment Confirmed!</h2>
                <p className="text-sm text-slate-400 text-center">
                    You have been successfully enrolled in {selectedGroup?.classGroupName}.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-screen-xl mx-auto">
            <div className="mb-3">
                <h1 className="text-lg font-extrabold text-slate-900">Academic Registration</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Select your preferred group and elective courses.
                    {/* {studentId && <span className="ml-2 text-xs font-mono text-slate-300">ID: {studentId}</span>} */}
                </p>
            </div>

            {/* Error alerts */}
            {!studentId && !isInitializing && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 mb-4">
                    <AlertCircle className="inline w-4 h-4 mr-1" />
                    Could not identify student. Please log in or open this page with a valid student ID.
                </div>
            )}
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 mb-4">
                    <AlertCircle className="inline w-4 h-4 mr-1" /> {error}
                </div>
            )}

            {/* Academic Insights */}
            {academicInsights.length > 0 && (
                <div className="space-y-2 mb-5">
                    {academicInsights.map((insight, i) => {
                        const s = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.Info;
                        const Icon = s.icon;
                        return (
                            <div key={i} dir="rtl" className={cn("rounded-2xl border p-4", s.border, s.bg)}>
                                <div className="flex items-start gap-2">
                                    <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", s.text)} />
                                    <div>
                                        <p className={cn("text-sm font-bold", s.text)}>{insight.title}</p>
                                        <p className={cn("text-xs mt-0.5 leading-relaxed", s.text)}>{insight.message}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Persistent Conflict Alert */}
            {hasAnyConflicts && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-5 flex items-start gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-extrabold">
                            {i18n.language === 'ar' ? 'تعارض في المواعيد' : 'Schedule Conflict'}
                        </p>
                        <p className="text-xs mt-0.5 opacity-90">
                            {i18n.language === 'ar'
                                ? 'يوجد تعارض في مواعيد بعض المواد التي قمت باختيارها. يرجى مراجعة المواد المحددة باللون الأحمر واختيار سكاشن أخرى لحل التعارض.'
                                : 'There is a scheduling conflict with some of your selected courses. Please review the highlighted courses and select different sections to resolve the conflict.'}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
                {/* ── Left: Group list ── */}
                <div className="space-y-4">
                    {isInitializing || isLoading ? (
                        <div className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white p-6 text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Loading enrollment options…</span>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="rounded-3xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
                            No enrollment options found for this student.
                        </div>
                    ) : (
                        groups.map(group => {
                            const gId = String(group.classGroupId);
                            return (
                                <GroupCard
                                    key={gId}
                                    group={group}
                                    isOpen={openGroupId === gId}
                                    isSelected={selectedGroupId === gId}
                                    mandatoryChoices={mandatoryChoicesByGroup[gId] || {}}
                                    sidebarSelections={sidebarSelections}
                                    onToggle={open => setOpenGroupId(open ? gId : null)}
                                    onSelect={() => handleGroupSelect(group.classGroupId)}
                                    onSectionChange={(courseId, type, secId) =>
                                        handleMandatorySectionChange(gId, courseId, type, secId)
                                    }
                                />
                            );
                        })
                    )}
                </div>

                {/* ── Right: Credit Hours + Electives + Injected + Confirm ── */}
                <div className="space-y-4">
                    {/* Credit hours tracker */}
                    {allowedHours > 0 && (
                        <div className="rounded-2xl border border-slate-100 bg-white p-4">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-extrabold text-slate-900">Credit Hours</p>
                                    <p className="text-[11px] text-slate-400">
                                        {totalSelectedHours} / {allowedHours} hours used
                                    </p>
                                </div>
                                <span className={cn(
                                    "text-lg font-extrabold tabular-nums",
                                    isOverLimit ? "text-red-500" : remainingHours === 0 ? "text-emerald-500" : "text-slate-700"
                                )}>
                                    {remainingHours}
                                </span>
                            </div>
                            {/* Progress bar */}
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-300",
                                        isOverLimit ? "bg-red-400" : totalSelectedHours >= allowedHours ? "bg-emerald-400" : "bg-indigo-400"
                                    )}
                                    style={{ width: `${Math.min(100, (totalSelectedHours / allowedHours) * 100)}%` }}
                                />
                            </div>
                            {/* Hours breakdown */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                {mandatoryHours > 0 && (
                                    <span className="text-[11px] text-blue-600 font-semibold">
                                        Mandatory: {mandatoryHours}h
                                    </span>
                                )}
                                {electiveHours > 0 && (
                                    <span className="text-[11px] text-indigo-600 font-semibold">
                                        Elective: {electiveHours}h
                                    </span>
                                )}
                                {injectedHours > 0 && (
                                    <span className="text-[11px] text-amber-600 font-semibold">
                                        Additional: {injectedHours}h
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Elective selection */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-extrabold text-slate-900">Elective Courses</p>
                                <p className="text-[11px] text-slate-400">Choose based on your interest.</p>
                            </div>
                        </div>
                        {!selectedGroupId ? (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center">
                                <p className="text-sm text-slate-500 font-medium">
                                    {i18n.language === 'ar' ? 'الرجاء اختيار مجموعة أولاً لتتمكن من اختيار المواد الاختيارية.' : 'Please select a group first to choose elective courses.'}
                                </p>
                            </div>
                        ) : isLoading ? (
                            <p className="text-sm text-slate-400">Loading…</p>
                        ) : (
                            <ElectivePanel
                                electiveCourses={electiveCourses}
                                remainingHours={remainingHours}
                                totalSelectedHours={totalSelectedHours}
                                allowedHours={allowedHours}
                                selectedSections={selectedElectives}
                                onToggle={handleElectiveToggle}
                                onSectionChange={handleElectiveSectionChange}
                            />
                        )}
                    </div>

                    {/* Injected mandatory + Project courses */}
                    {injectedCourses.length > 0 && (
                        <div className="rounded-2xl border border-slate-100 bg-white p-4">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                                    <Syringe className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold text-slate-900">Additional Courses</p>
                                    <p className="text-[11px] text-slate-400">Injected & project courses.</p>
                                </div>
                            </div>
                            {!selectedGroupId ? (
                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center">
                                    <p className="text-sm text-slate-500 font-medium">
                                        {i18n.language === 'ar' ? 'الرجاء اختيار مجموعة أولاً لتتمكن من اختيار المواد الإضافية.' : 'Please select a group first to choose additional courses.'}
                                    </p>
                                </div>
                            ) : (
                                <InjectedCoursesPanel
                                    courses={injectedCourses}
                                    selectedSections={selectedInjected}
                                    onToggle={handleInjectedToggle}
                                    onSectionChange={handleInjectedSectionChange}
                                />
                            )}
                        </div>
                    )}

                    {/* Confirm card */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2.5">
                        {selectedGroup && (
                            <div className="rounded-2xl bg-slate-50 px-4 py-3 space-y-1">
                                <p className="text-xs font-bold text-slate-600">Selected Group</p>
                                <p className="text-sm font-extrabold text-slate-900">{selectedGroup.classGroupName}</p>
                                <p className="text-xs text-slate-400">
                                    {selectedGroup.mandatoryCourses?.length} mandatory courses · {mandatoryHours}h
                                </p>
                                {Object.keys(selectedElectives).length > 0 && (
                                    <p className="text-xs text-emerald-500 font-semibold">
                                        + {Object.keys(selectedElectives).length} elective{Object.keys(selectedElectives).length !== 1 ? "s" : ""} · {electiveHours}h
                                    </p>
                                )}
                                {Object.keys(selectedInjected).length > 0 && (
                                    <p className="text-xs text-amber-500 font-semibold">
                                        + {Object.keys(selectedInjected).length} additional course{Object.keys(selectedInjected).length !== 1 ? "s" : ""} · {injectedHours}h
                                    </p>
                                )}
                                <p className="text-xs font-bold text-slate-700 pt-1 border-t border-slate-200 mt-1">
                                    Total: {totalSelectedHours} / {allowedHours} credit hours
                                </p>
                            </div>
                        )}

                        {submitError && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                                <AlertCircle className="inline w-3.5 h-3.5 mr-1" /> {submitError}
                            </div>
                        )}

                        <AdexButton
                            variant="grey"
                            disabled={!canConfirm || isSubmitting}
                            className={cn(
                                "w-full rounded-2xl font-extrabold",
                                canConfirm && !isSubmitting ? "opacity-100" : "opacity-50"
                            )}
                            onClick={handleConfirm}
                        >
                            {isSubmitting
                                ? <><Loader2 className="inline w-4 h-4 mr-2 animate-spin" />Enrolling…</>
                                : "Confirm Enrollment"
                            }
                        </AdexButton>

                        <p className={cn("text-xs text-center", canConfirm ? "text-slate-400" : "text-amber-400")}>
                            {!selectedGroupId
                                ? "Please select a group to continue"
                                : isOverLimit
                                    ? `Exceeding allowed hours by ${totalSelectedHours - allowedHours}h — remove some courses`
                                    : hasAnyConflicts
                                        ? "One or more selected courses have time conflicts"
                                        : "Ready to confirm"
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Rating Modal — shown right after enrollment success */}
            <RatingModal
                open={showRating}
                onOpenChange={(val) => {
                    setShowRating(val);
                    if (!val) setRatingDismissed(true);
                }}
                studentId={studentId}
            />
        </div>
    );
}
