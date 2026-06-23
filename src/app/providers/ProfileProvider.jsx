import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { fetchProfileApi, getFullImageUrl } from "@/shared/services/profileApi";
import { useAuth } from "@/app/providers/AuthProvider";

const ProfileContext = createContext(null);

/**
 * ProfileProvider — independent domain layer for user profile data.
 *
 * Responsible for:
 *   - User profile data (name, email, phone, image, student/instructor info)
 *   - UI-related user metadata (display name, avatar URL)
 *   - Domain IDs (currentStudentId, currentInstructorId)
 *
 * Does NOT affect authentication state.
 * Must be nested inside AuthProvider (reads isAuthenticated).
 */
export const ProfileProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // ── Fetch detailed profile (instructor/student info, image, etc.) ────────
    const refreshProfile = useCallback(async () => {
        setIsProfileLoading(true);
        try {
            const res = await fetchProfileApi();
            const data = res.data;
            // Resolve nested image URLs from response shape
            if (data?.instructor?.imageUrl) {
                data.instructor.imageUrl = getFullImageUrl(data.instructor.imageUrl);
            }
            if (data?.student?.imageUrl) {
                data.student.imageUrl = getFullImageUrl(data.student.imageUrl);
            }
            setUserProfile(data);
        } catch (err) {
            console.error("Failed to load user profile", err);
        } finally {
            setIsProfileLoading(false);
        }
    }, []);

    // ── Auto-fetch profile when authentication state changes ─────────────────
    useEffect(() => {
        if (isAuthenticated) {
            refreshProfile();
        } else {
            // Clear profile data on logout
            setUserProfile(null);
        }
    }, [isAuthenticated, refreshProfile]);

    // ── Derived profile helpers ──────────────────────────────────────────────
    const profileHelpers = useMemo(() => {
        // IDs — always from profile nested objects (single source of truth)
        const currentStudentId    = userProfile?.student?.studentId    ?? null;
        const currentInstructorId = userProfile?.instructor?.instructorId ?? null;

        // Image — instructor takes priority, then student
        const profileImageUrl = userProfile?.instructor?.imageUrl
            ?? userProfile?.student?.imageUrl
            ?? null;

        // Display name — prefer profile fullName, then Auth/me name, then fallback
        const profileDisplayName = userProfile?.fullName
            || userProfile?.instructor?.title
            || (user ? `${user.firstName} ${user.lastName}` : null)
            || "User";

        return {
            currentStudentId,
            currentInstructorId,
            profileImageUrl,
            profileDisplayName,
        };
    }, [userProfile, user]);

    return (
        <ProfileContext.Provider value={{ userProfile, refreshProfile, isProfileLoading, ...profileHelpers }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};
