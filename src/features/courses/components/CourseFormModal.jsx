import React, { useState, useEffect } from "react";
import { Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { bulkImportCoursesApi, updateCourseApi, fetchPrereqsApi } from "@/shared/services/coursesApi";
import FormModal from "@/shared/components/FormModal";
import CourseTagInput from "@/shared/components/CourseTagInput";
import toast from "@/shared/lib/toast";
function ProgramSelector({ selectedIds, onChange, options }) {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(opt => {
                const isSelected = selectedIds.includes(opt.programId);
                return (
                    <button
                        key={opt.programId}
                        type="button"
                        onClick={() => {
                            if (isSelected) {
                                // Prevent unselecting if it's the last one
                                if (selectedIds.length > 1) {
                                    onChange(selectedIds.filter(id => id !== opt.programId));
                                }
                            } else {
                                onChange([...selectedIds, opt.programId]);
                            }
                        }}
                        className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border
                            ${isSelected
                                ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-200"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                    >
                        {isAr ? (opt.programNameAr || opt.programName) : opt.programName}
                    </button>
                );
            })}
        </div>
    );
}

function ToggleField({ label, description, checked, onChange }) {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>
            <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-1.5 flex-shrink-0">
                {checked
                    ? <><ToggleRight className="h-7 w-7 text-indigo-500" /><span className="text-indigo-600 text-xs font-semibold">{t("courses.on", "On")}</span></>
                    : <><ToggleLeft className="h-7 w-7 text-slate-400" /><span className="text-slate-400 text-xs font-semibold">{t("courses.off", "Off")}</span></>
                }
            </button>
        </div>
    );
}

export default function CourseFormModal({ open, onClose, onSuccess, courseToEdit, activeTab, programs = [] }) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const isEditing = !!courseToEdit;

    const getDefaultProgramIds = () => {
        if (activeTab !== "all") return [Number(activeTab)];
        if (programs.length > 0) return [programs[0].programId];
        return [];
    };

    const EMPTY_FORM = {
        programIds: getDefaultProgramIds(),
        courseCode: "", courseName: "", courseNameAr: "",
        creditHours: "", level: "", semester: "",
        isElective: false, electiveGroup: "",
        courseType: "",
        isOnline: false, hasLab: false, isArabic: false,
        lectureDurationMinutes: "", labDurationMinutes: "",
    };

    const [form, setForm] = useState(EMPTY_FORM);
    const [prerequisites, setPrerequisites] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingPrereqs, setIsLoadingPrereqs] = useState(false);

    useEffect(() => {
        if (!open) {
            // Reset immediately when modal closes so next open is always clean
            setForm({ ...EMPTY_FORM, programIds: getDefaultProgramIds() });
            setPrerequisites([]);
            setDependencies([]);
            return;
        }

        if (isEditing && courseToEdit) {
            const code = courseToEdit.courseCode ?? courseToEdit.code;
            setForm({
                programIds: courseToEdit.programIds?.length > 0 ? courseToEdit.programIds : getDefaultProgramIds(),
                courseCode: code ?? "",
                courseName: courseToEdit.courseName ?? courseToEdit.name ?? "",
                courseNameAr: courseToEdit.courseNameAr ?? courseToEdit.nameAr ?? "",
                creditHours: String(courseToEdit.creditHours ?? courseToEdit.credits ?? ""),
                level: String(courseToEdit.level ?? ""),
                semester: String(courseToEdit.semester ?? ""),
                isElective: courseToEdit.isElective ?? false,
                electiveGroup: courseToEdit.electiveGroup ?? "",
                // courseType may come as "type" from ProgramCourses API
                courseType: courseToEdit.courseType ?? courseToEdit.type ?? "",
                isOnline: courseToEdit.isOnline ?? false,
                hasLab: courseToEdit.hasLab ?? false,
                isArabic: courseToEdit.isArabic ?? false,
                lectureDurationMinutes: String(courseToEdit.lectureDurationMinutes ?? ""),
                labDurationMinutes: String(courseToEdit.labDurationMinutes ?? ""),
            });

            const prereqs = courseToEdit.prerequisites ?? [];
            const deps = courseToEdit.dependencies ?? [];
            setPrerequisites(prereqs.map(p => (typeof p === "string" ? p : (p.courseCode ?? p.code ?? p))));
            setDependencies(deps.map(d => (typeof d === "string" ? d : (d.courseCode ?? d.code ?? d))));

            if (code) {
                setIsLoadingPrereqs(true);
                fetchPrereqsApi(code)
                    .then(res => {
                        const data = res.data || {};

                        const prereqs = data.prerequisites ?? [];
                        setPrerequisites(prereqs.map(p => (typeof p === "string" ? p : (p.courseCode ?? p.code ?? p))));

                        const deps = data.dependencies ?? [];
                        setDependencies(deps.map(d => (typeof d === "string" ? d : (d.courseCode ?? d.code ?? d))));
                    })
                    .catch(() => { })
                    .finally(() => setIsLoadingPrereqs(false));
            }
        } else {
            // Add mode — always start with a clean empty form
            setForm({ ...EMPTY_FORM, programIds: getDefaultProgramIds() });
            setPrerequisites([]);
            setDependencies([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, courseToEdit]);

    // Helpers to reduce boilerplate
    const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));
    const setInput = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const courseEntry = {
                courseId: isEditing ? (courseToEdit.courseId ?? courseToEdit.id ?? 0) : 0,
                courseCode: form.courseCode,
                courseName: form.courseName,
                courseNameAr: form.courseNameAr,
                creditHours: Number(form.creditHours) || 0,
                level: Number(form.level) || 0,
                semester: Number(form.semester) || 0,
                isElective: form.isElective,
                electiveGroup: form.isElective ? form.electiveGroup : null,
                courseType: form.courseType || null,
                isOnline: form.isOnline,
                hasLab: form.hasLab,
                isArabic: form.isArabic,
                lectureDurationMinutes: Number(form.lectureDurationMinutes) || 0,
                labDurationMinutes: form.hasLab ? (Number(form.labDurationMinutes) || 0) : 0,
                prerequisites,
                dependencies,
            };

            const payload = { programIds: form.programIds, courses: [courseEntry] };

            if (isEditing) {
                const res = await updateCourseApi(payload);
                const defaultMsg = isRtl ? "تم تعديل الكورس بنجاح" : "Course updated successfully";
                toast.success(res?.data?.message || res?.message || defaultMsg);
            } else {
                const res = await bulkImportCoursesApi(payload);
                toast.success(res?.data?.message || res?.message);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            // Error toast handled globally by api.js
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={isEditing ? t("courses.edit") : t("courses.add")}
            onSave={handleSave}
            isSaving={isSaving}
            saveLabel={isEditing ? t("courses.save") : t("courses.add")}
            maxWidth="max-w-2xl"
        >
            {/* Program Selector (Only in 'all' view) */}
            {activeTab === "all" && programs.length > 0 && (
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("courses.program")}</label>
                    <ProgramSelector
                        selectedIds={form.programIds}
                        onChange={set("programIds")}
                        options={programs}
                    />
                </div>
            )}

            {/* Course Names (EN + AR) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="course-name" className="text-xs font-semibold text-slate-500">{t("courses.courseName")}</label>
                    <input id="course-name" name="courseName" value={form.courseName} onChange={setInput("courseName")} placeholder="ex: Algorithms"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="course-name-ar" className="text-xs font-semibold text-slate-500">{t("courses.courseNameAr")}</label>
                    <input id="course-name-ar" name="courseNameAr" value={form.courseNameAr} onChange={setInput("courseNameAr")} placeholder="مثال: الخوارزميات" dir="rtl"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                </div>
            </div>

            {/* Code + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="course-code" className="text-xs font-semibold text-slate-500">{t("courses.courseCode")}</label>
                    <input id="course-code" name="courseCode" value={form.courseCode} onChange={setInput("courseCode")} placeholder="ex: CS301"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="course-type" className="text-xs font-semibold text-slate-500">{t("courses.courseType")}</label>
                    <input id="course-type" name="courseType" value={form.courseType} onChange={setInput("courseType")} placeholder={t("courses.courseTypePlaceholder")}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                </div>
            </div>

            {/* Credit Hours + Level + Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="course-credits" className="text-xs font-semibold text-slate-500">{t("courses.creditHours")}</label>
                    <input id="course-credits" name="creditHours" type="number" min={0} value={form.creditHours} onChange={e => setForm(f => ({ ...f, creditHours: Math.max(0, e.target.value) }))} placeholder="3"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="course-level" className="text-xs font-semibold text-slate-500">{t("courses.level")}</label>
                    <input id="course-level" name="level" type="number" min={0} max={4} value={form.level} onChange={setInput("level")} placeholder="ex: 1"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="course-semester" className="text-xs font-semibold text-slate-500">{t("courses.semester")}</label>
                    <input id="course-semester" name="semester" type="number" min={0} max={2} value={form.semester} onChange={setInput("semester")} placeholder="1 or 2"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                </div>
            </div>

            {/* Lecture Duration + Lab Duration (conditional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="course-lecture-duration" className="text-xs font-semibold text-slate-500">{t("courses.lectureDuration")}</label>
                    <input id="course-lecture-duration" name="lectureDurationMinutes" type="number" min={0} value={form.lectureDurationMinutes} onChange={setInput("lectureDurationMinutes")} placeholder="ex: 90"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                </div>
                {form.hasLab && (
                    <div className="space-y-1.5">
                        <label htmlFor="course-lab-duration" className="text-xs font-semibold text-slate-500">{t("courses.labDuration")}</label>
                        <input id="course-lab-duration" name="labDurationMinutes" type="number" min={0} value={form.labDurationMinutes} onChange={setInput("labDurationMinutes")} placeholder="ex: 120"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                )}
            </div>

            {/* Boolean Toggles: isOnline / hasLab / isArabic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ToggleField label={t("courses.isOnline")} description={t("courses.isOnlineDesc")} checked={form.isOnline} onChange={set("isOnline")} />
                <ToggleField label={t("courses.hasLab")} description={t("courses.hasLabDesc")} checked={form.hasLab} onChange={set("hasLab")} />
                <ToggleField label={t("courses.isArabic")} description={t("courses.isArabicDesc")} checked={form.isArabic} onChange={set("isArabic")} />
            </div>

            {/* Elective Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-700">{t("courses.elective")}</p>
                <button type="button" onClick={() => setForm(f => ({ ...f, isElective: !f.isElective, electiveGroup: "" }))} className="flex items-center gap-2 text-sm font-semibold">
                    {form.isElective ? (
                        <><ToggleRight className="h-7 w-7 text-indigo-500" /><span className="text-indigo-600">{t("courses.elective")}</span></>
                    ) : (
                        <><ToggleLeft className="h-7 w-7 text-slate-400" /><span className="text-slate-500">{t("courses.notElective")}</span></>
                    )}
                </button>
            </div>

            {form.isElective && (
                <div className="space-y-1.5">
                    <label htmlFor="course-elective-group" className="text-xs font-semibold text-slate-500">{t("courses.electiveGroup")} <span className="text-red-400">*</span></label>
                    <input id="course-elective-group" name="electiveGroup" value={form.electiveGroup} onChange={setInput("electiveGroup")} placeholder="ex: Elective 1"
                        className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                </div>
            )}

            {/* Prerequisites */}
            <div className="space-y-1.5">
                <label htmlFor="course-tag-input" className="text-xs font-semibold text-slate-500">{t("courses.prerequisites")}</label>
                {isLoadingPrereqs ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm py-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("app.loading")}</div>
                ) : (
                    <CourseTagInput
                        tags={prerequisites}
                        onAdd={code => setPrerequisites(p => [...p, code])}
                        onRemove={code => setPrerequisites(p => p.filter(c => c !== code))}
                        placeholder={t("courses.searchPlaceholder")}
                        emptyText={t("courses.noPrerequisites", "No prerequisites added")}
                        addLabel={t("courses.add")}
                    />
                )}
            </div>

            {/* Dependencies */}
            <div className="space-y-1.5">
                <label htmlFor="course-tag-input" className="text-xs font-semibold text-slate-500">{t("courses.dependencies")}</label>
                {isLoadingPrereqs ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm py-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("app.loading")}</div>
                ) : (
                    <CourseTagInput
                        tags={dependencies}
                        onAdd={code => setDependencies(d => [...d, code])}
                        onRemove={code => setDependencies(d => d.filter(c => c !== code))}
                        placeholder={t("courses.searchPlaceholder")}
                        emptyText={t("courses.noDependencies", "No dependencies added")}
                        addLabel={t("courses.add")}
                    />
                )}
            </div>
        </FormModal>
    );
}
