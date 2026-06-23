import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock } from "lucide-react";

export default function AdvisorStatusBadge({ done, doneLabel, pendingLabel }) {
    const { t } = useTranslation();
    return done ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border" style={{ background: "var(--adv-status-done-bg)", color: "var(--adv-status-done-text)", borderColor: "var(--adv-status-done-border)" }}>
            <CheckCircle2 className="h-3 w-3" />{doneLabel ?? t("advisor.finished")}
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border" style={{ background: "var(--adv-status-pending-bg)", color: "var(--adv-status-pending-text)", borderColor: "var(--adv-status-pending-border)" }}>
            <Clock className="h-3 w-3" />{pendingLabel ?? t("advisor.pending")}
        </span>
    );
}
