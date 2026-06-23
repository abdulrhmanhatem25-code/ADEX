import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, ShieldCheck, Loader2 } from "lucide-react";
import AdvisorStatusBadge from "./AdvisorStatusBadge";
import { approveEnrollmentApi } from "@/shared/services/studentsApi";
import toast from "@/shared/lib/toast";

export default function StudentRow({ student, index, onRefresh }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { name, studentCode, studentId, isRegistrationFinished, isAdvisorApproved, hasPaidFees, enrolledCredits, allowedHours } = student;

    const [approving, setApproving] = useState(false);

    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    const avatarColors = [
        ["oklch(93% 0.06 255)", "oklch(40% 0.14 255)"],
        ["oklch(94% 0.06 145)", "oklch(40% 0.12 145)"],
        ["oklch(93% 0.06 300)", "oklch(40% 0.14 300)"],
        ["oklch(94% 0.06 60)", "oklch(40% 0.12 60)"],
        ["oklch(94% 0.06 170)", "oklch(38% 0.11 170)"],
    ];
    const [bg, txt] = avatarColors[index % avatarColors.length];

    const creditPct = allowedHours > 0 ? Math.min((enrolledCredits / allowedHours) * 100, 100) : 0;

    const handleRowClick = () => {
        // Pass the full student object via state so StudentRegistration selects them instantly
        // regardless of which page they're on in the paginated list
        navigate(`/student-registration`, {
            state: { student: student }
        });
    };

    const handleApprove = async (e) => {
        e.stopPropagation(); // prevent row click navigation

        // Ensure we send the actual ID, not the code. Check both studentId and id just in case.
        const actualId = studentId || student.id;

        if (!actualId || approving) {
            console.error("Cannot approve: Student ID is missing from the API response.", student);
            return;
        }

        setApproving(true);
        try {
            const res = await approveEnrollmentApi(actualId);
            // Show the backend response message as a success toast
            toast.success(res?.data?.message);
            // Delay refresh so toast is visible before the table re-renders
            if (onRefresh) setTimeout(() => onRefresh(), 1500);
        } catch {
            // Error toast is handled globally by api.js interceptor
        } finally {
            setApproving(false);
        }
    };

    return (
        <tr
            className="group border-b border-ui-border last:border-0 hover:bg-ui-bg-hover transition-colors cursor-pointer"
            onClick={handleRowClick}
        >
            {/* Avatar + Name */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div
                        className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: bg, color: txt }}
                    >
                        {initials}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-ui-text leading-tight">{name}</p>
                        <p className="text-[11px] text-ui-text-subtle"># {studentCode}</p>
                    </div>
                </div>
            </td>

            {/* Credits */}
            <td className="px-4 py-3 hidden sm:table-cell">
                <div className="flex items-center gap-2 min-w-[90px]">
                    <div className="flex-1 h-1.5 rounded-full bg-ui-bg-hover overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${creditPct}%`,
                                background: "var(--adv-filter-active-bg)",
                            }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-ui-text-muted whitespace-nowrap">
                        {enrolledCredits}/{allowedHours}
                    </span>
                </div>
            </td>

            <td className="px-4 py-3 text-center">
                <AdvisorStatusBadge done={isRegistrationFinished} doneLabel={t("advisor.finished")} pendingLabel={t("advisor.pending")} />
            </td>
            <td className="px-4 py-3 text-center hidden md:table-cell">
                <AdvisorStatusBadge done={isAdvisorApproved} doneLabel={t("advisor.approved")} pendingLabel={t("advisor.awaiting")} />
            </td>
            <td className="px-4 py-3 text-center hidden lg:table-cell">
                {hasPaidFees ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border" style={{ background: "var(--adv-status-paid-bg)", color: "var(--adv-status-paid-text)", borderColor: "var(--adv-status-paid-border)" }}>
                        <CheckCircle2 className="h-3 w-3" /> {t("advisor.paid")}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border" style={{ background: "var(--adv-status-not-bg)", color: "var(--adv-status-not-text)", borderColor: "var(--adv-status-not-border)" }}>
                        <XCircle className="h-3 w-3" /> {t("advisor.unpaid")}
                    </span>
                )}
            </td>

            {/* Approve action */}
            <td className="px-4 py-3 text-center">
                <button
                    type="button"
                    onClick={handleApprove}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all shadow-sm ${
                        isAdvisorApproved
                            ? "bg-sky-500 hover:bg-sky-600"
                            : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                >
                    {approving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isAdvisorApproved ? (
                        <CheckCircle2 className="h-3 w-3" />
                    ) : (
                        <ShieldCheck className="h-3 w-3" />
                    )}
                    {isAdvisorApproved ? t("advisor.approved") : t("advisor.approve")}
                </button>
            </td>
        </tr>
    );
}

