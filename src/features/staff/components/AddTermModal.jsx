import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import FormModal from "@/shared/components/FormModal";

const SEMESTER_TYPES = [
    { key: "Fall", en: "Fall", ar: "خريف" },
    { key: "Spring", en: "Spring", ar: "ربيع" },
    { key: "Summer", en: "Summer", ar: "صيفي" }
];

/**
 * Modal for adding a new semester / term.
 * Props: open, onClose, onAdd(body) → async
 */
export default function AddTermModal({ open, onClose, onAdd }) {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    const [form, setForm] = useState({ semesterName: "", semesterNameAr: "", typeKey: "" });
    const [isSaving, setIsSaving] = useState(false);

    const reset = () => { setForm({ semesterName: "", semesterNameAr: "", typeKey: "" }); };

    const handleClose = () => { reset(); onClose(); };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const selectedType = SEMESTER_TYPES.find(x => x.key === form.typeKey) || SEMESTER_TYPES[0];
            await onAdd({ 
                semesterName: form.semesterName.trim(),
                semesterNameAr: form.semesterNameAr.trim(),
                semesterType: selectedType.en,
                semesterTypeAr: selectedType.ar
            });
            handleClose();
        } catch (err) {
            // Error toast handled globally by api.js
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FormModal
            open={open}
            onClose={handleClose}
            title={t("staff.addNewTerm", "Add New Term")}
            onSave={handleSave}
            isSaving={isSaving}
            saveLabel={t("staff.addTermBtn", "Add Term")}
        >
            {/* Semester Type */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">{t("staff.semesterType", "Semester Type")}</label>
                <div className="flex gap-2">
                    {SEMESTER_TYPES.map((typeObj) => (
                        <button
                            key={typeObj.key}
                            type="button"
                            onClick={() => setForm({ ...form, typeKey: typeObj.key })}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all
                                ${form.typeKey === typeObj.key
                                    ? "bg-staff-add-btn-bg border-staff-add-btn-bg text-staff-add-btn-text shadow-md"
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            {isAr ? typeObj.ar : typeObj.en}
                        </button>
                    ))}
                </div>
            </div>

            {/* Semester Name */}
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="term-name-en" className="text-xs font-semibold text-slate-500">{t("staff.termNameEn", "Term Name (English)")}</label>
                    <input
                        id="term-name-en"
                        name="semesterName"
                        value={form.semesterName}
                        onChange={(e) => setForm({ ...form, semesterName: e.target.value })}
                        placeholder={t("staff.termNameEnPh", "e.g. Fall 2026")}
                        className={`w-full border border-slate-200 rounded-xl ${isAr ? "pr-4 pl-4" : "px-4"} py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring transition`}
                        dir="ltr"
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="term-name-ar" className="text-xs font-semibold text-slate-500">{t("staff.termNameAr", "Term Name (Arabic)")}</label>
                    <input
                        id="term-name-ar"
                        name="semesterNameAr"
                        value={form.semesterNameAr}
                        onChange={(e) => setForm({ ...form, semesterNameAr: e.target.value })}
                        placeholder={t("staff.termNameArPh", "مثال: خريف ٢٠٢٦")}
                        className={`w-full border border-slate-200 rounded-xl ${isAr ? "pr-4 pl-4" : "px-4"} py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring transition`}
                        dir="rtl"
                    />
                </div>
            </div>
        </FormModal>
    );
}
