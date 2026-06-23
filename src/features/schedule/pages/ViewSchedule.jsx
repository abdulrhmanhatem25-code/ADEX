import React, { useState, useCallback } from "react";
import { 
  fetchGeneratedSchedulesApi,
} from "@/features/schedule/services/scheduleApi";
import { 
  ChevronDown, Loader2, Calendar, Users, BookOpen, FlaskConical, 
  MapPin, CheckCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import {
  SCHEDULE_GRID_DAYS as DAYS,
  normalizeGridDay,
  normalizeSessionKind,
  parseGeneratedTime,
  normalizeGeneratedSchedulesPayload,
} from "@/features/schedule/utils/generatedSchedule";

// ── Static Config ─────────────────────────────────────────────
const LEVELS = [1, 2, 3, 4];

// Extract unique sorted times from group data
function extractTimes(group) {
  const set = new Set();
  (group?.courses ?? []).forEach(course => {
    const allSessions = [...(course?.lectures ?? []), ...(course?.labs ?? [])];
    allSessions.forEach(s => {
      const { start } = parseGeneratedTime(s.time);
      if (start) set.add(start);
    });
  });
  return [...set].sort();
}

// ── Session Card ──────────────────────────────────────────────
const SESSION_STYLES = {
  Lecture: {
    bg: "bg-[#dbeafe]",
    border: "border-[#93c5fd]",
    badge: "bg-[#2563eb] text-white",
    icon: <BookOpen className="w-2.5 h-2.5" />,
    label: "Lecture",
    dot: "bg-[#2563eb]",
  },
  Lab: {
    bg: "bg-[#dcfce7]",
    border: "border-[#86efac]",
    badge: "bg-[#16a34a] text-white",
    icon: <FlaskConical className="w-2.5 h-2.5" />,
    label: "Lab",
    dot: "bg-[#16a34a]",
  },
};

function getSessionStyle(kind) {
  return SESSION_STYLES[kind] ?? SESSION_STYLES["Lab"];
}

// ── Schedule Table ─────────────────────────────────────────────
function ScheduleTable({ group }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const times = extractTimes(group);

  const slotMap = {};
  (group?.courses ?? []).forEach(course => {
    const allSessions = [...(course?.lectures ?? []), ...(course?.labs ?? [])];
    allSessions.forEach(session => {
      const gridDay = normalizeGridDay(session.day, session.dayAr);
      const { start } = parseGeneratedTime(session.time);
      if (!gridDay || !start) return;
      const key = `${gridDay}|${start}`;
      if (!slotMap[key]) slotMap[key] = [];
      const courseName = isAr && course.courseNameAr ? course.courseNameAr : course.courseName;
      slotMap[key].push({
        ...session,
        courseName,
        courseCode: course.courseCode,
        _kind: normalizeSessionKind(session.type, session.typeAr),
      });
    });
  });

  if (times.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
        <p className="text-slate-400 text-xs italic">{t("scheduleEdit.noSessions")}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70">
        <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <span className="font-semibold text-slate-700 text-xs">
          {isAr && group.groupNameAr ? group.groupNameAr : group.groupName}
        </span>
        <div className="ml-auto flex items-center gap-2.5">
          {Object.values(SESSION_STYLES).map(s => (
            <span key={s.label} className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", s.dot)} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[650px] text-xs">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="w-16 border-r border-b border-slate-200 px-2 py-1.5 text-center sticky left-0 bg-slate-50 z-10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("scheduleEdit.time")}</span>
              </th>
              {DAYS.map(day => (
                <th key={day} className="border-r border-b border-slate-200 px-2 py-1.5 text-center last:border-r-0">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{t(`timetable.${day.toLowerCase()}`, day)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map(time => (
              <tr key={time} className="group hover:bg-slate-50/40 transition-colors">
                <td className="border-r border-b border-slate-100 px-1.5 py-1 text-center sticky left-0 bg-white group-hover:bg-slate-50/60 transition-colors z-10">
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{time}</span>
                </td>

                {DAYS.map(day => {
                  const sessions = slotMap[`${day}|${time}`] ?? [];
                  return (
                    <td
                      key={`${day}-${time}`}
                      className="border-r border-b border-slate-100 p-1 align-top min-w-[105px] last:border-r-0"
                    >
                      {sessions.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {sessions.map((sess, idx) => {
                            const kind = sess._kind ?? normalizeSessionKind(sess.type, sess.typeAr);
                            const style = getSessionStyle(kind);
                            const { start, end } = parseGeneratedTime(sess.time);
                            const typeLabel = isAr && sess.typeAr ? sess.typeAr : sess.type;
                            const instructor = isAr && sess.instructorNameAr ? sess.instructorNameAr : sess.instructorName;
                            const room = isAr && sess.roomAr ? sess.roomAr : sess.room;
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "rounded-lg border px-1.5 py-1 text-[10px] leading-snug cursor-default transition-all hover:scale-[1.01] hover:shadow-sm",
                                  style.bg,
                                  style.border
                                )}
                              >
                                <div className="flex items-center justify-between gap-0.5 mb-0.5">
                                  <span className={cn("flex items-center gap-0.5 px-1 py-px rounded-full text-[8px] font-bold", style.badge)}>
                                    {style.icon}
                                    {typeLabel || style.label}
                                  </span>
                                  <span className="text-slate-500 font-medium text-[8px] whitespace-nowrap">
                                    {start}{end ? ` – ${end}` : ""}
                                  </span>
                                </div>
                                <p className="font-bold text-slate-800 text-[10px] leading-tight truncate" title={sess.courseName}>
                                  {sess.courseName}
                                </p>
                                <p className="text-slate-500 text-[9px] font-medium">{sess.courseCode}</p>
                                {instructor && (
                                  <p className="text-slate-600 text-[9px] truncate">{instructor}</p>
                                )}
                                {room && (
                                  <div className="flex items-center gap-0.5 mt-0.5">
                                    <MapPin className="w-2 h-2 text-slate-400 flex-shrink-0" />
                                    <span className="text-slate-500 text-[9px] truncate">{room}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="min-h-[36px]" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Level Accordion ───────────────────────────────────────────
function shortGroupChipLabel(group, levelNum, isAr) {
  const label = isAr && group.groupNameAr ? group.groupNameAr : (group.groupName ?? "");
  const s = String(label);
  const stripped = s
    .replace(new RegExp(`^Level\\s+${levelNum}\\s*-\\s*`, "i"), "")
    .replace(new RegExp(`^المستوى\\s*${levelNum}\\s*-\\s*`), "")
    .trim();
  return stripped || s;
}

function LevelAccordion({ levelNum }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const handleOpen = useCallback(async () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (!opening || hasFetched) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchGeneratedSchedulesApi(levelNum);
      setGroups(normalizeGeneratedSchedulesPayload(res.data));
      setHasFetched(true);
    } catch (err) {
      setError(t("scheduleEdit.failedLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, hasFetched, levelNum, t]);

  const handleGroupToggle = (groupId) => {
    setActiveGroupId(prev => (prev === groupId ? null : groupId));
  };

  const activeGroup = groups.find(g => g.groupId === activeGroupId) ?? null;

  return (
    <div className={cn("rounded-xl border transition-all duration-300 overflow-hidden bg-white", isOpen ? "border-slate-300 shadow-md" : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow")}>
      <button onClick={handleOpen} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50/50 transition-colors">
        <span className="text-sm font-semibold text-slate-800">{t("scheduleEdit.level", { num: levelNum })}</span>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
          {hasFetched && groups.length > 0 && (
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {groups.length === 1 ? t("scheduleEdit.groups_one") : t("scheduleEdit.groups_other", { count: groups.length })}
            </span>
          )}
          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0", isOpen && "rotate-180")} />
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-100">
          {error && <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>}
          {isLoading && <div className="mt-3 flex gap-2">{[1, 2, 3].map(i => <div key={i} className="h-8 w-20 rounded-full bg-slate-100 animate-pulse" />)}</div>}
          {!isLoading && !error && groups.length > 0 && (
            <>
              <div className="flex flex-wrap gap-1.5 pt-3">
                {groups.map((group, idx) => (
                  <button
                    key={`${levelNum}-${group.groupId}-${idx}`}
                    onClick={() => handleGroupToggle(group.groupId)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200", activeGroupId === group.groupId ? "bg-gray-2 text-white border-border-1 shadow-md scale-[1.03]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50")}
                  >
                    <span>{shortGroupChipLabel(group, levelNum, isAr)}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-px rounded-full flex items-center gap-0.5", activeGroupId === group.groupId ? "bg-white/20 text-searchableselect-border" : "bg-slate-100 text-searchableselect-border")}>
                      <Users className="w-2 h-2" />
                      {group.availableSeats}
                    </span>
                  </button>
                ))}
              </div>
              {activeGroup && <ScheduleTable group={activeGroup} />}
            </>
          )}
          {!isLoading && !error && groups.length === 0 && <p className="mt-3 text-slate-400 text-xs italic">{t("scheduleEdit.noGroups", { num: levelNum })}</p>}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ViewSchedulePage() {
  const { t } = useTranslation();

  return (
    <div className="p-3 sm:p-4 md:p-5 max-w-[1200px] mx-auto space-y-4 animate-in fade-in duration-700">
      <div className="border-b border-slate-200 pb-3 bg-white/50 px-4 py-3 rounded-xl shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {t("scheduleEdit.viewTitle", "Master Schedule View")}
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          {t("scheduleEdit.viewSubtitle", "Explore the generated schedule for all levels and groups.")}
        </p>
      </div>

      <div className="space-y-3">
        {LEVELS.map(levelNum => (
          <LevelAccordion key={levelNum} levelNum={levelNum} />
        ))}
      </div>
    </div>
  );
}
