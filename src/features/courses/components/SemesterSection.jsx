import React from "react";
import { useTranslation } from "react-i18next";
import CourseCard from "./CourseCard";

export default function SemesterSection({ semesterData, level, onEdit, onToggle }) {
    const { t } = useTranslation();
    if (!semesterData.courses || semesterData.courses.length === 0) return null;

    return (
        <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 pl-1 border-l-4 border-indigo-400">
                {t("courses.semester")} {semesterData.semester}
            </h4>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                {semesterData.courses.map(course => {
                    // Enrich with parent-level context so Edit modal can pre-fill level & semester
                    const enriched = {
                        ...course,
                        courseCode: course.courseCode ?? course.code,
                        courseName: course.courseName ?? course.name,
                        courseNameAr: course.courseNameAr ?? course.nameAr,
                        courseType: course.courseType ?? course.type,
                        level: course.level ?? level,
                        semester: course.semester ?? semesterData.semester,
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
    );
}
