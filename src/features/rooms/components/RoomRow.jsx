import React from "react";
import { DoorOpen, ChevronDown, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import StatusBadge from "@/shared/components/StatusBadge";
import RoomExpandSection from "./RoomExpandSection";

export default function RoomRow({
    room,
    isRtl,
    t,
    DAYS_OF_WEEK,
    expandedId,
    toggleExpand,
    openEditModal,
    handleToggle
}) {
    const roomId = room.roomId ?? room.id;
    const number = room.roomNumber ?? "—";
    const type = isRtl ? (room.roomTypeAr ?? room.roomType ?? "—") : (room.roomType ?? "—");
    const building = isRtl ? (room.buildingAr ?? room.building ?? "—") : (room.building ?? "—");
    const capacity = room.capacity ?? 0;
    const isActive = room.isActive ?? true;
    const mode = isRtl ? (room.availabilityModeAr ?? room.availabilityMode ?? null) : (room.availabilityMode ?? null);
    
    const avails = (room.roomAvailabilities ?? []).map(av => {
        const dayObj = DAYS_OF_WEEK.find(d => d.key === av.day);
        return {
            ...av,
            day: dayObj ? dayObj.name : av.day,
        };
    });
    
    const expanded = expandedId === roomId;

    return (
        <>
            {/* ── MOBILE CARD (< sm) ── */}
            <div className="sm:hidden px-4 py-3" onClick={() => toggleExpand(roomId)}>
                <div className={`rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden transition-all ${expanded ? "ring-1 ring-indigo-100" : ""}`}>
                    <div className="flex items-start gap-3 p-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <DoorOpen className="h-4.5 w-4.5 text-ava" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">
                                {type !== "—" && <span className="font-bold">{type}</span>}
                                <span className="text-slate-500 font-normal"> - {number}</span>
                                {building !== "—" && <span className="text-slate-400 font-normal"> · {building}</span>}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {t("rooms.capacityLabel")} <span className="font-medium text-slate-600">{capacity}</span>
                            </p>
                            {mode && (
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    {t("rooms.modeLabel")} <span className="font-semibold text-dashed-bg4">{mode}</span>
                                    {avails.length > 0 && <span className="ml-1 text-slate-300">· {avails.length} {avails.length > 1 ? t("rooms.slots") : t("rooms.slot")}</span>}
                                </p>
                            )}
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform duration-300 flex-shrink-0 mt-1 ${expanded ? "rotate-180" : ""}`} />
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                        <StatusBadge active={isActive} />
                        <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(room)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title={t("rooms.edit", "Edit")}>
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleToggle(room)} className="p-1.5 rounded-lg transition-colors" title={isActive ? t("rooms.deactivate", "Deactivate") : t("rooms.activate", "Activate")}>
                                {isActive ? <ToggleRight className="h-5 w-5 text-active-room" /> : <ToggleLeft className="h-5 w-5 text-inactive-room" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DESKTOP ROW (≥ sm) ── */}
            <div
                onClick={() => toggleExpand(roomId)}
                className={`group hidden sm:flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60 transition-colors cursor-pointer relative ${expanded ? "bg-slate-50/40" : ""}`}
            >
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                    <DoorOpen className="h-4 w-4 text-ava" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                        {type !== "—" && <span className="font-bold text-slate-800 mr-1">{type}</span>}
                        <span className="text-slate-500 font-normal">- {number}</span>
                        {building !== "—" && ` · ${building}`}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                        <span>{t("rooms.capacityLabel")} <span className="font-medium text-slate-600">{capacity}</span></span>
                        {mode && <span className="text-dashed-bg4 font-semibold">{mode}{avails.length > 0 ? ` · ${avails.length} ${avails.length > 1 ? t("rooms.slots") : t("rooms.slot")}` : ""}</span>}
                    </div>
                </div>
                <div className="flex items-center relative overflow-hidden h-9">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0 transition-all duration-300 ease-out" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEditModal(room)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title={t("rooms.edit", "Edit")}>
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleToggle(room)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-gray-1 transition-colors" title={isActive ? t("rooms.deactivate", "Deactivate") : t("rooms.activate", "Activate")}>
                            {isActive ? <ToggleRight className="h-5 w-5 text-active-room" /> : <ToggleLeft className="h-5 w-5 text-inactive-room" />}
                        </button>
                    </div>
                    <span className="ml-3"><StatusBadge active={isActive} /></span>
                    <ChevronDown className={`ml-2 h-4 w-4 text-slate-300 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                </div>
            </div>

            {/* ── Expandable Availability Section ── */}
            {expanded && (
                <div className="border-b border-slate-50">
                    <RoomExpandSection mode={mode} availabilities={avails} t={t} />
                </div>
            )}
        </>
    );
}
