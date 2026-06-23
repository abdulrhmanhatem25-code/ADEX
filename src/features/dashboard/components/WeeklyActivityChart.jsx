import React, { useMemo } from "react";
import "./recharts-no-selection.css";
import { useTranslation } from "react-i18next";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { Loader2 } from "lucide-react";

/**
 * Weekly activity — Recharts grouped bars
 * Accepts `data` from the API: [{ day, operationsCount, newUsersCount }]
 */
export default function WeeklyActivityChart({ data = [], isLoading = false, className }) {
    const { t } = useTranslation();
    const chartData = useMemo(
        () =>
            data.map((d) => ({
                day: d.day,
                [t("dashboard.newUsers")]: d.newUsersCount,
                [t("dashboard.operations")]: d.operationsCount,
            })),
        [data, t]
    );

    const maxVal = useMemo(() => {
        if (!data.length) return 500;
        const m = Math.max(...data.map((d) => Math.max(d.operationsCount, d.newUsersCount)));
        if (m === 0) return 10;
        // round up to a nice number
        const magnitude = Math.pow(10, Math.floor(Math.log10(m)));
        return Math.ceil(m / magnitude) * magnitude;
    }, [data]);

    const ticks = useMemo(() => {
        const step = maxVal / 4;
        return [0, step, step * 2, step * 3, maxVal];
    }, [maxVal]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-[280px] sm:h-[300px]">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
        );
    }

    return (
        <div
            className={`w-full h-[280px] sm:h-[300px] outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_svg]:outline-none [&_svg]:focus:outline-none ${className || ""}`}
            style={{ WebkitTapHighlightColor: "transparent" }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    accessibilityLayer={false}
                    margin={{ top: 4, right: 8, left: -8, bottom: 4 }}
                    barCategoryGap="18%"
                    barGap={4}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                    />
                    <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11 }}
                        tickClassName="fill-green-500"
                        axisLine={false}
                        tickLine={false}
                        dy={6}
                    />
                    <YAxis
                        domain={[0, maxVal]}
                        ticks={ticks}
                        tickFormatter={(v) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                        }
                        tick={{ fontSize: 10 }}
                        tickClassName="fill-dashed-bg2"
                        axisLine={false}
                        tickLine={false}
                        width={36}
                    />
                    <Tooltip
                        cursor={false}
                        contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{
                            paddingBottom: 12,
                            fontSize: 11,
                            color: "#64748b",
                            pointerEvents: "none",
                            userSelect: "none",
                        }}
                        formatter={(value) => (
                            <span className="text-slate-500 capitalize">{value}</span>
                        )}
                    />
                    <Bar
                        dataKey={t("dashboard.newUsers")}
                        className="fill-dashed-bg4"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={22}
                        activeBar={false}
                    />
                    <Bar
                        dataKey={t("dashboard.operations")}
                        className="fill-dashed-bg3"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={22}
                        activeBar={false}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
