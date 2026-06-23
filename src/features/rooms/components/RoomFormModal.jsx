import React from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import FormModal from "@/shared/components/FormModal";
import TimeInput24 from "@/shared/components/TimeInput24";
import SimpleDropdown from "./SimpleDropdown";

export default function RoomFormModal({
    t,
    open,
    closeModal,
    isEditing,
    isSaving,
    handleSave,
    form,
    setForm,
    ROOM_TYPES,
    AVAILABILITY_MODES,
    DAYS_OF_WEEK,
    isCustomMode,
    addAvailability,
    removeAvailability,
    updateAvailability
}) {
    return (
        <FormModal
            open={open}
            onClose={closeModal}
            title={isEditing ? t("rooms.editRoom") : t("rooms.addRoom")}
            onSave={handleSave}
            isSaving={isSaving}
            saveLabel={isEditing ? t("rooms.save") : t("rooms.add")}
        >
            {/* Row 1: Room number + Building */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="room-number" className="text-xs font-semibold text-slate-500">{t("rooms.roomNumber")}</label>
                    <input
                        id="room-number"
                        name="roomNumber"
                        value={form.roomNumber}
                        onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))}
                        placeholder={t("rooms.roomNumberPlaceholder")}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition"
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="room-building" className="text-xs font-semibold text-slate-500">{t("rooms.building")}</label>
                    <input
                        id="room-building"
                        name="building"
                        value={form.building}
                        onChange={e => setForm(f => ({ ...f, building: e.target.value }))}
                        placeholder={t("rooms.buildingPlaceholder")}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition"
                    />
                </div>
            </div>

            {/* Row 2: Room number + Building (Arabic) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="room-building-ar" className="text-xs font-semibold text-slate-500">{t("rooms.buildingAr")}</label>
                    <input
                        id="room-building-ar"
                        name="buildingAr"
                        value={form.buildingAr}
                        onChange={e => setForm(f => ({ ...f, buildingAr: e.target.value }))}
                        placeholder={t("rooms.buildingArPlaceholder")}
                        dir="rtl"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition text-right"
                    />
                </div>
            </div>

            {/* Row 3: Room type + Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">{t("rooms.roomType")}</label>
                    <SimpleDropdown
                        value={form.roomType}
                        options={ROOM_TYPES}
                        onChange={val => {
                            const rt = ROOM_TYPES.find(t => t.value === val);
                            setForm(f => ({ ...f, roomType: val, roomTypeAr: rt?.name || val }));
                        }}
                        placeholder={t("rooms.roomTypePlaceholder")}
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="room-capacity" className="text-xs font-semibold text-slate-500">{t("rooms.capacity")}</label>
                    <input
                        id="room-capacity"
                        name="capacity"
                        type="number"
                        min={0}
                        value={form.capacity}
                        onChange={e => setForm(f => ({ ...f, capacity: Math.max(0, e.target.value) }))}
                        placeholder={t("rooms.capacityPlaceholder")}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition"
                    />
                </div>
            </div>

            {/* Row 4: Availability Mode */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">{t("rooms.availabilityMode")}</label>
                <SimpleDropdown
                    value={form.availabilityMode}
                    options={AVAILABILITY_MODES}
                    onChange={val => setForm(f => ({ ...f, availabilityMode: val, availabilities: val === 2 ? f.availabilities : [] }))}
                    placeholder={t("rooms.availabilityModePlaceholder")}
                />
            </div>

            {/* Row 5: Custom availabilities (only when mode = Custom) */}
            {isCustomMode && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-500">{t("rooms.availabilities")}</label>
                        <button
                            type="button"
                            onClick={addAvailability}
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-button-add border border-button-add-border text-text hover:bg-button-add-hover transition"
                        >
                            <Plus className="h-3 w-3" /> {t("rooms.addSlot")}
                        </button>
                    </div>
                    {form.availabilities.length === 0 && (
                        <p className="text-xs text-slate-400 italic">{t("rooms.noSlots")}</p>
                    )}
                    {form.availabilities.map((av, idx) => (
                        <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-3 bg-slate-50 rounded-xl border border-slate-100">
                            {/* Day */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-400">{t("rooms.day")}</label>
                                <SimpleDropdown
                                    value={av.day}
                                    options={DAYS_OF_WEEK}
                                    onChange={val => updateAvailability(idx, "day", val)}
                                    placeholder={t("rooms.day")}
                                />
                            </div>
                            {/* Start Time */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-400">{t("rooms.start")}</label>
                                <TimeInput24
                                    value={av.startTime}
                                    onChange={(v) => updateAvailability(idx, "startTime", v)}
                                    className="w-full"
                                />
                            </div>
                            {/* End Time */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-400">{t("rooms.end")}</label>
                                <TimeInput24
                                    value={av.endTime}
                                    onChange={(v) => updateAvailability(idx, "endTime", v)}
                                    className="w-full"
                                />
                            </div>
                            {/* Remove */}
                            <button
                                type="button"
                                onClick={() => removeAvailability(idx)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Active toggle — edit mode only */}
            {isEditing && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">{t("rooms.status")}</span>
                    <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                        className="flex items-center gap-2 text-sm font-semibold"
                    >
                        {form.isActive ? (
                            <><ToggleRight className="h-6 w-6 text-active-room" /><span className="text-active-room">{t("rooms.active")}</span></>
                        ) : (
                            <><ToggleLeft className="h-6 w-6 text-inactive-room" /><span className="text-inactive-room">{t("rooms.inactive")}</span></>
                        )}
                    </button>
                </div>
            )}
        </FormModal>
    );
}
