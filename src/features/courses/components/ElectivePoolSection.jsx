import React, { useState } from "react";
import { ChevronDown, ChevronUp, BookOpenCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import CourseCard from "./CourseCard";

export default function ElectivePoolSection({ poolData, level, onEdit, onToggle }) {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    const [isOpen, setIsOpen] = useState(false);

    if (!poolData.courses || poolData.courses.length === 0) return null;

    const groupName = isAr ? (poolData.groupNameAr || poolData.groupName) : poolData.groupName;
    const courseType = isAr ? (poolData.courseTypeAr || poolData.courseType) : poolData.courseType;

    return (
        <div className="mb-4 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <BookOpenCheck className="h-4 w-4" />
                    </div>
                    <div className="text-start">
                        <span className="font-semibold text-slate-800 block">{groupName}</span>
                        <span className="text-xs text-slate-400 font-medium">{courseType}</span>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
            </button>

            {isOpen && (
                <div className="p-5 border-t border-slate-100">
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                        {poolData.courses.map(course => {
                            // Enrich with pool & level context so Edit modal can pre-fill all fields
                            const enriched = {
                                ...course,
                                courseCode: course.courseCode ?? course.code,
                                courseName: course.courseName ?? course.name,
                                courseNameAr: course.courseNameAr ?? course.nameAr,
                                courseType: course.courseType ?? course.type ?? poolData.courseType,
                                level: course.level ?? level,
                                semester: course.semester ?? 0,
                                isElective: true,
                                electiveGroup: course.electiveGroup ?? poolData.groupName,
                            };
                            return (
                                <CourseCard
                                    key={enriched.courseCode}
                                    course={enriched}
                                    onEdit={onEdit}
                                    onToggle={onToggle}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
