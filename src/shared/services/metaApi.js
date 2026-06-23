import api from "@/shared/lib/api";

export const fetchRoomTypesApi = () => api.get("/Meta/room-types");
export const fetchRoomAvailabilityModesApi = () => api.get("/Meta/room-availability-modes");
export const fetchWeekDaysApi = () => api.get("/Meta/week-days");
