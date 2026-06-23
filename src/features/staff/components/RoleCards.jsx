import React from "react";
import { GraduationCap, User2, ChevronRight, Loader2, UserPlus } from "lucide-react";

/**
 * Shows two role cards (Doctors / Teaching Assistants) + Add Staff button.
 * Props:
 *   onSelect    – (role: 'doctors' | 'tAs') => void
 *   onAddStaff  – () => void — opens the Add Staff modal (in StaffPage)
 */
export default function RoleCards({ onSelect }) {
    const roles = [
        {
            key: "doctor",
            label: "doctor",
            icon: User2,
            bg: "bg-staff-role-doc-bg",
            border: "border-staff-role-doc-border",
            iconBg: "bg-staff-role-doc-bg",
            iconColor: "text-staff-role-doc-icon",
            gradient: "from-blue-50/60 to-indigo-50/60",
        },
        {
            key: "ta",
            label: "Teaching Assistants",
            icon: GraduationCap,
            bg: "bg-staff-role-ta-bg",
            border: "border-staff-role-ta-border",
            iconBg: "bg-staff-role-ta-bg",
            iconColor: "text-staff-role-ta-icon",
            gradient: "from-pink-50/60 to-rose-50/60",
        },
    ];

    return (
        <div className="space-y-4">
            {/* ── Role Cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roles.map(({ key, label, icon: Icon, bg, border, iconColor, gradient }) => (
                    <button
                        key={key}
                        onClick={() => onSelect(key)}
                        className={`group relative flex items-center justify-between gap-4 p-6 rounded-2xl
                            border-2 ${border} ${bg} bg-gradient-to-br ${gradient}
                            shadow-sm hover:shadow-lg transition-all duration-200
                            hover:-translate-y-1 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-staff-role-doc-border`}
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon box */}
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                                bg-white/80 border ${border} shadow-sm
                                group-hover:scale-110 transition-transform duration-200`}>
                                <Icon className={`h-7 w-7 ${iconColor}`} />
                            </div>
                            {/* Text */}
                            <div>
                                <p className="text-lg font-bold text-slate-800 leading-tight">{label}</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Manage instructors
                                </p>
                            </div>
                        </div>
                        {/* Arrow */}
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                    </button>
                ))}
            </div>

        </div>
    );
}
