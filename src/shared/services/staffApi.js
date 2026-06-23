import api from "@/shared/lib/api";

export const fetchStaffApi = (page = 1, limit = 6, search = "", sortColumn = "", sortDirection = "") =>
    api.get("/Instructors/all-with-availability", {
        params: {
            PageNumber: page,
            PageSize: limit,
            ...(search && { SearchValue: search }),
            ...(sortColumn && { SortColumn: sortColumn }),
            ...(sortDirection && { SortDirection: sortDirection }),
        }
    });

export const addStaffApi = (body) => api.post("/Instructors", body);
export const updateStaffApi = (body) => api.put("/Instructors", body);
export const toggleStaffApi = (id) => api.put(`/Instructors/toggle/${id}`);

export const uploadImageApi = (id, file) => {
    const fd = new FormData();
    if (file) {
        fd.append("image", file);
    } else {
        fd.append("image", new Blob([]));
    }
    return api.put(`/Instructors/${id}/image`, fd);
};