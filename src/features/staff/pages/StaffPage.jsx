import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    CalendarDays, Plus, ChevronDown, Search,
    Loader2, CheckCircle2, Trash2, AlertTriangle, Power
} from "lucide-react";
import useTerms from "../hooks/useTerms";
import AddTermModal from "../components/AddTermModal";
import RoleCards from "../components/RoleCards";
import StaffList from "../components/StaffList";

// ─── View constants ───────────────────────────────────────────────────────────
const VIEW_OVERVIEW   = "overview";
const VIEW_STAFF_LIST = "staff-list";

export default function StaffPage() {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    // ── Terms ─────────────────────────────────────────────────────────────
    const {
        terms, isLoading: termsLoading, addTerm, deleteTerm, toggleTerm,
        persistedSemesterId, persistSelection,
    } = useTerms();

    // ── Selected semester ─────────────────────────────────────────────────
    const [selectedSemester, setSelectedSemester] = useState(null);

    // ── Navigation ────────────────────────────────────────────────────────
    const [view, setView]         = useState(VIEW_OVERVIEW);
    const [selectedRole, setSelectedRole] = useState(null); // 'doctors' | 'tAs'

    // ── UI State ──────────────────────────────────────────────────────────
    const [addTermOpen,    setAddTermOpen]    = useState(false);
    const [selectTermOpen, setSelectTermOpen] = useState(false);
    const [termSearch,     setTermSearch]     = useState("");
    const [deletingId,     setDeletingId]     = useState(null); // confirm hover-delete

    // ── Restore persisted semester on mount (once terms are loaded) ───────
    useEffect(() => {
        if (!persistedSemesterId || terms.length === 0) return;
        const found = terms.find((t) => t.semesterId === persistedSemesterId);
        if (found) {
            setSelectedSemester(found);
        } else {
            // If the persisted term was deleted from another tab or doesn't exist
            setSelectedSemester(null);
            persistSelection(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [terms, persistedSemesterId]);

    // ── Select a term ─────────────────────────────────────────────────────
    const handleSelectTerm = (semester) => {
        setSelectedSemester(semester);
        persistSelection(semester.semesterId);
        setSelectTermOpen(false);
        setTermSearch("");
        setView(VIEW_OVERVIEW);
        setSelectedRole(null);
    };

    // ── Delete a term (with hover confirmation) ───────────────────────────
    const handleDeleteTerm = async (e, semesterId) => {
        e.stopPropagation();
        if (deletingId !== semesterId) { setDeletingId(semesterId); return; }
        await deleteTerm(semesterId);
        setDeletingId(null);
        if (selectedSemester?.semesterId === semesterId) {
            setSelectedSemester(null);
            setView(VIEW_OVERVIEW);
        }
    };

    // ── Navigate into a role ──────────────────────────────────────────────
    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setView(VIEW_STAFF_LIST);
    };

    // ── Go back to overview ───────────────────────────────────────────────
    const handleBack = () => { setView(VIEW_OVERVIEW); setSelectedRole(null); };



    // ── Derived ───────────────────────────────────────────────────────────
    const filteredTerms = terms.filter((t) =>
        (t.semesterName ?? "").toLowerCase().includes(termSearch.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-24">

            {/* ════════════════════════════════════════════════════════════
                PAGE HEADER
            ════════════════════════════════════════════════════════════ */}
            <div>
                {/* <h1 className="text-2xl font-bold text-slate-800">{t("staff.title")}</h1> */}
                <p className="text-slate-400 text-sm mt-0.5">{t("staff.subtitle")}</p>
            </div>

            {/* ════════════════════════════════════════════════════════════
                TOP SECTION — Left: selected term card | Right: buttons
            ════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch">

                {/* ── Left: Selected Term Card ────────────────────────── */}
                <div className={`flex-1 flex items-center gap-4 p-5 rounded-2xl border-2 transition-all min-h-[96px]
                    ${selectedSemester
                        ? "border-staff-term-btn-border bg-gradient-to-br from-staff-term-btn-bg to-white shadow-sm"
                        : "border-dashed border-slate-200 bg-slate-50/50"
                    }`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                        ${selectedSemester ? "bg-staff-add-btn-bg" : "bg-slate-200"}`}>
                        <CalendarDays className={`h-5 w-5 ${selectedSemester ? "text-white" : "text-slate-400"}`} />
                    </div>
                    <div className="min-w-0">
                        {selectedSemester ? (
                            <>
                                <p className="text-xs font-semibold text-staff-term-btn-text uppercase tracking-widest">
                                    {t("staff.selectedSemester")}
                                </p>
                                <p className="text-xl font-bold text-slate-800 truncate mt-0.5">
                                    {isAr && selectedSemester.semesterNameAr ? selectedSemester.semesterNameAr : selectedSemester.semesterName}
                                </p>
                                {selectedSemester.isActive && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        {t("staff.active")}
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-semibold text-slate-400">{t("staff.noSemester")}</p>
                                <p className="text-xs text-slate-300 mt-0.5">{t("staff.clickSelect")}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Right: Action Buttons ───────────────────────────── */}
                <div className="flex flex-row sm:flex-col gap-3 sm:w-48">

                    {/* Select Semester */}
                    <div className="relative flex-1 sm:flex-none">
                        <button
                            onClick={() => setSelectTermOpen((p) => !p)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border
                                border-staff-term-btn-border bg-staff-term-btn-bg text-staff-term-btn-text
                                text-sm font-semibold hover:bg-staff-term-btn-hover transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                {t("staff.selectSemesterBtn")}
                            </span>
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${selectTermOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* ── Term Dropdown ─────────────────────────── */}
                        {selectTermOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => { setSelectTermOpen(false); setTermSearch(""); setDeletingId(null); }} />
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    {/* Search */}
                                    <div className="p-3 border-b border-slate-100">
                                        <div className="relative">
                                            <Search className={`absolute ${isAr ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400`} />
                                            <input
                                                id="term-search"
                                                name="termSearch"
                                                autoFocus
                                                value={termSearch}
                                                onChange={(e) => setTermSearch(e.target.value)}
                                                placeholder={t("staff.searchSemesters")}
                                                className={`w-full ${isAr ? "pr-8 pl-3" : "pl-8 pr-3"} py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-focus-ring`}
                                            />
                                        </div>
                                    </div>

                                    {/* Term List */}
                                    <div className="max-h-72 overflow-y-auto py-1">
                                        {termsLoading ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                                            </div>
                                        ) : filteredTerms.length === 0 ? (
                                            <p className="text-center py-8 text-xs text-slate-400">{t("staff.noTermsFound")}</p>
                                        ) : (
                                            filteredTerms.map((term) => {
                                                const isSelected = selectedSemester?.semesterId === term.semesterId;
                                                const isDeleting = deletingId === term.semesterId;
                                                return (
                                                    <div
                                                        key={term.semesterId}
                                                        className="group relative flex items-center px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                                                        onClick={() => handleSelectTerm(term)}
                                                        onMouseLeave={() => setDeletingId(null)}
                                                    >
                                                        {/* Term info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm truncate ${isSelected ? "font-bold text-staff-term-btn-text" : "text-slate-700"}`}>
                                                                {isAr && term.semesterNameAr ? term.semesterNameAr : term.semesterName}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">{isAr && term.semesterTypeAr ? term.semesterTypeAr : term.semesterType} · {term.academicYear}</p>
                                                        </div>

                                                        {/* Badges + actions */}
                                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                            {term.isActive && (
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">{t("staff.activeBadge")}</span>
                                                            )}
                                                            {isSelected && !isDeleting && (
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-staff-term-btn-text" />
                                                            )}

                                                            {/* Toggle active hover button */}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleTerm(term.semesterId); }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-green-500 hover:bg-green-50 transition-all"
                                                                title={term.isActive ? t("staff.deactivate") : t("staff.activate")}
                                                            >
                                                                <Power className="h-3.5 w-3.5" />
                                                            </button>

                                                            {/* Delete hover button */}
                                                            <button
                                                                onClick={(e) => handleDeleteTerm(e, term.semesterId)}
                                                                className={`p-1 rounded-lg transition-all
                                                                    ${isDeleting
                                                                        ? "bg-red-100 text-red-600 opacity-100"
                                                                        : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                                    }`}
                                                                title={isDeleting ? t("staff.deleteConfirm") : t("staff.deleteTerm")}
                                                            >
                                                                {isDeleting
                                                                    ? <AlertTriangle className="h-3.5 w-3.5" />
                                                                    : <Trash2 className="h-3.5 w-3.5" />
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Add Term */}
                    <button
                        onClick={() => setAddTermOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
                            bg-staff-add-btn-bg text-staff-add-btn-text hover:bg-staff-add-btn-hover transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        {t("staff.addTerm")}
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                OVERVIEW — Role Cards
            ════════════════════════════════════════════════════════════ */}
            {selectedSemester && view === VIEW_OVERVIEW && (
                <RoleCards
                    onSelect={handleRoleSelect}
                />
            )}

            {/* ════════════════════════════════════════════════════════════
                STAFF LIST VIEW
            ════════════════════════════════════════════════════════════ */}
            {selectedSemester && view === VIEW_STAFF_LIST && (
                <StaffList
                    role={selectedRole}
                    semesterId={selectedSemester.semesterId}
                    semesterName={selectedSemester.semesterName}
                    onBack={handleBack}
                />
            )}

            {/* ════════════════════════════════════════════════════════════
                ADD TERM MODAL
            ════════════════════════════════════════════════════════════ */}
            <AddTermModal
                open={addTermOpen}
                onClose={() => setAddTermOpen(false)}
                onAdd={addTerm}
            />

        </div>
    );
}
