import { useState, useCallback, useEffect } from "react";
import useListPage from "@/shared/hooks/useListPage";
import useSelection from "./useSelection";
import useTerms from "./useTerms";
import toast from "@/shared/lib/toast";
import { toggleStaffApi } from "@/shared/services/staffApi";
import {
  fetchSemesterStaffApi,
  updateSemesterStaffApi,
  addSemesterStaffApi,
  fetchAvailabilityModesApi,
  cloneSemesterStaffApi,
  clearSemesterStaffApi
} from "../services/semesterApi";
import { getId, getCourses, getAvails } from "../components/StaffCard";
import { normalizeTimeHHmm } from "@/shared/utils/timeHHmm";

function inferTaTypeKey(s) {
  const t = `${s?.type ?? s?.instructorType ?? ""}`.toLowerCase();
  if (t.includes("technical")) return "Technical Assistant";
  if (t.includes("assistant")) return "Assistant";
  return "";
}

/** Split "First Last" when API only sends combined `name`. */
function splitEnLn(full) {
  const f = `${full ?? ""}`.trim();
  if (!f) return ["", ""];
  const parts = f.split(/\s+/);
  if (parts.length === 1) return [parts[0], ""];
  return [parts[0], parts.slice(1).join(" ")];
}

const EMPTY_EDIT = {
  firstName: "", firstNameAr: "", lastName: "", lastNameAr: "",
  email: "", instructorCode: "", typeKey: "",
  availabilityMode: "FullWeek", excludedDay: null,
};
const EMPTY_ADD = {
  firstName: "", firstNameAr: "", lastName: "", lastNameAr: "",
  email: "", password: "", instructorCode: "", typeKey: "",
  availabilityMode: "Manual", excludedDay: ""
};

export default function useStaffList({ role, semesterId }) {
  const type = role === "doctor" ? "doctor" : "ta";

  // Fetch Availability Modes
  const [availModes, setAvailModes] = useState([]);
  useEffect(() => {
    fetchAvailabilityModesApi()
      .then(res => setAvailModes(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, []);

  // Data Fetching
  const fetchFn = useCallback(
    async (page, limit, search, sortCol, sortDir) => {
      const res = await fetchSemesterStaffApi(semesterId, type, page, limit, search, sortCol, sortDir);
      return { data: res.data?.instructors ?? { items: [], totalCount: 0, totalPages: 1 } };
    },
    [semesterId, type]
  );

  const {
    items: staff, isLoading, search, setSearch,
    page, setPage, totalCount, totalPages, from, to, pageNumbers,
    reload, updateItem,
  } = useListPage({ fetchFn, limit: 10 });

  // Selection
  const { selected, toggle, toggleAll, clearAll, isSelected, isAllSelected } = useSelection();
  const allIds = staff.map(getId);
  const allSelected = allIds.length > 0 && isAllSelected(allIds);

  // Terms for Transfer
  const { terms } = useTerms();
  const targetTerms = terms.filter(t => t.semesterId !== semesterId);

  const handleToggle = async (instructor, e) => {
    e.stopPropagation();
    const id = getId(instructor);
    if (!id) return;
    try {
      const res = await toggleStaffApi(id);
      const isAr = localStorage.getItem("i18nextLng") === "ar";
      const defaultMsg = isAr ? "تمت العملية بنجاح" : "Operation successful";
      toast.success(res?.data?.message || res?.message || defaultMsg);
      updateItem((s) => getId(s) === id, (s) => ({ ...s, isActive: !s.isActive }));
    } catch (err) {
      // Error handled globally
    }
  };

  // Edit Modal
  const [editModal, setEditModal] = useState({ open: false, staff: null });
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [editCodes, setEditCodes] = useState([]);
  const [editAvails, setEditAvails] = useState([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const openEdit = (s, e) => {
    e.stopPropagation();
    setEditForm({
      availabilityMode: s.availabilityMode ?? "FullWeek",
      excludedDay: s.excludedDay ?? "",
      firstName: s.firstName ?? splitEnLn(s.name)[0],
      firstNameAr: s.firstNameAr ?? splitEnLn(s.nameAr)[0],
      lastName: s.lastName ?? splitEnLn(s.name)[1],
      lastNameAr: s.lastNameAr ?? splitEnLn(s.nameAr)[1],
      email: s.email ?? "",
      instructorCode: s.instructorCode ?? s.code ?? "",
      typeKey: role === "ta" ? inferTaTypeKey(s) : "",
    });
    setEditCodes(getCourses(s).map((c) => c.courseCode ?? c));
    setEditAvails(getAvails(s).map((a) => ({
      dayOfWeek: a.dayOfWeek ?? "Sunday",
      startTime: normalizeTimeHHmm(a.startTime) || "08:00",
      endTime: normalizeTimeHHmm(a.endTime) || "10:00",
    })));
    setEditError(""); setEditModal({ open: true, staff: s });
  };
  const closeEdit = () => setEditModal({ open: false, staff: null });

  const handleEdit = async () => {
    setEditSaving(true);
    try {
      let instructorType = "Doctor";
      if (role === "ta") {
        const selectedType = taTypes.find((t) => t.key === editForm.typeKey);
        if (!selectedType) {
          setEditError("Type is required.");
          return;
        }
        instructorType = selectedType.en;
      }

      /** PUT contract: strings + availabilities + courseCodes (no password, no instructorTypeAr). */
      const body = {
        firstName: editForm.firstName.trim(),
        firstNameAr: editForm.firstNameAr.trim(),
        lastName: editForm.lastName.trim(),
        lastNameAr: editForm.lastNameAr.trim(),
        email: editForm.email.trim(),
        instructorCode: editForm.instructorCode.trim(),
        instructorType,
        availabilityMode: editForm.availabilityMode,
        excludedDay:
          editForm.availabilityMode === "FullWeekExcept"
            ? String(editForm.excludedDay ?? "").trim()
            : "",
        availabilities:
          editForm.availabilityMode === "Manual"
            ? editAvails.map((a) => ({
                dayOfWeek: String(a.dayOfWeek ?? "Sunday"),
                startTime: String(a.startTime ?? "08:00"),
                endTime: String(a.endTime ?? "10:00"),
              }))
            : [],
        courseCodes: editCodes.map((c) => String(c)),
      };

      const res = await updateSemesterStaffApi(semesterId, getId(editModal.staff), body);
      const isAr = localStorage.getItem("i18nextLng") === "ar";
      const defaultMsg = isAr ? "تم تعديل البيانات بنجاح" : "Staff updated successfully";
      toast.success(res?.data?.message || res?.message || defaultMsg);
      closeEdit();
      await reload();
    } catch (err) {
      // Error handled globally
    } finally { setEditSaving(false); }
  };

  // Add Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [addCodes, setAddCodes] = useState([]);
  const [addAvails, setAddAvails] = useState([]);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  const taTypes = [
    { key: "Assistant", en: "Assistant", ar: "مساعد" },
    { key: "Technical Assistant", en: "Technical Assistant", ar: "معيد" }
  ];

  const openAdd = () => {
    setAddForm({ ...EMPTY_ADD });
    setAddCodes([]); setAddAvails([]); setAddError(""); setAddModalOpen(true);
  };
  const closeAdd = () => setAddModalOpen(false);

  const handleAdd = async () => {
    setAddSaving(true);
    try {
      let instType = "Doctor", instTypeAr = "دكتور";
      if (role === "ta") {
        const selectedType = taTypes.find(t => t.key === addForm.typeKey);
        instType = selectedType.en;
        instTypeAr = selectedType.ar;
      }

      const res = await addSemesterStaffApi(semesterId, {
        firstName: addForm.firstName, firstNameAr: addForm.firstNameAr,
        lastName: addForm.lastName, lastNameAr: addForm.lastNameAr,
        email: addForm.email, password: addForm.password,
        instructorCode: addForm.instructorCode,
        instructorType: instType, instructorTypeAr: instTypeAr,
        availabilityMode: addForm.availabilityMode,
        excludedDay: addForm.availabilityMode === "FullWeekExcept" ? addForm.excludedDay : null,
        availabilities: addForm.availabilityMode === "Manual" ? addAvails : [],
        courseCodes: addCodes,
      });
      const isAr = localStorage.getItem("i18nextLng") === "ar";
      const defaultMsg = isAr ? "تم إضافة العضو بنجاح" : "Staff added successfully";
      toast.success(res?.data?.message || res?.message || defaultMsg);
      closeAdd();
      await reload();
    } catch (err) {
      // Error handled globally
    } finally { setAddSaving(false); }
  };

  // Transfer Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferSaving, setTransferSaving] = useState(false);
  const [transferError, setTransferError] = useState("");

  const handleTransfer = async () => {
    setTransferSaving(true);
    try {
      const res = await cloneSemesterStaffApi(transferTargetId, {
        fromSemesterId: semesterId,
        instructorIds: selected
      });
      const isAr = localStorage.getItem("i18nextLng") === "ar";
      const defaultMsg = isAr ? "تم نقل الأعضاء بنجاح" : "Staff transferred successfully";
      toast.success(res?.data?.message || res?.message || defaultMsg);
      setTransferModalOpen(false);
      clearAll();
    } catch (err) {
      // Error handled globally
    } finally { setTransferSaving(false); }
  };

  // Clear Data Modal
  const [clearDataModalOpen, setClearDataModalOpen] = useState(false);
  const [clearDataSaving, setClearDataSaving] = useState(false);
  const [clearDataError, setClearDataError] = useState("");

  const handleClearData = async () => {
    setClearDataSaving(true);
    try {
      const res = await clearSemesterStaffApi(semesterId, {
        instructorIds: selected
      });
      const isAr = localStorage.getItem("i18nextLng") === "ar";
      const defaultMsg = isAr ? "تم مسح البيانات بنجاح" : "Data cleared successfully";
      toast.success(res?.data?.message || res?.message || defaultMsg);
      setClearDataModalOpen(false);
      clearAll();
      await reload();
    } catch (err) {
      // Error handled globally
    } finally { setClearDataSaving(false); }
  };

  return {
    availModes,
    staff, isLoading, search, setSearch, page, setPage, totalCount, totalPages, from, to, pageNumbers,
    selected, toggle, toggleAll, clearAll, isSelected, allSelected, allIds,
    targetTerms, handleToggle,
    editModal, editForm, setEditForm, editCodes, setEditCodes, editAvails, setEditAvails, editSaving, editError, openEdit, closeEdit, handleEdit,
    addModalOpen, addForm, setAddForm, addCodes, setAddCodes, addAvails, setAddAvails, addSaving, addError, openAdd, closeAdd, handleAdd, taTypes,
    transferModalOpen, setTransferModalOpen, transferTargetId, setTransferTargetId, transferSaving, transferError, handleTransfer,
    clearDataModalOpen, setClearDataModalOpen, clearDataSaving, clearDataError, handleClearData
  };
}
