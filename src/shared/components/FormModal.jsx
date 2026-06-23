import React from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Shared modal for Add/Edit forms.
 *
 * @param {boolean}  open       - Whether modal is visible
 * @param {Function} onClose    - Close handler
 * @param {string}   title      - Modal title
 * @param {Function} onSave     - Save handler
 * @param {boolean}  isSaving   - Is currently saving
 * @param {string}   [saveLabel="Save"] - Label on save button
 * @param {string}   [error]    - Error message to display
 * @param {string}   [maxWidth="max-w-xl"] - Max width class
 * @param {React.ReactNode} children - Form content
 */
export default function FormModal({
    open,
    onClose,
    title,
    onSave,
    isSaving = false,
    saveLabel = "Save",
    error = "",
    maxWidth = "max-w-xl",
    children,
}) {
    const { t } = useTranslation();

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] min-h-0 flex flex-col overflow-hidden`}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
                    <h2 className="text-base font-bold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-0.5">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body — scrollable, no visible scrollbar */}
                <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 min-h-0 no-scrollbar">
                    {children}
                </div>

                {/* Footer — sticky */}
                <div className="px-5 pt-2 pb-4 border-t border-slate-100 space-y-2 flex-shrink-0">
                    {error && (
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100 flex items-center gap-2">
                            <span>⚠️</span>{error}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-button-save border border-button-save-border shadow-md text-text text-sm font-semibold hover:bg-button-save-hover disabled:opacity-60 transition"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {t("FormModal.save")}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 shadow-md text-text text-sm font-semibold hover:bg-gray-1 transition"
                        >
                            {t("FormModal.cancel")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
