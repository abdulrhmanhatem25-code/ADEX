import React, { useEffect, useState } from "react";
import {
    Star,
    Loader2,
    MessageSquare,
    TrendingUp,
    Users,
    BarChart3,
    Search,
    Sparkles,
    GraduationCap,
    Briefcase,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { fetchRatingsApi, fetchInstructorRatingsApi } from "@/shared/services/enrollmentsApi";

/* ── Helpers ─────────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function StarDisplay({ score, size = 16 }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={size}
                    className={cn(
                        "transition-colors",
                        s <= score
                            ? "fill-amber-400 text-amber-400"
                            : "fill-transparent text-slate-200"
                    )}
                />
            ))}
        </div>
    );
}

/* ── Stat Card ───────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, accent, sub }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div
                className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                    accent
                )}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight">
                    {value}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                {sub && <p className="text-[11px] text-slate-300 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

/* ── Rating Distribution Bar ─────────────────────────────────────────── */
function RatingBar({ star, count, total }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="w-3 text-right font-bold text-slate-500">{star}</span>
            <Star size={13} className="fill-amber-400 text-amber-400 shrink-0" />
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="w-8 text-right text-xs text-slate-400 font-medium">{count}</span>
        </div>
    );
}

/* ── Ratings Feed Component ──────────────────────────────────────────── */
function RatingsFeed({ ratings, search, setSearch, gradientFrom = "from-indigo-400", gradientTo = "to-violet-500" }) {
    const total = ratings.length;
    const avgScore =
        total > 0
            ? (ratings.reduce((a, r) => a + r.ratingScore, 0) / total).toFixed(1)
            : "0.0";
    const distribution = [5, 4, 3, 2, 1].map((s) => ({
        star: s,
        count: ratings.filter((r) => r.ratingScore === s).length,
    }));
    const withComments = ratings.filter((r) => r.comment?.trim()).length;

    const filtered = ratings.filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const name = r.studentName || r.instructorName || "";
        const code = r.studentCode || r.instructorCode || "";
        return (
            name.toLowerCase().includes(q) ||
            code.toLowerCase().includes(q) ||
            r.comment?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Star}
                    label="Average Rating"
                    value={avgScore}
                    accent="bg-amber-50 text-amber-500"
                    sub={`out of 5.0`}
                />
                <StatCard
                    icon={Users}
                    label="Total Responses"
                    value={total}
                    accent="bg-indigo-50 text-indigo-500"
                />
                <StatCard
                    icon={MessageSquare}
                    label="With Comments"
                    value={withComments}
                    accent="bg-emerald-50 text-emerald-500"
                />
                <StatCard
                    icon={TrendingUp}
                    label="5-Star Ratings"
                    value={distribution[0].count}
                    accent="bg-violet-50 text-violet-500"
                    sub={total > 0 ? `${((distribution[0].count / total) * 100).toFixed(0)}% of total` : ""}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
                {/* ── Distribution Panel ── */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4 h-fit">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-500" />
                        <h2 className="text-sm font-extrabold text-slate-900">
                            Rating Distribution
                        </h2>
                    </div>
                    <div className="space-y-2.5">
                        {distribution.map((d) => (
                            <RatingBar key={d.star} {...d} total={total} />
                        ))}
                    </div>
                    {/* Big average display */}
                    <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-50">
                        <span className="text-4xl font-extrabold text-slate-900">{avgScore}</span>
                        <div>
                            <StarDisplay score={Math.round(Number(avgScore))} size={18} />
                            <p className="text-xs text-slate-400 mt-0.5">
                                {total} review{total !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Ratings Feed ── */}
                <div className="space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, code, or comment…"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-400">
                            No ratings found.
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {filtered.map((r) => (
                                <div
                                    key={r.feedbackId}
                                    className="group rounded-2xl border border-slate-100 bg-white p-4 hover:shadow-md hover:border-slate-200 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Avatar */}
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shrink-0",
                                                gradientFrom, gradientTo
                                            )}>
                                                {(r.studentName || r.instructorName)?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {r.studentName || r.instructorName}
                                                </p>
                                                <p className="text-xs text-slate-400 font-mono">
                                                    #{r.studentCode || r.instructorCode}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <StarDisplay score={r.ratingScore} size={14} />
                                            <span className="text-[11px] text-slate-300">
                                                {timeAgo(r.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    {r.comment?.trim() && (
                                        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                "{r.comment}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ── Tab Button ──────────────────────────────────────────────────────── */
function TabButton({ active, icon: Icon, label, count, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                active
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
            )}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {count !== undefined && (
                <span className={cn(
                    "ml-1 px-2 py-0.5 rounded-full text-xs font-bold",
                    active
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-slate-100 text-slate-400"
                )}>
                    {count}
                </span>
            )}
        </button>
    );
}

/* ── Main Page ───────────────────────────────────────────────────────── */
export default function RatingsPage() {
    const [activeTab, setActiveTab] = useState("student");
    const [studentRatings, setStudentRatings] = useState([]);
    const [staffRatings, setStaffRatings] = useState([]);
    const [isLoadingStudent, setIsLoadingStudent] = useState(true);
    const [isLoadingStaff, setIsLoadingStaff] = useState(true);
    const [searchStudent, setSearchStudent] = useState("");
    const [searchStaff, setSearchStaff] = useState("");

    useEffect(() => {
        let cancelled = false;
        async function loadStudent() {
            setIsLoadingStudent(true);
            try {
                const data = await fetchRatingsApi();
                if (!cancelled) setStudentRatings(data ?? []);
            } catch {
                // handled by global interceptor
            } finally {
                if (!cancelled) setIsLoadingStudent(false);
            }
        }
        loadStudent();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function loadStaff() {
            setIsLoadingStaff(true);
            try {
                const data = await fetchInstructorRatingsApi();
                if (!cancelled) setStaffRatings(data ?? []);
            } catch {
                // handled by global interceptor
            } finally {
                if (!cancelled) setIsLoadingStaff(false);
            }
        }
        loadStaff();
        return () => { cancelled = true; };
    }, []);

    const isLoading = activeTab === "student" ? isLoadingStudent : isLoadingStaff;
    const ratings = activeTab === "student" ? studentRatings : staffRatings;
    const search = activeTab === "student" ? searchStudent : searchStaff;
    const setSearch = activeTab === "student" ? setSearchStudent : setSearchStaff;

    return (
        <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Ratings Overview
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Enrollment feedback from students and staff across the system.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1.5 w-fit">
                <TabButton
                    active={activeTab === "student"}
                    icon={GraduationCap}
                    label="Student"
                    count={studentRatings.length}
                    onClick={() => setActiveTab("student")}
                />
                <TabButton
                    active={activeTab === "staff"}
                    icon={Briefcase}
                    label="Staff"
                    count={staffRatings.length}
                    onClick={() => setActiveTab("staff")}
                />
            </div>

            {isLoading ? (
                <div className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white p-8 text-slate-400 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading ratings…</span>
                </div>
            ) : (
                <RatingsFeed
                    ratings={ratings}
                    search={search}
                    setSearch={setSearch}
                    gradientFrom={activeTab === "student" ? "from-indigo-400" : "from-emerald-400"}
                    gradientTo={activeTab === "student" ? "to-violet-500" : "to-teal-500"}
                />
            )}
        </div>
    );
}
