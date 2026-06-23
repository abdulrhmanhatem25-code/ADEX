import React from "react";
import { X, Users, ArrowRightLeft, Eraser } from "lucide-react";

/**
 * Floating bottom toolbar that appears when staff are selected.
 * Props:
 *   selectedCount – number of selected items
 *   onClear       – () => void (deselects all)
 *   onTransfer    – () => void (copy staff to another term)
 *   onClearData   – () => void (removes courses/availabilities from selected staff)
 */
export default function SelectionToolbar({ selectedCount, onClear, onTransfer, onClearData }) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-4 px-5 py-3.5 rounded-2xl shadow-2xl
                bg-staff-selection-bar-bg text-staff-selection-bar-text
                border border-white/20 backdrop-blur-sm">
                {/* Count badge */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-semibold">
                        {selectedCount === 1 ? "member" : "members"} selected
                    </span>
                </div>

                <div className="w-px h-5 bg-white/30" />

                {/* Transfer action */}
                <button
                    onClick={onTransfer}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
                        bg-white/20 hover:bg-white/30 transition-colors"
                    title="Transfer / copy to another term"
                >
                    <ArrowRightLeft className="h-4 w-4" />
                    Transfer
                </button>

                {/* Clear Data action */}
                {onClearData && (
                    <button
                        onClick={onClearData}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
                            bg-red-500/20 hover:bg-red-500/30 text-red-100 transition-colors"
                        title="Clear assigned courses and availabilities"
                    >
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                )}

                {/* Dismiss */}
                <button
                    onClick={onClear}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    title="Clear selection"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
