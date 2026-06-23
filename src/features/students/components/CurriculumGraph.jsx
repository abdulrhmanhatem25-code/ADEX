import React, { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchProgramCoursesApi, fetchPrereqsApi } from "@/shared/services/coursesApi";
import { fetchAcademicRecordsApi, fetchSuggestedCoursesApi } from "@/shared/services/studentsApi";

// ─── Dimensions ──────────────────────────────────────────────────────────────
const CARD_W = 118;
const CARD_H = 64;
const GAP_X = 30;
const GAP_Y = 44;
const LEVEL_GAP = 28;
const LEFT_PAD = 16;
const TOP_PAD = 35;

// ─── Color scheme ─────────────────────────────────────────────────────────────
// Priority / status → color token
const COLORS = {
    retake: { bg: "#fff7ed", border: "#f97316", text: "#9a3412" }, // orange  — Retake
    core: { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af" }, // blue    — Core suggested
    elective: { bg: "#f0fdf4", border: "#22c55e", text: "#166534" }, // green   — Elective
    locked: { bg: "#f78b8bff", border: "#fb5e2aff", text: "#e25d28ff" }, // gray    — Locked
    completed: { bg: "#e0f2f1", border: "#26a69a", text: "#00695c" }, // teal    — Completed
    default: { bg: "#c47fefff", border: "#a626ecff", text: "#67157bff" }, // sky     — unknown / fallback
};

/**
 * statusMap: Map<courseCode, { type: 'retake'|'core'|'elective'|'locked', reason? }>
 * Built from the suggested-courses API response.
 */
function buildStatusMap(apiData) {
    const map = new Map();
    if (!apiData) return map;

    const addCourses = (list) => {
        (list ?? []).forEach((c) => {
            const priority = (c.priority ?? "").toLowerCase();
            const type =
                priority === "retake" ? "retake" :
                    priority === "elective" ? "elective" : "core";
            map.set(c.courseCode, { type, reason: c.reason ?? "" });
        });
    };

    addCourses(apiData.suggested);
    addCourses(apiData.additionalEligible);

    (apiData.locked ?? []).forEach((c) => {
        map.set(c.courseCode, { type: "locked", reason: null });
    });

    return map;
}

function cardColor(courseCode, done, statusMap) {
    if (done) return COLORS.completed;
    const s = statusMap.get(courseCode);
    if (!s) return COLORS.default;
    return COLORS[s.type] ?? COLORS.default;
}

// ─── SVG Cards ────────────────────────────────────────────────────────────────
function CardRect({ x, y, item, done, statusMap }) {
    const c = item.course;
    const col = cardColor(c.courseCode, done, statusMap);
    const status = statusMap.get(c.courseCode);
    const isLocked = status?.type === "locked";

    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    
    const displayName = isAr ? (c.courseNameAr || c.courseName) : c.courseName;
    const name = (displayName || "").length > 20
        ? displayName.slice(0, 18) + "…"
        : (displayName || "");

    return (
        <g transform={`translate(${x},${y})`}>
            {done && (
                <rect x={-2} y={-2} width={CARD_W + 4} height={CARD_H + 4}
                    rx={7} fill="none" stroke={COLORS.completed.border} strokeWidth={2.5} />
            )}
            <rect
                width={CARD_W} height={CARD_H} rx={5}
                fill={col.bg} stroke={col.border} strokeWidth={1.4}
                strokeDasharray={isLocked ? "6,3" : undefined}
            />
            <text x={CARD_W / 2} y={15} textAnchor="middle" fontSize={10.5}
                fontWeight={700} fill={col.text}>{c.courseCode}</text>
            <text x={CARD_W / 2} y={31} textAnchor="middle" fontSize={7.8}
                fill={col.text}>{name}</text>
            <text x={CARD_W / 2} y={48} textAnchor="middle" fontSize={9.5}
                fontWeight={600} fill={col.text}>{c.creditHours ?? "—"}</text>

            {/* completed checkmark */}
            {done && (
                <g transform={`translate(${CARD_W - 13},3)`}>
                    <circle cx={5} cy={5} r={5.5} fill={COLORS.completed.border} />
                    <text x={5} y={8} textAnchor="middle" fontSize={7} fill="white" fontWeight={700}>✓</text>
                </g>
            )}

            {/* lock icon for locked */}
            {isLocked && (
                <text x={CARD_W - 10} y={12} textAnchor="middle" fontSize={9} fill={col.border} opacity={0.7}>🔒</text>
            )}

            <title>{`${c.courseCode} — ${displayName}\n${c.creditHours ?? "—"} hrs${done ? "\n✓ Completed" : ""}${status?.reason ? "\n" + status.reason : ""}`}</title>
        </g>
    );
}

// Elective slot placeholder card (unchanged)
function SlotCard({ x, y, slotName, courseType }) {
    const col = COLORS.elective;
    const shortName = (slotName || "Elective").length > 18
        ? slotName.slice(0, 16) + "…"
        : (slotName || "Elective");
    const typeShort = (courseType || "").replace("Elective", "").trim() || "Elective";
    return (
        <g transform={`translate(${x},${y})`}>
            <rect width={CARD_W} height={CARD_H} rx={5}
                fill={col.bg} stroke={col.border} strokeWidth={1.4} strokeDasharray="6,3" />
            <text x={CARD_W / 2} y={18} textAnchor="middle" fontSize={9}
                fontWeight={700} fill={col.text} fontStyle="italic">Elective Slot</text>
            <text x={CARD_W / 2} y={33} textAnchor="middle" fontSize={7.5} fill={col.text}>{shortName}</text>
            <text x={CARD_W / 2} y={50} textAnchor="middle" fontSize={7} fill={col.text}>{typeShort}</text>
        </g>
    );
}

// ─── Arrow helpers (unchanged) ────────────────────────────────────────────────
// ─── Arrow helpers (Clean Branching with Row-Gutter Jitter) ──────────────────
function buildMergedArrows(arrowsBySource, positions) {
    const segments = [];

    // Simple hash function for deterministic row-jitter
    const getJitter = (str, range) => {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
        return (Math.abs(h) % range) - range / 2;
    };

    Object.entries(arrowsBySource).forEach(([srcCode, targets]) => {
        const src = positions[srcCode];
        if (!src || targets.length === 0) return;

        // Strictly one exit point from the bottom center of the card
        const sx = src.x + CARD_W / 2;
        const sy = src.y + CARD_H;

        // Jitter the horizontal bus line Y to prevent overlapping paths from different sources
        const yJitter = getJitter(srcCode, GAP_Y * 0.5);
        const exitY = sy + GAP_Y * 0.45 + yJitter;

        // 1. Single exit segment from source
        segments.push({ x1: sx, y1: sy, x2: sx, y2: exitY });

        // 2. Map targets to their gutter entry points
        const targetData = targets.map(tCode => {
            const tgt = positions[tCode];
            if (!tgt) return null;
            return { code: tCode, x: tgt.x + CARD_W / 2, y: tgt.y };
        }).filter(Boolean);

        if (targetData.length === 0) return;

        // 3. Horizontal "bus" line in the row gap (covers all targets + source)
        const minX = Math.min(sx, ...targetData.map(t => t.x));
        const maxX = Math.max(sx, ...targetData.map(t => t.x));
        if (minX !== maxX) {
            segments.push({ x1: minX, y1: exitY, x2: maxX, y2: exitY });
        }

        // 4. Drop branches from the bus line to each target
        targetData.forEach(tgt => {
            const tx = tgt.x;
            const ty = tgt.y;
            // Branch drops from exitY to target Y
            segments.push({ x1: tx, y1: exitY, x2: tx, y2: ty });
        });
    });

    // 2. Intersection Detection (H-V crossing)
    for (let i = 0; i < segments.length; i++) {
        const s1 = segments[i];
        const isH1 = Math.abs(s1.y1 - s1.y2) < 1;
        const isV1 = Math.abs(s1.x1 - s1.x2) < 1;
        for (let j = i + 1; j < segments.length; j++) {
            const s2 = segments[j];
            const isH2 = Math.abs(s2.y1 - s2.y2) < 1;
            const isV2 = Math.abs(s2.x1 - s2.x2) < 1;

            if (isH1 && isV2) {
                if (s2.x1 > Math.min(s1.x1, s1.x2) && s2.x1 < Math.max(s1.x1, s1.x2) &&
                    s1.y1 > Math.min(s2.y1, s2.y2) && s1.y1 < Math.max(s2.y1, s2.y2)) {
                    s2.dashed = true;
                }
            } else if (isV1 && isH2) {
                if (s1.x1 > Math.min(s2.x1, s2.x2) && s1.x1 < Math.max(s2.x1, s2.x2) &&
                    s2.y1 > Math.min(s1.y1, s1.y2) && s2.y1 < Math.max(s1.y1, s1.y2)) {
                    s1.dashed = true;
                }
            }
        }
    }
    return segments;
}

// ─── Legend (updated colors) ──────────────────────────────────────────────────
function Legend() {
    const items = [
        { label: "Retake", ...COLORS.retake },
        { label: "Core", ...COLORS.core },
        { label: "Elective", ...COLORS.elective, dashed: true },
        { label: "Locked", ...COLORS.locked, dashed: true },
        { label: "Completed", ...COLORS.completed },
        { label: "Other", ...COLORS.default },
    ];
    return (
        <div className="flex flex-wrap items-center gap-3 px-1">
            {items.map((it, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="inline-block w-4 h-3 rounded-sm" style={{
                        background: it.bg,
                        border: `1.5px ${it.dashed ? "dashed" : "solid"} ${it.border}`
                    }} />
                    {it.label}
                </span>
            ))}
        </div>
    );
}

// ─── Parser ───────────────────────────────────────────────────────────────────
function parseProgram(programData) {
    const items = [];
    const poolsMap = new Map();
    if (!programData || !Array.isArray(programData.levels)) return { items, pools: [] };

    programData.levels.forEach(lvlObj => {
        const level = lvlObj.level;
        (lvlObj.electivePools ?? []).forEach(pool => {
            if (!poolsMap.has(pool.groupName)) poolsMap.set(pool.groupName, { ...pool, level });
        });
        (lvlObj.semesters ?? []).forEach(semObj => {
            const semester = semObj.semester;
            const slotCounter = {};
            (semObj.courses ?? []).forEach((course, idx) => {
                const hasCode = Boolean(course.code);
                if (hasCode) {
                    items.push({
                        id: `${course.code}-L${level}-S${semester}`,
                        level, semester,
                        courseType: course.type ?? "",
                        isSlot: false,
                        isElective: false,
                        course: { courseCode: course.code, courseName: course.name ?? "", courseNameAr: course.nameAr ?? "", creditHours: course.creditHours },
                        slotName: null,
                    });
                } else if (course.poolRef || course.slot) {
                    const poolRef = course.poolRef || course.slot || `Elective-${idx}`;
                    slotCounter[poolRef] = (slotCounter[poolRef] ?? 0) + 1;
                    const slotIdx = slotCounter[poolRef];
                    items.push({
                        id: `SLOT-${poolRef}-L${level}-S${semester}-${slotIdx}`,
                        level, semester,
                        courseType: course.type ?? "Elective",
                        isSlot: true,
                        isElective: false,
                        course: { courseCode: `Slot`, courseName: poolRef, creditHours: null },
                        slotName: poolRef,
                    });
                }
            });
        });
    });

    return { items, pools: [...poolsMap.values()] };
}

// ─── Elective Pools Panel (unchanged) ─────────────────────────────────────────
const TYPE_BADGE = {
    FacultyElective: { label: "Faculty Elective", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    DepartmentElective: { label: "Department Elective", cls: "bg-orange-50 text-orange-700 border-orange-200" },
    MinorElective: { label: "Minor Elective", cls: "bg-purple-50 text-purple-700 border-purple-200" },
};

function ElectivePoolsPanel({ pools, completedCodes }) {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    if (!pools || pools.length === 0) return null;
    return (
        <div className="mt-4 space-y-4">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-200 border border-amber-400 border-dashed" />
                Elective Pools
            </h4>
            {pools.map(pool => {
                const badge = TYPE_BADGE[pool.courseType] ?? { label: pool.courseType, cls: "bg-slate-50 text-slate-600 border-slate-200" };
                return (
                    <div key={pool.groupName} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-bold text-amber-800">{pool.groupName}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.label}</span>
                            <span className="text-[10px] text-slate-400 ml-auto">Level {pool.level}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(pool.courses ?? []).map(pc => {
                                const done = completedCodes.has(pc.code);
                                return (
                                    <div key={pc.code}
                                        title={`${pc.code} — ${isAr ? pc.nameAr || pc.name : pc.name}\n${pc.creditHours ?? "—"} credit hrs`}
                                        className={`flex flex-col px-3 py-2 rounded-lg border text-xs min-w-[120px] max-w-[160px] ${done ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-white border-amber-200 text-amber-900"
                                            }`}
                                    >
                                        <span className="font-bold text-[11px] flex items-center gap-1">
                                            {done && <span className="text-teal-600">✓</span>}
                                            {pc.code}
                                        </span>
                                        <span className="text-[10px] leading-tight mt-0.5 text-slate-500 line-clamp-2">{isAr ? (pc.nameAr || pc.name) : pc.name}</span>
                                        <span className="text-[10px] font-semibold mt-1">{pc.creditHours ?? "—"} hrs</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function CurriculumGraph({ studentCode, student }) {
    const [gridItems, setGridItems] = useState([]);
    const [electivePools, setElectivePools] = useState([]);
    const [prereqMap, setPrereqMap] = useState({});
    const [completedCodes, setCompletedCodes] = useState(new Set());
    const [statusMap, setStatusMap] = useState(new Map()); // NEW: from suggested API
    const [loading, setLoading] = useState(true);
    const [prereqLoading, setPrereqLoading] = useState(false);
    const [error, setError] = useState(null);

    const [programId, setProgramId] = useState(() => {
        const dept = (student?.departmentName || "").toLowerCase();
        return dept.includes("it") ? 2 : 1;
    });
    const [specializationLabel, setSpecializationLabel] = useState(student?.departmentName || "");
    const [specializationLabelAr, setSpecializationLabelAr] = useState(student?.departmentNameAr || "");

    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    const studentId = student?.studentId ?? student?.id ?? null;

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setPrereqMap({});

        (async () => {
            try {
                // 1a. Academic records → programId + completed set
                let resolvedProgramId = programId;
                if (studentCode) {
                    try {
                        const recRes = await fetchAcademicRecordsApi(studentCode);
                        if (cancelled) return;
                        const rawRec = recRes.data;
                        const recData = rawRec?._value ?? rawRec?.value ?? rawRec;

                        const spec = recData?.specialization || recData?.departmentName || recData?.program || "";
                        const specLower = spec.toLowerCase();
                        const isIT = specLower.includes("information technology") || specLower === "it" || specLower.startsWith("it ");
                        resolvedProgramId = isIT ? 2 : 1;

                        if (!cancelled) {
                            setProgramId(resolvedProgramId);
                            if (spec) setSpecializationLabel(spec);
                        }

                        const done = new Set();
                        (recData?.categories ?? []).forEach(cat =>
                            (cat.courses ?? []).forEach(c => {
                                if (c.code && c.grade && c.grade !== "F" && c.grade !== "—") done.add(c.code);
                            })
                        );
                        if (!cancelled) setCompletedCodes(done);
                    } catch { /* optional */ }
                }

                if (cancelled) return;

                // 1b. Program courses (grid structure)
                const courseRes = await fetchProgramCoursesApi(resolvedProgramId);
                if (cancelled) return;

                const raw = courseRes.data;
                const programData = raw?._value ?? raw?.value ?? null;

                if (!cancelled && (programData?.programName || programData?.programCode)) {
                    setSpecializationLabel(programData.programName || programData.programCode);
                    setSpecializationLabelAr(programData.programNameAr || programData.programName || programData.programCode);
                }

                let items = [], pools = [];
                if (programData) {
                    const parsed = parseProgram(programData);
                    items = parsed.items;
                    pools = parsed.pools;
                } else if (Array.isArray(raw)) {
                    const seen = new Map();
                    raw.forEach(item => {
                        const code = item?.course?.courseCode;
                        if (!code) return;
                        if (!seen.has(code) || item.id > seen.get(code).id) seen.set(code, item);
                    });
                    items = [...seen.values()].map(item => ({ 
                        ...item, 
                        isSlot: false, 
                        isElective: false, 
                        id: item.course.courseCode,
                        course: {
                            ...item.course,
                            courseNameAr: item.course.nameAr ?? item.course.courseNameAr ?? ""
                        } 
                    }));
                }

                // Separate pool courses into a bottom section (level = maxRegLevel + 1)
                // Regular items (Level 1..N) stay as-is with their slot placeholders
                const regularItems = items.filter(i => !i.isElective);
                const maxRegLevel = regularItems.reduce((m, it) => Math.max(m, it.level), 0);
                const ELECTIVE_LEVEL = maxRegLevel + 1;

                // Build elective section from pools (skip courses already in regular items)
                const regularCodes = new Set(regularItems.filter(i => !i.isSlot).map(i => i.course.courseCode));
                const electiveItems = [];
                pools.forEach((pool, pi) => {
                    (pool.courses ?? []).forEach(pc => {
                        if (!regularCodes.has(pc.code)) {
                            electiveItems.push({
                                id: `EPOOL-${pc.code}`,
                                level: ELECTIVE_LEVEL,
                                semester: pi + 1,
                                courseType: pool.courseType ?? "Elective",
                                isSlot: false,
                                isElective: true,
                                poolName: pool.groupName,
                                course: { courseId: pc.courseId, courseCode: pc.code, courseName: pc.name ?? "", courseNameAr: pc.nameAr ?? "", creditHours: pc.creditHours },
                            });
                        }
                    });
                });

                const allItems = [...regularItems, ...electiveItems];

                if (cancelled) return;
                setGridItems(allItems);
                setElectivePools(pools);
                setLoading(false);

                // Suggested courses API → statusMap (parallel, non-blocking)
                if (studentId) {
                    fetchSuggestedCoursesApi(studentId)
                        .then(res => { if (!cancelled) setStatusMap(buildStatusMap(res.data)); })
                        .catch(() => { });
                }

                // Prerequisites for all non-slot items
                const allCodes = [...new Set(allItems.filter(i => !i.isSlot).map(i => i.course.courseCode))];
                if (allCodes.length > 0) {
                    setPrereqLoading(true);
                    const results = await Promise.allSettled(allCodes.map(c => fetchPrereqsApi(c)));
                    if (cancelled) return;
                    const map = {};
                    results.forEach((r, idx) => {
                        if (r.status === "fulfilled") {
                            const prereqs = r.value.data?.prerequisites ?? [];
                            if (prereqs.length) map[allCodes[idx]] = prereqs.map(p => p.courseCode);
                        }
                    });
                    setPrereqMap(map);
                    setPrereqLoading(false);
                }

            } catch (e) {
                console.error("[CurriculumGraph] fetch error:", e);
                if (!cancelled) { setError("Failed to load curriculum data."); setLoading(false); }
            }
        })();

        return () => { cancelled = true; };
    }, [studentCode, studentId]);

    // ── Layout ────────────────────────────────────────────────────────────────
    const [layoutError, setLayoutError] = useState(null);

    const layout = useMemo(() => {
        if (!gridItems.length) return null;
        setLayoutError(null);
        try {
            const regItems = gridItems.filter(i => !i.isElective);
            const electiveItems = gridItems.filter(i => i.isElective);

            // ── Regular levels ─────────────────────────────────────────────
            const bySem = {};
            regItems.forEach(item => {
                const k = `${item.level}-${item.semester}`;
                (bySem[k] ??= []).push(item);
            });

            const allRegLevels = [...new Set(regItems.map(c => c.level))].sort((a, b) => a - b);
            const positions = {};
            let curY = TOP_PAD + 15; // Extra room for first label
            const levelBounds = {};

            allRegLevels.forEach(lv => {
                const startY = curY;
                const sems = [...new Set(
                    regItems.filter(c => c.level === lv).map(c => c.semester)
                )].sort((a, b) => a - b);

                let minX = Infinity, maxX = -Infinity;
                sems.forEach(sem => {
                    const courses = bySem[`${lv}-${sem}`] || [];
                    let x = LEFT_PAD;
                    courses.forEach(item => {
                        positions[item.id] = { x, y: curY, item };
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x + CARD_W);
                        x += CARD_W + GAP_X;
                    });
                    curY += CARD_H + GAP_Y;
                });
                // Rect covers only the cards area
                levelBounds[lv] = {
                    x0: minX - 10,
                    x1: maxX + 10,
                    y0: startY - 33,
                    y1: curY - GAP_Y + CARD_H - 40,
                    labelY: startY - 14,
                    isElective: false
                };
                curY += LEVEL_GAP + 15;
            });

            const posByCode = {};
            Object.values(positions).forEach(({ x, y, item }) => {
                if (!item.isSlot) posByCode[item.course.courseCode] = { x, y };
            });

            const electiveCodes = new Set(electiveItems.map(i => i.course.courseCode));

            const arrowsBySource = {};
            Object.entries(prereqMap).forEach(([code, prereqs]) => {
                if (electiveCodes.has(code)) return;
                if (!posByCode[code]) return;
                prereqs.forEach(pCode => {
                    if (posByCode[pCode]) (arrowsBySource[pCode] ??= []).push(code);
                });
            });
            const arrowSegments = buildMergedArrows(arrowsBySource, posByCode);

            // ── Elective pools section ──────────────────────────────────────
            const GHOST_H = 46;
            const GHOST_GAP = 24; // Increased as requested
            const POOL_GAP = 22;
            const LABEL_H = 24;

            const poolGroups = {};
            electiveItems.forEach(item => {
                const pn = item.poolName || "Elective";
                (poolGroups[pn] ??= []).push(item);
            });

            const ghostCards = [];
            const shortArrowPaths = [];
            const poolLabels = [];

            if (electiveItems.length > 0) {
                curY += 20;
                const electiveSectionY = curY;
                let minX = Infinity, maxX = -Infinity;

                Object.entries(poolGroups).forEach(([poolName, pCourses]) => {
                    poolLabels.push({ x: LEFT_PAD, y: curY + 12, name: poolName });
                    curY += LABEL_H;

                    const hasAnyPrereq = pCourses.some(c => (prereqMap[c.course.courseCode] ?? []).length > 0);
                    const courseRowY = hasAnyPrereq ? curY + GHOST_H + GHOST_GAP : curY;

                    pCourses.forEach((item, idx) => {
                        const x = LEFT_PAD + idx * (CARD_W + GAP_X);
                        positions[item.id] = { x, y: courseRowY, item };
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x + CARD_W);

                        const prereqs = prereqMap[item.course.courseCode] ?? [];
                        if (prereqs.length > 0) {
                            const label = prereqs.join(", ");
                            ghostCards.push({
                                key: `ghost-${item.course.courseCode}`,
                                x, y: curY,
                                label,
                            });
                            const sx = x + CARD_W / 2;
                            const sy = curY + GHOST_H;
                            const tx = x + CARD_W / 2;
                            const ty = courseRowY;
                            shortArrowPaths.push(`M ${sx} ${sy} L ${tx} ${ty}`);
                        }
                    });
                    curY = courseRowY + CARD_H + POOL_GAP;
                });

                levelBounds["elective"] = {
                    x0: minX - 10,
                    x1: maxX + 10,
                    y0: electiveSectionY - 28,
                    y1: curY - POOL_GAP + 10,
                    labelY: electiveSectionY - 14,
                    isElective: true,
                };
            }

            const allXEnds = Object.values(positions).map(p => p.x + CARD_W);
            const svgW = (allXEnds.length > 0 ? Math.max(...allXEnds) : 800) + 20;

            return { positions, levelBounds, arrowSegments, ghostCards, shortArrowPaths, poolLabels, svgW, svgH: curY + 20 };
        } catch (e) {
            console.error("[CurriculumGraph] layout error:", e);
            setLayoutError("Layout error: " + (e?.message || String(e)));
            return null;
        }
    }, [gridItems, prereqMap]);

    // ── Render ───────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading curriculum…</p>
        </div>
    );

    if (error || layoutError) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <AlertCircle className="h-8 w-8 text-rose-400" />
            <p className="text-xs text-center max-w-sm">{error || layoutError}</p>
        </div>
    );

    if (!layout) return (
        <p className="text-sm text-center py-10 text-slate-400">No curriculum data found.</p>
    );

    const { positions, levelBounds, arrowSegments, ghostCards, shortArrowPaths, poolLabels, svgW, svgH } = layout;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-slate-700">
                    Curriculum — {isAr ? specializationLabelAr || (programId === 2 ? "تقنية المعلومات" : "علوم الحاسب") : specializationLabel || (programId === 2 ? "IT" : "CS")}
                </h3>
                {prereqLoading && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading prerequisites…
                    </span>
                )}
            </div>

            <Legend />

            <div className="overflow-x-auto overflow-y-auto max-h-[75vh] rounded-xl border border-slate-200 bg-white">
                <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
                    style={{ fontFamily: "'Inter','Segoe UI',sans-serif", minWidth: svgW }}>
                    <defs>
                        <marker id="ah" markerWidth={7} markerHeight={5} refX={6} refY={2.5} orient="auto">
                            <polygon points="0 0,7 2.5,0 5" fill="#94a3b8" />
                        </marker>
                        <marker id="ahs" markerWidth={6} markerHeight={5} refX={5} refY={2.5} orient="auto">
                            <polygon points="0 0,6 2.5,0 5" fill="#f97316" />
                        </marker>
                    </defs>

                    {/* Level + Elective section borders and labels above them */}
                    {Object.entries(levelBounds).map(([lv, b]) => (
                        <g key={`lv${lv}`}>
                            <rect x={b.x0} y={b.y0} width={b.x1 - b.x0} height={b.y1 - b.y0}
                                rx={6}
                                fill={b.isElective ? "#fefce8" : "none"}
                                stroke={b.isElective ? "#fbbf24" : "#cbd5e1"}
                                strokeWidth={1} strokeDasharray="8,4" />
                            <text x={b.x0 + 8} y={b.labelY} fontSize={12} fontWeight={800}
                                fill={b.isElective ? "#b45309" : "#475569"}>
                                {b.isElective ? "Elective Pools" : `Level ${lv}`}
                            </text>
                        </g>
                    ))}

                    {/* Pool name labels inside elective section */}
                    {(poolLabels ?? []).map((pl, i) => (
                        <text key={`pl${i}`} x={pl.x} y={pl.y} fontSize={10} fontWeight={800} fill="#92400e">
                            • {pl.name}
                        </text>
                    ))}

                    {/* Render Arrow Segments with crossing detection */}
                    {(arrowSegments ?? []).map((s, i) => {
                        const isFinalV = s.y2 > s.y1 && Math.abs(s.x1 - s.x2) < 1 && s.y2 === positions[Object.keys(positions).find(k => positions[k].item.course.courseCode === Object.keys(positions).find(code => positions[code].x === s.x2 && positions[code].y === s.y2))]?.y;
                        // Simplified final check: if it's a vertical segment and ends exactly at a target's Y, it gets an arrow.
                        // We'll just check if y2 is a multiple of known grid Y if needed, but segments are calculated correctly.
                        const hasArrow = s.y2 > s.y1 && Math.abs(s.x1 - s.x2) < 1 &&
                            Object.values(positions).some(p => Math.abs(p.y - s.y2) < 2 && Math.abs(p.x + CARD_W / 2 - s.x2) < 2);

                        return (
                            <line key={`as${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                                stroke="#94a3b8" strokeWidth={1.4}
                                strokeDasharray={s.dashed ? "4,3" : "none"}
                                markerEnd={hasArrow ? "url(#ah)" : "none"} />
                        );
                    })}

                    {/* Short arrows: ghost prereq → elective course */}
                    {(shortArrowPaths ?? []).map((d, i) => (
                        <path key={`sa${i}`} d={d} fill="none" stroke="#f97316" strokeWidth={1.2}
                            strokeDasharray="3,2" markerEnd="url(#ahs)" />
                    ))}

                    {/* Ghost prereq cards above elective courses */}
                    {(ghostCards ?? []).map(g => (
                        <g key={g.key} opacity={0.55} transform={`translate(${g.x},${g.y})`}>
                            <rect width={CARD_W} height={46} rx={5}
                                fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,3" />
                            <text x={CARD_W / 2} y={16} textAnchor="middle" fontSize={8.5}
                                fontWeight={700} fill="#475569">Prereq</text>
                            <text x={CARD_W / 2} y={31} textAnchor="middle" fontSize={8}
                                fill="#64748b" fontFamily="monospace">{g.label}</text>
                            <title>Required prerequisite(s): {g.label}</title>
                        </g>
                    ))}

                    {/* All course cards */}
                    {Object.values(positions).map(({ x, y, item }) => {
                        if (item.isSlot) {
                            return <SlotCard key={item.id} x={x} y={y} slotName={item.slotName} courseType={item.courseType} />;
                        }
                        return (
                            <CardRect
                                key={item.id}
                                x={x} y={y}
                                item={item}
                                done={completedCodes.has(item.course.courseCode)}
                                statusMap={statusMap}
                            />
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}
