import React from "react";
import FormModal from "@/shared/components/FormModal";
import { SearchableSelect } from "@/shared/ui/SearchableSelect";

export default function TransferStaffModal({
  open,
  onClose,
  onSave,
  isSaving,
  selectedCount,
  semesterName,
  targetTermOptions,
  transferTargetId,
  setTransferTargetId
}) {
  return (
    <FormModal 
      open={open} 
      onClose={onClose} 
      title="Transfer Staff" 
      onSave={onSave} 
      isSaving={isSaving} 
      saveLabel="Transfer" 
    >
      <div className="space-y-4 min-h-[300px]">
        <p className="text-sm text-slate-500">
          You are transferring <span className="font-bold text-slate-800">{selectedCount}</span> staff member(s) from <span className="font-bold text-slate-800">{semesterName}</span>. Please select the destination term below.
        </p>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Destination Term</label>
          <SearchableSelect
            options={targetTermOptions}
            value={targetTermOptions.find(t => t.id === transferTargetId) || null}
            onValueChange={(selected) => setTransferTargetId(selected?.id || "")}
            placeholder="Select target term…"
            emptyMessage="No terms found"
            inputClassName="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring bg-white"
          />
        </div>
      </div>
    </FormModal>
  );
}
