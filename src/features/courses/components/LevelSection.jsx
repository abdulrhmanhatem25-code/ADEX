import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import SemesterSection from "./SemesterSection";

export default function LevelSection({ levelData, onEdit, onToggle }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const hasSemesters = levelData.semesters && levelData.semesters.length > 0;

    if (!hasSemesters) return null;

    return (
        <div className="mb-4 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        L{levelData.level}
                    </div>
                    <span className="font-semibold text-slate-800">{t("courses.level")} {levelData.level}</span>
                </div>
                {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
            </button>
            
            {isOpen && (
                <div className="p-5 border-t border-slate-100">
                    {hasSemesters && levelData.semesters.map(sem => (
                        <SemesterSection
                            key={sem.semester}
                            semesterData={sem}
                            level={levelData.level}
                            onEdit={onEdit}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
