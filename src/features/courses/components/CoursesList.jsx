import React from "react";
import { useTranslation } from "react-i18next";
import { fetchCoursesApi, toggleCourseApi } from "@/shared/services/coursesApi";
import useListPage from "@/shared/hooks/useListPage";
import toast from "@/shared/lib/toast";
import DataListLayout from "@/shared/components/DataListLayout";
import CourseCard from "./CourseCard";

export default function CoursesList({ onAdd, onEdit }) {
    const { t } = useTranslation();
    const list = useListPage({ fetchFn: fetchCoursesApi, limit: 6 });

    const SORT_OPTIONS = [
        { label: t("courses.courseName"), value: "courseName" },
        { label: t("courses.creditHours"), value: "creditHours" },
        { label: t("courses.level"), value: "level" },
    ];

    const handleToggle = async (courseCode) => {
        try {
            const res = await toggleCourseApi(courseCode);
            const defaultMsg = t("courses.success", "Operation successful");
            toast.success(res?.message || res?.data?.message || (res?.status === 204 ? defaultMsg : defaultMsg));
            list.updateItem(
                c => (c.courseCode ?? c.code) === courseCode,
                c => ({ ...c, isActive: !c.isActive })
            );
        } catch (err) {
            // Error toast handled globally
        }
    };

    const renderItem = (course) => (
        <CourseCard
            key={course.courseId ?? course.id ?? course.courseCode}
            course={course}
            onEdit={onEdit}
            onToggle={handleToggle}
        />
    );

    return (
        <DataListLayout
            title={t("courses.allCourses")}
            subtitle={t("courses.subtitle")}
            list={list}
            sortOptions={SORT_OPTIONS}
            onAdd={onAdd}
            addLabel={t("courses.add")}
            emptyMessage={t("courses.noCourses")}
            loadingMessage={t("courses.loading")}
            renderItem={renderItem}
            searchPlaceholder={t("courses.searchPlaceholder")}
        />
    );
}
