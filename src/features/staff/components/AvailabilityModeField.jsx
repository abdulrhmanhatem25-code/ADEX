import React from "react";
import AvailabilityEditor from "@/shared/components/AvailabilityEditor";
import DayOfWeekSelect from "@/shared/components/DayOfWeekSelect";

export default function AvailabilityModeField({ form, setForm, avails, setAvails, availModes, isAr }) {
  // If API hasn't loaded modes yet, fallback to default UI
  const modes = availModes?.length > 0 ? availModes : [
      { name: "FullWeek", nameAr: "أسبوع كامل" },
      { name: "FullWeekExcept", nameAr: "أسبوع كامل عدا يوم" },
      { name: "Manual", nameAr: "يدوي" }
  ];

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500">Availability Mode</label>
        <div className="flex gap-2 flex-wrap">
          {modes.map((m) => (
            <button key={m.name} type="button"
              onClick={() => setForm({ ...form, availabilityMode: m.name })}
              className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-semibold border transition-all
                                ${form.availabilityMode === m.name
                  ? "bg-select-bg border-select-border text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              {isAr ? (m.nameAr || m.name) : m.name}
            </button>
          ))}
        </div>
      </div>

      {form.availabilityMode === "FullWeekExcept" && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Excluded Day</label>
          <DayOfWeekSelect
            variant="default"
            isAr={isAr}
            value={form.excludedDay || "Sunday"}
            onValueChange={(v) => setForm({ ...form, excludedDay: v })}
          />
        </div>
      )}

      {form.availabilityMode === "Manual" && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Weekly Availability</label>
          <AvailabilityEditor availabilities={avails} onChange={setAvails} isAr={isAr} />
        </div>
      )}
    </>
  );
}
