import React from "react";
import { Plus, X } from "lucide-react";
import TimeInput24 from "@/shared/components/TimeInput24";
import DayOfWeekSelect from "@/shared/components/DayOfWeekSelect";

/**
 * Availability schedule editor — manages an array of { dayOfWeek, startTime, endTime }.
 *
 * @param {Array}    availabilities - [{ dayOfWeek, startTime, endTime }]
 * @param {Function} onChange        - (newAvailabilities) => void
 * @param {boolean}  [isAr]          - Arabic labels for weekday
 */
export default function AvailabilityEditor({ availabilities, onChange, isAr = false }) {
    const addRow = () => onChange([...availabilities, { dayOfWeek: "Sunday", startTime: "08:00", endTime: "10:00" }]);
    const removeRow = (idx) => onChange(availabilities.filter((_, i) => i !== idx));
    const updateRow = (idx, field, value) =>
        onChange(availabilities.map((row, i) => i === idx ? { ...row, [field]: value } : row));

    return (
        <div className="space-y-2">
            {availabilities.map((row, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 items-center bg-white rounded-xl px-3 py-2 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
                    <DayOfWeekSelect
                        variant="compact"
                        isAr={isAr}
                        value={row.dayOfWeek || "Sunday"}
                        onValueChange={(v) => updateRow(idx, "dayOfWeek", v)}
                        className="min-w-[7.5rem]"
                    />
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-2 py-1.5 shadow-sm">
                        <TimeInput24
                            variant="compact"
                            value={row.startTime}
                            onChange={(v) => updateRow(idx, "startTime", v)}
                            className="gap-1"
                        />
                        <span className="text-[10px] font-black text-slate-300 select-none" aria-hidden>
                            →
                        </span>
                        <TimeInput24
                            variant="compact"
                            value={row.endTime}
                            onChange={(v) => updateRow(idx, "endTime", v)}
                            className="gap-1"
                        />
                    </div>
                    <button type="button" onClick={() => removeRow(idx)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
            <button type="button" onClick={addRow} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-100 text-slate-400 text-[10px] font-bold hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all w-full">
                <Plus className="h-3.5 w-3.5" />NEW SLOT
            </button>
        </div>
    );
}
