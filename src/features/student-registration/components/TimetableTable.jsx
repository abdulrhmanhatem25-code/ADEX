import React, { useMemo } from "react";
import { Clock, Loader2, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";
import { dayShort } from "../utils/registrationHelpers";

// ── خريطة أيام الأسبوع (إنجليزي → رقم عمود في الشبكة) ───────────────────────
const DAY_TO_INDEX = {
    Saturday: 0,
    Sunday: 1,
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
};

// ── تحويل "HH:MM" إلى رقم ساعة ───────────────────────────────────────────────
function parseHour(timeStr) {
    if (!timeStr) return 9;
    const [h, m] = timeStr.split(":");
    return parseInt(h, 10) + (parseInt(m || "0", 10) / 60);
}

// ── تنسيق الوقت لعرض في بطاقة الحصة ─────────────────────────────────────────
function formatTimeLabel(start, end) {
    const fmt = (timeVal) => {
        const h = Math.floor(timeVal);
        const m = Math.round((timeVal - h) * 60);
        const period = h < 12 ? "AM" : "PM";
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const mm = m === 0 ? "00" : m.toString().padStart(2, "0");
        return `${h12}:${mm} ${period}`;
    };
    return `${fmt(start)} - ${fmt(end)}`;
}

export default function TimetableTable({ timetable, onDrop, droppingId, ttLoading, pending = [], onRemovePending }) {
    const enrollments = timetable?.enrollments ?? [];

    const sessions = useMemo(() => {
        const result = [];
        enrollments.forEach((enrollment, ei) => {
            (enrollment.sessions || enrollment.sections || []).forEach((sec, si) => {
                const startHour = parseHour(sec.startTime);
                const endHour = parseHour(sec.endTime);
                result.push({
                    id: `std-${ei}-${si}`,
                    enrollmentId: enrollment.enrollmentId,
                    dayIndex: DAY_TO_INDEX[sec.day] ?? 0,
                    startHour,
                    endHour,
                    timeRange: formatTimeLabel(startHour, endHour),
                    courseName: enrollment.courseName,
                    sessionLabel: `${sec.sessionType} — ${sec.groupName || ""}`,
                    instructorName: sec.instructorName,
                    locationText: sec.room || "TBA",
                    selected: sec.sessionType === "Lecture",
                });
            });
        });

        // Merge pending selections as preview sessions
        pending.forEach((p, pi) => {
            if (!p.day) return;
            result.push({
                id: `pending-${pi}`,
                sectionId: p.sectionId,
                dayIndex: DAY_TO_INDEX[p.day] ?? 0,
                startHour: p.startHour,
                endHour: p.endHour,
                timeRange: formatTimeLabel(p.startHour, p.endHour),
                courseName: p.courseName,
                sessionLabel: `${p.type} — ${p.sectionName || ""}`,
                instructorName: p.instructorName || "",
                locationText: p.schedule?.room || "TBA",
                selected: p.type === "Lecture",
                isPending: true,
            });
        });

        return result;
    }, [enrollments, pending]);

    const LegendBadge = ({ color, label }) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
            />
            {label}
        </span>
    );

    return (
        <div className="rounded-2xl border border-ui-border bg-ui-bg overflow-hidden shadow-sm">
            <div className="flex items-center flex-wrap justify-between gap-2 px-4 py-2.5 bg-ui-table-header border-b border-ui-border">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-ui-text-subtle" />
                    <h2 className="text-sm font-bold text-ui-text">Current Enrolled Courses</h2>
                    {ttLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-ui-text-subtle ml-auto" />}
                </div>
                <div className="flex items-center gap-4">
                    <LegendBadge color="#5a8ec4" label="Lecture" />
                    <LegendBadge color="#f9cfe4" label="Lab / Section" />
                    {pending.length > 0 && <LegendBadge color="#6ee7b7" label="Pending" />}
                </div>
            </div>

            {enrollments.length === 0 && pending.length === 0 ? (
                <p className="text-xs text-ui-text-subtle italic px-4 py-3">No courses currently enrolled.</p>
            ) : (
                <div 
                    className="overflow-x-auto no-scrollbars p-2"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    <style>{`
                        .no-scrollbars::-webkit-scrollbar { display: none; }
                    `}</style>
                    <WeeklyScheduleGrid 
                        sessions={sessions}
                        compact={true}
                        renderAction={(s) => {
                            if (s.isPending) {
                                return (
                                    <button
                                        onClick={() => onRemovePending?.(s.sectionId)}
                                        className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 border border-rose-200 text-rose-500 hover:bg-rose-200 transition"
                                        title="Remove from pending"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                );
                            }
                            const isDropping = droppingId === s.enrollmentId;
                            return (
                                <button
                                    onClick={() => onDrop(s.enrollmentId)}
                                    disabled={isDropping}
                                    className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 border border-rose-200 text-rose-500 hover:bg-rose-200 transition disabled:opacity-50"
                                    title="Drop this course"
                                >
                                    {isDropping ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                </button>
                            );
                        }}
                    />
                </div>
            )}
        </div>
    );
}
