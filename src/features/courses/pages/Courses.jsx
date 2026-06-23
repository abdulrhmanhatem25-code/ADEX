import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fetchProgramsApi } from "@/shared/services/coursesApi";
import CoursesList from "../components/CoursesList";
import ProgramTabs from "../components/ProgramTabs";
import ProgramView from "../components/ProgramView";
import CourseFormModal from "../components/CourseFormModal";

export default function Courses() {
    const { t } = useTranslation();
    const [programs, setPrograms] = useState([]);
    const [activeTab, setActiveTab] = useState("all");

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);

    // List Refresher (to trigger reload from top level if needed)
    const [listKey, setListKey] = useState(0);

    useEffect(() => {
        const loadPrograms = async () => {
            try {
                const res = await fetchProgramsApi();
                setPrograms(res.data || []);
            } catch (err) {
                console.error("Failed to fetch programs:", err);
            }
        };
        loadPrograms();
    }, []);

    const openAddModal = () => {
        setCourseToEdit(null);
        setModalOpen(true);
    };

    const openEditModal = (course) => {
        setCourseToEdit(course);
        setModalOpen(true);
    };

    const handleModalSuccess = () => {
        setListKey(prev => prev + 1);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t("courses.title")}</h1>
                    <p className="text-slate-500 mt-1">{t("courses.subtitle")}</p>
                </div>

                {programs.length > 0 && (
                    <ProgramTabs
                        programs={programs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                )}
            </div>

            <div className="mt-6">
                {activeTab === "all" ? (
                    <CoursesList
                        key={`all-${listKey}`}
                        onAdd={openAddModal}
                        onEdit={openEditModal}
                    />
                ) : (
                    <ProgramView
                        key={`prog-${activeTab}-${listKey}`}
                        programId={activeTab}
                        onAdd={openAddModal}
                        onEdit={openEditModal}
                    />
                )}
            </div>

            <CourseFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setCourseToEdit(null); }}
                onSuccess={handleModalSuccess}
                courseToEdit={courseToEdit}
                activeTab={activeTab}
                programs={programs}
            />
        </div>
    );
}
