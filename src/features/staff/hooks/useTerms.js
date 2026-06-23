import { useState, useEffect, useCallback } from "react";
import { fetchSemestersApi, addSemesterApi, deleteSemesterApi, toggleSemesterApi } from "../services/semesterApi";
import toast from "@/shared/lib/toast";

const LS_KEY = "adex_selected_semester_id";

/**
 * Manages the semesters (terms) list with localStorage caching.
 * Returns: { terms, isLoading, error, reload, addTerm, deleteTerm,
 *            persistedSemesterId, clearPersistedSemester }
 */
export default function useTerms() {
    const [terms, setTerms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // ── Persisted selection ───────────────────────────────────────────────
    const [persistedSemesterId, setPersistedSemesterId] = useState(() => {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? Number(raw) : null;
    });

    const persistSelection = useCallback((semesterId) => {
        if (semesterId) {
            localStorage.setItem(LS_KEY, String(semesterId));
        } else {
            localStorage.removeItem(LS_KEY);
        }
        setPersistedSemesterId(semesterId ?? null);
    }, []);

    const clearPersistedSemester = useCallback(() => persistSelection(null), [persistSelection]);

    // ── Fetch terms ───────────────────────────────────────────────────────
    const reload = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetchSemestersApi();
            setTerms(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError("Failed to load semesters.");
            console.error("useTerms fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { reload(); }, [reload]);

    // ── Add term ──────────────────────────────────────────────────────────
    const addTerm = useCallback(async (body) => {
        const res = await addSemesterApi(body);
        const isAr = localStorage.getItem("i18nextLng") === "ar";
        const defaultMsg = isAr ? "تم إضافة الفصل الدراسي بنجاح" : "Semester added successfully";
        toast.success(res?.data?.message || res?.message || defaultMsg);
        await reload();
    }, [reload]);

    // ── Delete term ───────────────────────────────────────────────────────
    const deleteTerm = useCallback(async (semesterId) => {
        try {
            const res = await deleteSemesterApi(semesterId);
            const isAr = localStorage.getItem("i18nextLng") === "ar";
            const defaultMsg = isAr ? "تم حذف الفصل الدراسي بنجاح" : "Semester deleted successfully";
            toast.success(res?.data?.message || res?.message || defaultMsg);
        } catch (err) {
            // Error toast handled globally
        }
        // Clear persisted selection if the deleted term was selected
        if (persistedSemesterId === semesterId) {
            clearPersistedSemester();
        }
        setTerms((prev) => prev.filter((t) => t.semesterId !== semesterId));
    }, [persistedSemesterId, clearPersistedSemester]);

    // ── Toggle active status ──────────────────────────────────────────────
    const toggleTerm = useCallback(async (semesterId) => {
        try {
            const res = await toggleSemesterApi(semesterId);
            const isAr = localStorage.getItem("i18nextLng") === "ar";
            const defaultMsg = isAr ? "تمت العملية بنجاح" : "Operation successful";
            toast.success(res?.data?.message || res?.message || defaultMsg);
            setTerms((prev) => prev.map(t => 
                t.semesterId === semesterId ? { ...t, isActive: !t.isActive } : t
            ));
        } catch (err) {
            // Error toast handled globally
        }
    }, []);

    return {
        terms, isLoading, error, reload,
        addTerm, deleteTerm, toggleTerm,
        persistedSemesterId, persistSelection, clearPersistedSemester,
    };
}
