import React from "react";

/**
 * Active / Inactive badge.
 *
 * @param {boolean} active - Whether active
 * @param {string}  [activeLabel="Active"]
 * @param {string}  [inactiveLabel="Inactive"]
 * @param {"pill"|"dot"} [variant="pill"] - Display style
 */
export default function StatusBadge({
    active,
    activeLabel = "Active",
    inactiveLabel = "Inactive",
    variant = "pill",
}) {
    if (variant === "dot") {
        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase
                ${active ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-300"}`} />
                {active ? activeLabel : inactiveLabel}
            </span>
        );
    }

    return (
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap
            ${active ? "bg-active-room text-text" : "bg-inactive-room text-text"}`}>
            {active ? activeLabel : inactiveLabel}
        </span>
    );
}
