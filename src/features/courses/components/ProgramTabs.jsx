import React from "react";
import { BookOpen, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProgramTabs({ programs, activeTab, onChange }) {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <button
                onClick={() => onChange("all")}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border
                    ${activeTab === "all"
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-200"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
            >
                <Layers className="h-4 w-4" />
                <span>{t("courses.allCourses")}</span>
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1 flex-shrink-0"></div>

            {programs.map((program) => {
                const isActive = activeTab === program.programId;
                const programName = isAr ? (program.programNameAr || program.programName) : program.programName;
                
                return (
                    <button
                        key={program.programId}
                        onClick={() => onChange(program.programId)}
                        className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border
                            ${isActive
                                ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-200"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                    >
                        <BookOpen className="h-4 w-4" />
                        <span>{program.programCode} ({programName})</span>
                    </button>
                );
            })}
        </div>
    );
}
