import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "./recharts-no-selection.css";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";

/** Map level index → CSS fill class */
const LEVEL_COLORS = [
    "fill-dashed-bg5",
    "fill-dashed-bg2",
    "fill-dashed-bg3",
    "fill-dashed-bg4",
];

const LIGHT_CLASSES = new Set(["fill-sky-300", "fill-purple-400"]);

function DonutSliceLabel(props) {
    const { cx, cy, midAngle, innerRadius, outerRadius, payload } = props;
    const itemClass = payload?.className ?? "fill-blue-900";
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.48;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const p = payload?.percentage ?? Math.round((payload?.value ?? 0));
    const shortName = (payload?.name ?? "").replace(/\s*Year\s*/i, "").trim();
    const textFill = LIGHT_CLASSES.has(itemClass) ? "#0f172a" : "#ffffff";

    return (
        <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textFill}
            style={{ fontSize: 10, fontWeight: 700, pointerEvents: "none" }}
        >
            <tspan x={x} dy="-0.35em">
                {p}%
            </tspan>
            <tspan
                x={x}
                dy="1.15em"
                style={{ fontSize: 9, fontWeight: 600, opacity: 0.95 }}
            >
                {shortName}
            </tspan>
        </text>
    );
}

/**
 * Students by Academic Year — Donut chart
 * Accepts `data` from API: [{ levelName, count, percentage }]
 */
export default function AcademicYearDonut({ data = [], isLoading = false, className }) {
    const chartData = useMemo(
        () =>
            data.map((d, i) => ({
                name: d.levelName,
                value: d.percentage,
                count: d.count,
                percentage: d.percentage,
                className: LEVEL_COLORS[i % LEVEL_COLORS.length],
            })),
        [data]
    );

    if (isLoading) {
        return (
            <div className={cn("w-full h-full flex items-center justify-center", className)}>
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full h-full min-h-0 flex flex-col items-center justify-center",
                className
            )}
        >
            <div
                className="w-full max-w-[300px] flex-1 min-h-[220px] min-w-0 flex flex-col outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_svg]:outline-none [&_svg]:focus:outline-none [&_.recharts-responsive-container]:min-h-[200px]"
                style={{ WebkitTapHighlightColor: "transparent" }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart accessibilityLayer={false}>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="58%"
                            outerRadius="88%"
                            paddingAngle={1}
                            stroke="#fff"
                            strokeWidth={2}
                            label={DonutSliceLabel}
                            labelLine={false}
                            activeShape={false}
                            inactiveShape={false}
                            isAnimationActive={false}
                        >
                            {chartData.map((entry) => (
                                <Cell key={entry.name} className={entry.className} />
                            ))}
                        </Pie>
                        <Tooltip
                            cursor={false}
                            formatter={(_v, _n, item) => [
                                `${item.payload.count?.toLocaleString()}`,
                                item.payload.name,
                            ]}
                            contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                fontSize: "12px",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
