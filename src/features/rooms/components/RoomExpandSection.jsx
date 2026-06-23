import React from "react";
import { Clock } from "lucide-react";

export default function RoomExpandSection({ mode, availabilities = [], t }) {
    return (
        <div className="px-7 py-6 bg-slate-50/30 space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <Clock className="h-3.5 w-3.5 text-avalibility-ava" />
                </div>
                <span className="text-xs font-bold text-slate-500">
                    {t("rooms.availabilities")}
                    {mode && (
                        <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-end-time text-text-end-time border border-end-time-border">
                            {mode}
                        </span>
                    )}
                </span>
            </div>
            {availabilities.length === 0 ? (
                <p className="text-xs text-slate-400 italic pl-8">
                    {mode === t("rooms.always") ? t("rooms.availableAll") : mode === t("rooms.fullDay") ? t("rooms.availableFull") : t("rooms.noSpecificSlots")}
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-8">
                    {availabilities.map((av, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                            <span className="text-[11px] font-bold text-slate-700">{av.day}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 bg-bg-start-time text-text-start-time rounded-md font-semibold border border-start-time-border">
                                    {av.startTime?.slice(0, 5)}
                                </span>
                                <span className="text-slate-300">→</span>
                                <span className="text-[10px] px-2 py-0.5 bg-bg-end-time text-text-end-time rounded-md font-semibold border border-end-time-border">
                                    {av.endTime?.slice(0, 5)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
