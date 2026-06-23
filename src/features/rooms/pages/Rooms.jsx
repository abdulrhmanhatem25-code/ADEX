import React from "react";
import { useTranslation } from "react-i18next";
import DataListLayout from "@/shared/components/DataListLayout";
import useRooms from "../hooks/useRooms";
import RoomRow from "../components/RoomRow";
import RoomFormModal from "../components/RoomFormModal";

export default function Rooms() {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";

    const {
        list,
        ROOM_TYPES,
        AVAILABILITY_MODES,
        DAYS_OF_WEEK,
        expandedId,
        toggleExpand,
        handleToggle,
        modalOpen,
        isEditing,
        isSaving,
        form,
        setForm,
        openAddModal,
        openEditModal,
        closeModal,
        addAvailability,
        removeAvailability,
        updateAvailability,
        handleSave,
        isCustomMode
    } = useRooms(isRtl);

    const SORT_OPTIONS = [
        { label: t("rooms.roomType"), value: "roomType" },
        { label: t("rooms.capacity"), value: "capacity" },
    ];

    const renderItem = (room) => (
        <RoomRow
            key={room.roomId ?? room.id}
            room={room}
            isRtl={isRtl}
            t={t}
            DAYS_OF_WEEK={DAYS_OF_WEEK}
            expandedId={expandedId}
            toggleExpand={toggleExpand}
            openEditModal={openEditModal}
            handleToggle={handleToggle}
        />
    );

    return (
        <>
            <DataListLayout
                title={t("rooms.title")}
                subtitle={t("rooms.subtitle")}
                list={list}
                sortOptions={SORT_OPTIONS}
                onAdd={openAddModal}
                addLabel={t("rooms.add")}
                emptyMessage={t("rooms.noRooms")}
                loadingMessage={t("rooms.loading")}
                renderItem={renderItem}
            />

            <RoomFormModal
                t={t}
                open={modalOpen}
                closeModal={closeModal}
                isEditing={isEditing}
                isSaving={isSaving}
                handleSave={handleSave}
                form={form}
                setForm={setForm}
                ROOM_TYPES={ROOM_TYPES}
                AVAILABILITY_MODES={AVAILABILITY_MODES}
                DAYS_OF_WEEK={DAYS_OF_WEEK}
                isCustomMode={isCustomMode}
                addAvailability={addAvailability}
                removeAvailability={removeAvailability}
                updateAvailability={updateAvailability}
            />
        </>
    );
}
