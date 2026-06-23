import React from "react";
import { useTranslation } from "react-i18next";
import { Search, ChevronLeft, Loader2, UserPlus } from "lucide-react";
import StaffCard, { getId } from "./StaffCard";
import SelectionToolbar from "./SelectionToolbar";
import AddStaffModal from "./AddStaffModal";
import EditStaffModal from "./EditStaffModal";
import TransferStaffModal from "./TransferStaffModal";
import ClearStaffDataModal from "./ClearStaffDataModal";
import useStaffList from "../hooks/useStaffList";

export default function StaffList({ role, semesterId, semesterName, onBack }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const roleLabel = role === "doctor" ? t("staff.Doctor", "Doctor") : t("staff.teachingAssistants", "Teaching Assistants");

  const {
    availModes,
    staff, isLoading, search, setSearch, page, setPage, totalCount, totalPages, from, to, pageNumbers,
    selected, toggle, toggleAll, clearAll, isSelected, allSelected, allIds,
    targetTerms, handleToggle,
    editModal, editForm, setEditForm, editCodes, setEditCodes, editAvails, setEditAvails, editSaving, editError, openEdit, closeEdit, handleEdit,
    addModalOpen, addForm, setAddForm, addCodes, setAddCodes, addAvails, setAddAvails, addSaving, addError, openAdd, closeAdd, handleAdd, taTypes,
    transferModalOpen, setTransferModalOpen, transferTargetId, setTransferTargetId, transferSaving, transferError, handleTransfer,
    clearDataModalOpen, setClearDataModalOpen, clearDataSaving, clearDataError, handleClearData
  } = useStaffList({ role, semesterId });

  const targetTermOptions = targetTerms.map(term => ({
    id: term.semesterId,
    name: isAr && term.semesterNameAr ? term.semesterNameAr : term.semesterName
  }));

  return (
    <div className="space-y-4">
      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
                        bg-staff-breadcrumb-bg text-staff-breadcrumb-text hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
          {semesterName}
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-bold text-slate-700">{roleLabel}</span>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className={`absolute ${isAr ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
          <input
            id="staff-search"
            name="staffSearch"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("staff.searchPlaceholder", "Search by name or code…")}
            className={`w-full ${isAr ? "pr-9 pl-4" : "pl-9 pr-4"} py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring transition`}
          />
        </div>
        
        {/* Add Staff Button */}
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            bg-staff-add-btn-bg text-staff-add-btn-text hover:bg-staff-add-btn-hover
            shadow-sm hover:shadow-md transition-all duration-200"
        >
          <UserPlus className="h-4 w-4" />
          {t("staff.addStaffBtn", "Add Staff Member")}
        </button>
      </div>

      {/* ── List Container ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {staff.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
            <input id="staff-select-all" name="staffSelectAll" type="checkbox" checked={allSelected} onChange={() => toggleAll(allIds)} className="w-4 h-4 rounded accent-staff-add-btn-bg cursor-pointer" />
            <span className="text-xs font-semibold text-slate-500">{allSelected ? t("staff.deselectAll", "Deselect All") : t("staff.selectAll", "Select All")}</span>
            {selected.length > 0 && <span className={`text-xs text-indigo-600 font-semibold ${isAr ? "mr-1" : "ml-1"}`}>({selected.length} {t("staff.selected", "selected")})</span>}
            {isLoading && <Loader2 className={`h-3.5 w-3.5 animate-spin text-slate-400 ${isAr ? "mr-auto" : "ml-auto"}`} />}
          </div>
        )}

        {isLoading && staff.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">{t("staff.loading", "Loading staff...")}</span>
          </div>
        ) : staff.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            {search ? t("staff.noSearchMatch", "No results match your search.") : t("staff.noRoleFound", `No ${roleLabel.toLowerCase()} found.`)}
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-50">
              {staff.map((s) => (
                <StaffCard key={getId(s)} staff={s} isSelected={isSelected(getId(s))} onSelect={toggle} onEdit={openEdit} onToggle={handleToggle} />
              ))}
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/30">
                <span>Showing {from} to {to} of {totalCount}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">‹</button>
                  {pageNumbers.map((pg, i) => pg === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-7 text-center">…</span>
                  ) : (
                    <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold transition-colors ${page === pg ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-600"}`}>
                      {pg}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <SelectionToolbar selectedCount={selected.length} onClear={clearAll} onTransfer={() => setTransferModalOpen(true)} onClearData={() => setClearDataModalOpen(true)} />

      <EditStaffModal open={editModal.open} onClose={closeEdit} onSave={handleEdit} isSaving={editSaving} form={editForm} setForm={setEditForm} avails={editAvails} setAvails={setEditAvails} availModes={availModes} isAr={isAr} codes={editCodes} setCodes={setEditCodes} role={role} taTypes={taTypes} />
      <AddStaffModal open={addModalOpen} onClose={closeAdd} onSave={handleAdd} isSaving={addSaving} form={addForm} setForm={setAddForm} avails={addAvails} setAvails={setAddAvails} availModes={availModes} isAr={isAr} codes={addCodes} setCodes={setAddCodes} role={role} taTypes={taTypes} />
      <TransferStaffModal open={transferModalOpen} onClose={() => setTransferModalOpen(false)} onSave={handleTransfer} isSaving={transferSaving} selectedCount={selected.length} semesterName={semesterName} targetTermOptions={targetTermOptions} transferTargetId={transferTargetId} setTransferTargetId={setTransferTargetId} />
      <ClearStaffDataModal open={clearDataModalOpen} onClose={() => setClearDataModalOpen(false)} onSave={handleClearData} isSaving={clearDataSaving} selectedCount={selected.length} />
    </div>
  );
}
