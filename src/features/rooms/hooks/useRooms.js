import { useState, useEffect } from "react";
import { fetchRoomsApi, addRoomApi, updateRoomApi, toggleRoomApi } from "@/features/rooms/services/roomsApi";
import { fetchRoomTypesApi, fetchRoomAvailabilityModesApi, fetchWeekDaysApi } from "@/shared/services/metaApi";
import useListPage from "@/shared/hooks/useListPage";
import toast from "@/shared/lib/toast";

export default function useRooms(isRtl) {
    const [roomTypesData, setRoomTypesData] = useState([]);
    const [availabilityModesData, setAvailabilityModesData] = useState([]);
    const [daysOfWeekData, setDaysOfWeekData] = useState([]);

    useEffect(() => {
        Promise.all([
            fetchRoomTypesApi(),
            fetchRoomAvailabilityModesApi(),
            fetchWeekDaysApi()
        ]).then(([rt, am, dw]) => {
            setRoomTypesData(rt.data || []);
            setAvailabilityModesData(am.data || []);
            setDaysOfWeekData(dw.data || []);
        }).catch(err => console.error("Failed to fetch meta:", err));
    }, []);

    // Derived Constants
    const ROOM_TYPES = roomTypesData.map(m => ({
        value: m.name,
        name: isRtl ? m.nameAr : m.name
    }));

    const AVAILABILITY_MODES = availabilityModesData.map(m => ({
        value: m.value,
        name: isRtl ? m.nameAr : m.name,
        key: m.name
    }));

    const DAYS_OF_WEEK = daysOfWeekData.map(m => ({
        value: m.value,
        name: isRtl ? m.nameAr : m.name,
        key: m.name
    }));

    const EMPTY_AVAILABILITY = { day: 0, startTime: "09:00", endTime: "17:00" };

    const list = useListPage({ fetchFn: fetchRoomsApi, limit: 6 });
    const [expandedId, setExpandedId] = useState(null);
    const toggleExpand = (id) => setExpandedId(prev => (prev === id ? null : id));

    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const emptyForm = () => ({
        roomId: "",
        roomNumber: "",
        roomType: "",
        roomTypeAr: "",
        building: "",
        buildingAr: "",
        capacity: "",
        isActive: true,
        availabilityMode: 0,
        availabilities: [],
    });

    const [form, setForm] = useState(emptyForm());

    const handleToggle = async (room) => {
        const roomId = room.roomId ?? room.id;
        try {
            const res = await toggleRoomApi(roomId);
            const defaultMsg = isRtl ? "تمت العملية بنجاح" : "Operation successful";
            toast.success(res?.message || res?.data?.message || (res?.status === 204 ? defaultMsg : defaultMsg));
            list.updateItem(
                r => (r.roomId ?? r.id) === roomId,
                r => ({ ...r, isActive: !r.isActive })
            );
        } catch (err) {
            // Error toast handled globally
        }
    };

    const openAddModal = () => {
        setForm(emptyForm());
        setIsEditing(false);
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (room) => {
        const roomId = room.roomId ?? room.id;
        const modeObj = AVAILABILITY_MODES.find(m => m.key === room.availabilityMode) ?? AVAILABILITY_MODES[0] ?? { value: 0 };
        const avails = (room.roomAvailabilities ?? []).map(av => {
            const dayObj = DAYS_OF_WEEK.find(d => d.key === av.day) ?? DAYS_OF_WEEK[0] ?? { value: 0 };
            return {
                day: dayObj.value,
                startTime: av.startTime?.slice(0, 5) ?? "09:00",
                endTime: av.endTime?.slice(0, 5) ?? "17:00",
            };
        });
        setForm({
            roomId: roomId ?? "",
            roomNumber: room.roomNumber ?? "",
            roomType: room.roomType ?? "",
            roomTypeAr: room.roomTypeAr ?? "",
            building: room.building ?? "",
            buildingAr: room.buildingAr ?? "",
            capacity: String(room.capacity ?? ""),
            isActive: room.isActive ?? true,
            availabilityMode: modeObj.value,
            availabilities: avails,
        });
        setIsEditing(true);
        setEditingId(roomId);
        setModalOpen(true);
    };

    const closeModal = () => { setModalOpen(false); setEditingId(null); };

    const addAvailability = () =>
        setForm(f => ({ ...f, availabilities: [...f.availabilities, { ...EMPTY_AVAILABILITY }] }));

    const removeAvailability = (idx) =>
        setForm(f => ({ ...f, availabilities: f.availabilities.filter((_, i) => i !== idx) }));

    const updateAvailability = (idx, field, val) =>
        setForm(f => ({
            ...f,
            availabilities: f.availabilities.map((av, i) => i === idx ? { ...av, [field]: val } : av),
        }));

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const avails = form.availabilities.map(av => ({
                day: Number(av.day),
                startTime: av.startTime,
                endTime: av.endTime,
            }));

            if (!isEditing) {
                const res = await addRoomApi({
                    roomNumber: form.roomNumber,
                    roomType: form.roomType,
                    roomTypeAr: form.roomTypeAr,
                    building: form.building,
                    buildingAr: form.buildingAr,
                    capacity: Number(form.capacity),
                    availabilityMode: form.availabilityMode,
                    availabilities: avails,
                });
                const defaultMsg = isRtl ? "تم إضافة الغرفة بنجاح" : "Room added successfully";
                toast.success(res?.message || res?.data?.message || (res?.status === 204 ? defaultMsg : defaultMsg));
            } else {
                const res = await updateRoomApi({
                    roomId: editingId,
                    roomNumber: form.roomNumber,
                    roomType: form.roomType,
                    roomTypeAr: form.roomTypeAr,
                    capacity: Number(form.capacity),
                    building: form.building,
                    buildingAr: form.buildingAr,
                    isActive: form.isActive,
                    availabilityMode: form.availabilityMode,
                    availabilities: avails,
                });
                const defaultMsg = isRtl ? "تم تعديل الغرفة بنجاح" : "Room updated successfully";
                toast.success(res?.message || res?.data?.message || (res?.status === 204 ? defaultMsg : defaultMsg));
                console.log("updated:", res);
            }
            closeModal();
            list.reload();
        } catch (err) {
            // Error toast handled globally by api.js
        }
        setIsSaving(false);
    };

    const isCustomMode = form.availabilityMode === 2;

    return {
        list,
        ROOM_TYPES,
        AVAILABILITY_MODES,
        DAYS_OF_WEEK,
        expandedId,
        toggleExpand,
        handleToggle,
        modalOpen,
        isEditing,
        isSaving,
        form,
        setForm,
        openAddModal,
        openEditModal,
        closeModal,
        addAvailability,
        removeAvailability,
        updateAvailability,
        handleSave,
        isCustomMode
    };
}
