import React, { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchProgramCoursesApi, toggleCourseApi } from "@/shared/services/coursesApi";
import toast from "@/shared/lib/toast";
import LevelSection from "./LevelSection";
import ElectivePoolSection from "./ElectivePoolSection";

export default function ProgramView({ programId, onAdd, onEdit }) {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetchProgramCoursesApi(programId);
            const payload = res.data?.value || res.data?._value || res.data;
            setData(payload);
        } catch (err) {
            console.error("Failed to load program courses:", err);
            setError(t("courses.loadingError") || "Failed to load program courses.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (programId) {
            loadData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [programId]);

    const handleToggle = async (courseCode) => {
        try {
            const res = await toggleCourseApi(courseCode);
            const defaultMsg = t("courses.success", "Operation successful");
            toast.success(res?.message || res?.data?.message || (res?.status === 204 ? defaultMsg : defaultMsg));
            loadData();
        } catch (err) {
            // Error toast handled globally
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>{t("courses.loading")}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-red-400">
                <p>{error}</p>
                <button onClick={loadData} className="mt-4 text-indigo-500 hover:underline">{t("courses.retry", "Retry")}</button>
            </div>
        );
    }

    if (!data || !data.levels || data.levels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">{t("courses.noCourses")}</h3>
                <button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                    {t("courses.add")}
                </button>
            </div>
        );
    }

    const programName = isAr ? (data.programNameAr || data.programName) : data.programName;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{programName}</h2>
                    <p className="text-sm text-slate-500">{t("courses.subtitle")}</p>
                </div>
                <button onClick={onAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("courses.add")}</span>
                </button>
            </div>

            <div className="space-y-4">
                {data.levels.map(level => (
                    <LevelSection
                        key={level.level}
                        levelData={level}
                        onEdit={onEdit}
                        onToggle={handleToggle}
                    />
                ))}

                {data.levels.flatMap(l =>
                    (l.electivePools || []).map((pool, idx) => (
                        <ElectivePoolSection
                            key={pool.groupName + idx}
                            poolData={pool}
                            level={l.level}
                            onEdit={onEdit}
                            onToggle={handleToggle}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
