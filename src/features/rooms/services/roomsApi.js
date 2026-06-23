import api from "@/shared/lib/api";

export const fetchRoomsApi = (page = 1, limit = 6, search = "", sortColumn = "", sortDirection = "") =>
    api.get("/Rooms", {
        params: {
            PageNumber: page,
            PageSize: limit,
            ...(search && { SearchValue: search }),
            ...(sortColumn && { SortColumn: sortColumn }),
            ...(sortDirection && { SortDirection: sortDirection }),
        }
    });

export const addRoomApi = (body) => api.post("/Rooms", body);
export const updateRoomApi = (body) => api.put("/Rooms", body);
export const toggleRoomApi = (roomId) => api.put(`/Rooms/toggle-status/${roomId}`);
