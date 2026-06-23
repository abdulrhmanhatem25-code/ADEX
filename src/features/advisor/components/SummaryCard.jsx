import React from "react";
import { Loader2 } from "lucide-react";

export default function SummaryCard({ icon, label, value, colorVar, borderVar, textVar, isLoading }) {
    return (
        <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border bg-ui-bg shadow-sm"
            style={{ borderColor: `var(${borderVar})` }}
        >
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `var(${colorVar})` }}
            >
                <span style={{ color: `var(${textVar})` }}>{icon}</span>
            </div>
            <div className="min-w-0">
                <p className="text-[11px] text-ui-text-subtle font-medium leading-tight">{label}</p>
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-ui-text-subtle mt-0.5" />
                ) : (
                    <p className="text-xl font-bold text-ui-text leading-tight">{value ?? "—"}</p>
                )}
            </div>
        </div>
    );
}
