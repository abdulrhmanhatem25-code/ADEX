import React from "react";
import FormModal from "@/shared/components/FormModal";

export default function ClearStaffDataModal({
  open,
  onClose,
  onSave,
  isSaving,
  selectedCount
}) {
  return (
    <FormModal 
      open={open} 
      onClose={onClose} 
      title="Clear Staff Data" 
      onSave={onSave} 
      isSaving={isSaving} 
      saveLabel="Clear Data" 
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Are you sure you want to clear assigned courses and availabilities for <span className="font-bold text-slate-800">{selectedCount}</span> staff member(s)?
        </p>
        <p className="text-xs text-red-500 font-semibold bg-red-50 p-3 rounded-lg border border-red-100">
          This action cannot be undone. All their schedules for this term will be reset.
        </p>
      </div>
    </FormModal>
  );
}
