import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useProfile } from "@/app/providers/ProfileProvider";
import { getAdvisorStudents } from "@/shared/services/advisorApi";
import { parseResponse, applyFilter } from "../utils/advisorHelpers";

export default function useAdvisorStudents() {
    const { isSuperAdmin } = useAuth();
    const { currentInstructorId } = useProfile();
    // SuperAdmin starts on the overview; clicking an advisor stores it here
    const [selectedAdvisor, setSelectedAdvisor] = useState(null);

    // The actual instructor id to query:
    // - SuperAdmin: from the selected advisor card
    // - Others: from their own profile
    const activeInstructorId = isSuperAdmin
        ? selectedAdvisor?.instructorId ?? null
        : currentInstructorId;

    const [raw, setRaw] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdvisorStudents(activeInstructorId);
            setRaw(res.data || {});
        } catch (err) {
            console.error("Advisor students fetch failed", err);
            setError("Failed to load students. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // For SuperAdmin, only fetch when an advisor is selected
        if (isSuperAdmin && !selectedAdvisor) return;
        fetchData();
        // Reset filters when switching advisors
        setFilter("all");
        setSearch("");
    }, [activeInstructorId, isSuperAdmin, selectedAdvisor]);

    const { students, summary } = useMemo(() => parseResponse(raw), [raw]);

    const filterCounts = useMemo(() => ({
        all: students.length,
        finished: students.filter((s) => s.isRegistrationFinished).length,
        pending: students.filter((s) => !s.isRegistrationFinished).length,
        approved: students.filter((s) => s.isAdvisorApproved).length,
        notApproved: students.filter((s) => !s.isAdvisorApproved).length,
        paid: students.filter((s) => s.hasPaidFees).length,
        notPaid: students.filter((s) => !s.hasPaidFees).length,
    }), [students]);

    const filtered = useMemo(() => {
        const base = applyFilter(students, filter);
        if (!search.trim()) return base;
        const q = search.toLowerCase();
        return base.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.studentCode.includes(q)
        );
    }, [students, filter, search]);

    return {
        isSuperAdmin,
        selectedAdvisor,
        setSelectedAdvisor,
        isLoading,
        error,
        filter,
        setFilter,
        search,
        setSearch,
        students,
        summary,
        filterCounts,
        filtered,
        fetchData
    };
}
