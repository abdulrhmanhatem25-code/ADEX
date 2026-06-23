import React from "react";
import FormModal from "@/shared/components/FormModal";
import CourseTagInput from "@/shared/components/CourseTagInput";
import AvailabilityModeField from "./AvailabilityModeField";
import StaffProfileFields from "./StaffProfileFields";

export default function AddStaffModal({
  open,
  onClose,
  onSave,
  isSaving,
  form,
  setForm,
  avails,
  setAvails,
  availModes,
  isAr,
  codes,
  setCodes,
  role,
  taTypes
}) {
  return (
    <FormModal 
      open={open} 
      onClose={onClose} 
      title="Add Staff Member" 
      onSave={onSave} 
      isSaving={isSaving} 
      saveLabel="Add" 
    >
      <StaffProfileFields form={form} setForm={setForm} role={role} taTypes={taTypes} isAr={isAr} />

      <AvailabilityModeField 
        form={form} 
        setForm={setForm} 
        avails={avails} 
        setAvails={setAvails} 
        availModes={availModes} 
        isAr={isAr} 
      />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500">Course Codes</label>
        <CourseTagInput 
          tags={codes} 
          onAdd={c => setCodes([...codes, c])} 
          onRemove={c => setCodes(codes.filter(x => x !== c))} 
          placeholder="Enter code…" 
          emptyText="No courses assigned" 
        />
      </div>
    </FormModal>
  );
}
