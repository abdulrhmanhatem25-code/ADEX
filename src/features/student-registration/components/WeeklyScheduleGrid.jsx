import React from "react";
import { cn } from "@/shared/lib/utils";
import ScheduleSessionBlock from "./ScheduleSessionBlock";
import ConflictSessionBlock from "./ConflictSessionBlock";

/** أيام الأسبوع (من السبت للخميس) */
export const SCHEDULE_DAYS = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
];

/** صفوف الساعات من 8 لـ 20 لتشمل فترات أطول */
export const SCHEDULE_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17,18,19];

/**
 * الكارت يبدأ بعد خط نص الساعة + inset فوق؛ الارتفاع = مدة الحصة بالبكسل − inset فوق وتحت.
 */
function sessionBlockLayout(startHour, endHour, firstHourInGrid) {
    const top = `calc(var(--slot-height) * ${startHour - firstHourInGrid} + var(--slot-height) / 2 + var(--card-inset))`;
    const height = `calc(var(--slot-height) * ${endHour - startHour} - 2 * var(--card-inset))`;
    return { top, height };
}

function formatHourLabel(hour) {
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return `12:00 PM`;
    return `${hour - 12}:00 PM`;
}

/** صف ساعة في منطقة الجدول فقط: خط نص ساعة متقطع + خط صلب بين الساعات */
function HourGridRow() {
    return (
        <div
            className="flex flex-col shrink-0 box-border border-b border-solid border-ui-border bg-ui-bg"
            style={{ height: "var(--slot-height)" }}
        >
            <div className="flex-1 min-h-0 border-b border-dotted border-ui-border" />
            <div className="flex-1 min-h-0" />
        </div>
    );
}

/**
 * WeeklyScheduleGrid
 * ──────────────────
 * عمود الوقت: بدون خط نص ساعة — الرقم في منتصف الخلية؛ الخط المتقطع يظهر في أعمدة الأيام فقط.
 * الكارت: محاذاة من خط نص الساعة + مسافة CARD_INSET_PX من فوق وتحت ويمين وشمال.
 */
export default function WeeklyScheduleGrid({ sessions = [], renderAction, compact = false, className }) {
    const bodyHeight = `calc(var(--slot-height) * ${SCHEDULE_HOURS.length})`;

    return (
        <div className={cn(
            "schedule-grid-root rounded-xl border border-ui-border bg-ui-bg overflow-hidden shadow-sm min-w-[500px] lg:min-w-0",
            compact && "compact-grid",
            className
        )}>
            <style>{`
                .schedule-grid-root {
                    --slot-height: 48px;
                    --card-inset: 2px;
                }
                @media (min-width: 1024px) {
                    .schedule-grid-root {
                        --slot-height: 64px;
                        --card-inset: 5px;
                    }
                }
                .schedule-grid-root.compact-grid {
                    --slot-height: 34px !important;
                    --card-inset: 2px !important;
                }
            `}</style>

            <div className="flex border-b border-ui-border bg-ui-bg-hover">
                <div className="w-10 lg:w-[4.75rem] shrink-0 border-r border-ui-border bg-ui-bg-hover" />
                {SCHEDULE_DAYS.map((d) => (
                    <div
                        key={d}
                        className="flex-1 min-w-0 py-1 lg:py-2 px-0.5 lg:px-1 text-center text-[9px] lg:text-[10px] font-bold text-ui-text border-r border-ui-border last:border-r-0 leading-tight"
                    >
                        <span className="lg:hidden">{d.slice(0, 3)}</span>
                        <span className="hidden lg:inline">{d}</span>
                    </div>
                ))}
            </div>

            <div className="flex">
                {/* عمود الأوقات — خلفية صلبة، رقم في المنتصف، مفيش خط متقطع يقطع الرقم */}
                <div
                    className="w-10 lg:w-[4.75rem] shrink-0 border-r border-ui-border bg-ui-bg-hover flex flex-col z-[2]"
                    style={{ height: bodyHeight }}
                >
                    {SCHEDULE_HOURS.map((hour) => (
                        <div
                            key={hour}
                            className="flex shrink-0 items-center justify-center border-b border-solid border-ui-border bg-ui-bg-hover px-0.5 lg:px-1 box-border"
                            style={{ height: "var(--slot-height)" }}
                        >
                            <span className="text-[8px] lg:text-[10px] font-bold text-ui-text-muted text-center leading-none">
                                {formatHourLabel(hour)}
                            </span>
                        </div>
                    ))}
                </div>

                {SCHEDULE_DAYS.map((dayLabel, dayIndex) => (
                    <div
                        key={dayLabel}
                        className="flex-1 min-w-0 relative border-r border-ui-border last:border-r-0 bg-ui-bg z-[1]"
                        style={{ height: bodyHeight }}
                    >
                        {SCHEDULE_HOURS.map((hour) => (
                            <HourGridRow key={hour} />
                        ))}

                        {(() => {
                            const daySessions = sessions.filter((s) => s.dayIndex === dayIndex);
                            
                            // تجميع الحصص اللي ليها نفس وقت البداية والنهاية
                            const groupedSessions = {};
                            daySessions.forEach(s => {
                                const key = `${s.startHour}-${s.endHour}`;
                                if (!groupedSessions[key]) {
                                    groupedSessions[key] = [];
                                }
                                groupedSessions[key].push(s);
                            });

                            return Object.values(groupedSessions).map((group, idx) => {
                                const s = group[0]; // هناخد أبعاد أول حصة لأنهم نفس الوقت
                                const firstHour = SCHEDULE_HOURS[0];
                                const { top, height } = sessionBlockLayout(
                                    s.startHour,
                                    s.endHour,
                                    firstHour
                                );

                                // لو مفيش تعارض، اعرض حصة عادية
                                    if (group.length === 1) {
                                    const selected = s.selected !== undefined ? s.selected : s.variant !== "pink";
                                    return (
                                        <ScheduleSessionBlock
                                            key={s.id}
                                            timeRange={s.timeRange}
                                            courseName={s.courseName}
                                            sessionLabel={s.sessionLabel}
                                            instructorName={s.instructorName}
                                            locationText={s.locationText}
                                            selected={selected}
                                            isPending={!!s.isPending}
                                            className="absolute z-[1] overflow-hidden rounded-[3px]"
                                            style={{
                                                top,
                                                height,
                                                left: "var(--card-inset)",
                                                right: "var(--card-inset)",
                                            }}
                                            actionElement={renderAction ? renderAction(s) : null}
                                            compact={compact}
                                        />
                                    );
                                }

                                // في حالة وجود تعارض (أكتر من حاجة في نفس الوقت)
                                return (
                                    <ConflictSessionBlock
                                        key={`conflict-${dayIndex}-${idx}`}
                                        sessions={group}
                                        className="absolute z-[2] overflow-hidden rounded-[3px] shadow-md border border-ui-border bg-ui-bg flex flex-col transition-all"
                                        style={{
                                            top,
                                            height,
                                            left: "var(--card-inset)",
                                            right: "var(--card-inset)",
                                        }}
                                    />
                                );
                            });
                        })()}
                    </div>
                ))}
            </div>

            {sessions.length === 0 && (
                <p className="sr-only">Weekly schedule grid has no sessions yet.</p>
            )}
        </div>
    );
}
