import React, { useRef, useState, useEffect } from "react";
import { ChevronDown, MapPin, User, Clock, Users as UsersIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * Modern styled dropdown for picking lecture/lab sections.
 * Shows day, time, room, instructor, and capacity info.
 */
export default function SectionDropdown({ label, sections, selectedId, onChange, className, ignoreConflict = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    if (!sections || sections.length === 0) return null;

    const selected = sections.find(s => s.sectionId === selectedId) || sections[0];

    function handleSelect(sectionId) {
        onChange(sectionId);
        setIsOpen(false);
    }

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen]);

    return (
        <div className={cn("relative min-w-[260px]", className)} ref={containerRef}>
            {label && (
                <p className="text-[11px] font-semibold text-slate-500 mb-1 truncate">{label}</p>
            )}
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                title={!ignoreConflict && selected?.hasTimeConflict ? "This time conflicts with your group. Please click to pick another." : undefined}
                className={cn(
                    "w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-all",
                    "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-200",
                    isOpen && "ring-2 ring-indigo-200 border-indigo-300",
                    !ignoreConflict && selected?.hasTimeConflict && "border-red-300 ring-1 ring-red-200 bg-red-50/50"
                )}
            >
                <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-bold", !ignoreConflict && selected?.hasTimeConflict ? "text-red-700" : "text-slate-800")}>
                        {selected?.schedule?.day} · {selected?.schedule?.time}
                    </p>
                    <p className={cn("text-[11px] truncate", !ignoreConflict && selected?.hasTimeConflict ? "text-red-600" : "text-slate-500")}>
                        {selected?.instructor} · {selected?.schedule?.room || "TBA"}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {selected.capacity && (
                        <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                            selected.capacity.isFull
                                ? "bg-red-50 text-red-500"
                                : "bg-emerald-50 text-emerald-600"
                        )}>
                            {selected.capacity.remaining}/{selected.capacity.max}
                        </span>
                    )}
                    <ChevronDown className={cn(
                        "w-3.5 h-3.5 text-slate-400 transition-transform",
                        isOpen && "rotate-180"
                    )} />
                </div>
            </button>

            {/* Dropdown — positioned relative, not fixed, so it stays within page flow */}
            {isOpen && (
                <div className="absolute z-30 top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 overflow-hidden max-h-60 overflow-y-auto">
                    {sections.map(sec => {
                        const isActive = sec.sectionId === (selectedId ?? sections[0]?.sectionId);
                        return (
                            <button
                                key={sec.sectionId}
                                type="button"
                                onClick={() => handleSelect(sec.sectionId)}
                                disabled={sec.capacity?.isFull}
                                title={!ignoreConflict && sec.hasTimeConflict ? "This time conflicts with your group. Please pick another." : undefined}
                                className={cn(
                                    "w-full text-left px-3 py-2.5 transition-colors border-b border-slate-50 last:border-0",
                                    isActive
                                        ? "bg-indigo-50/70"
                                        : sec.capacity?.isFull
                                            ? "bg-slate-50 opacity-50 cursor-not-allowed"
                                            : "hover:bg-slate-50",
                                    !ignoreConflict && sec.hasTimeConflict && "ring-1 ring-inset ring-red-200 bg-red-50/30"
                                )}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="text-xs font-bold text-slate-800">
                                            {sec.schedule?.day}
                                        </span>
                                        <span className="text-xs text-slate-600">
                                            {sec.schedule?.time}
                                        </span>
                                    </div>
                                    {isActive && (
                                        <span className="text-[10px] font-bold text-indigo-500">✓</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                        <User className="w-3 h-3" />
                                        <span className="truncate max-w-[180px]">{sec.instructor}</span>
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                        <MapPin className="w-3 h-3" />
                                        {sec.schedule?.room || "TBA"}
                                    </span>
                                    {sec.capacity && (
                                        <span className="flex items-center gap-1 text-[11px] text-slate-500 ml-auto">
                                            <UsersIcon className="w-3 h-3" />
                                            <span className={cn(
                                                "font-semibold",
                                                sec.capacity.isFull ? "text-red-500" : "text-emerald-600"
                                            )}>
                                                {sec.capacity.remaining}
                                            </span>
                                            /{sec.capacity.max}
                                        </span>
                                    )}
                                </div>
                                {!ignoreConflict && sec.hasTimeConflict && sec.conflictMessage && (
                                    <p className="text-[10px] text-red-500 mt-1">⚠ {sec.conflictMessage}</p>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
