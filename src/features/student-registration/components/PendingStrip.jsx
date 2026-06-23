import React from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { dayShort } from "../utils/registrationHelpers";

export default function PendingStrip({ pending, onRemove }) {
    if (pending.length === 0) return null;
    return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-bold text-emerald-700 mb-2">Pending additions ({pending.length})</p>
            <div className="flex flex-wrap gap-2">
                {pending.map(p => (
                    <div key={p.sectionId} className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-2.5 py-1 text-xs">
                        <span className={cn(
                            "text-[10px] font-bold px-1 py-0.5 rounded",
                            p.type === "Lecture" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"
                        )}>{p.type === "Lecture" ? "LEC" : "LAB"}</span>
                        <span className="font-semibold text-slate-700">{p.courseName}</span>
                        {p.schedule?.day && <span className="text-slate-400">{dayShort(p.schedule.day)} · {p.schedule.time}</span>}
                        <button onClick={() => onRemove(p.sectionId)} className="text-rose-400 hover:text-rose-600 ml-0.5">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
