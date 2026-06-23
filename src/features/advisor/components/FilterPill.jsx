import React from "react";

export default function FilterPill({ label, count, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
            style={
                active
                    ? {
                        background: "var(--adv-filter-active-bg)",
                        color: "var(--adv-filter-active-text)",
                        borderColor: "var(--adv-filter-active-bg)",
                        boxShadow: "0 2px 8px 0 oklch(48.816% 0.25831 289.998 / 0.25)",
                    }
                    : {
                        background: "var(--adv-filter-idle-bg)",
                        color: "var(--adv-filter-idle-text)",
                        borderColor: "var(--adv-filter-idle-border)",
                    }
            }
        >
            {label}
            <span
                className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold"
                style={
                    active
                        ? { background: "oklch(100% 0 0 / 20%)", color: "inherit" }
                        : { background: "var(--ui-border)", color: "var(--adv-filter-idle-text)" }
                }
            >
                {count}
            </span>
        </button>
    );
}
