import api from "@/shared/lib/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    // Add slash if missing
    return url.startsWith("/") ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
};

// GET /api/Profiles
// Response: { id, email, fullName, fullNameAr, phoneNumber, roles, instructor, student }
export const fetchProfileApi = () => api.get("/Profiles");


// PATCH /api/Profiles/info
// Body: { fullName, fullNameAr, email, phoneNumber }
// Partial update — only send the fields that changed
export const updateProfileApi = (body) => api.patch("/Profiles/info", body);

// PUT /api/Profiles/image
// Body: FormData with field "Image" (binary file)
export const updateProfileImageApi = (file) => {
    const fd = new FormData();
    if (file) {
        fd.append("Image", file);
    } else {
        // Send an empty Blob simulating a file to bypass validation
        fd.append("Image", new Blob([]));
    }
    return api.put("/Profiles/image", fd);
};

// POST /api/Profiles/change-password
// Body: { currentPassword, newPassword }
export const changePasswordApi = (body) => api.post("/Profiles/change-password", body);
