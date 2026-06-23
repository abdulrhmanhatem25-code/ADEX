import React from "react";
import { User } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import AdexButton from "@/shared/ui/AdexButton";

/**
 * صف تقرير: أفاتار ملوّن، عنوان، تاريخ، تاجات، View / Download
 */
export default function DashboardReportRow({
    title,
    date,
    tags = [],
    avatarClassName,
    onView,
    onDownload,
    className,
}) {
    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3.5 border-b border-slate-100 last:border-b-0",
                className
            )}
        >
            <div
                className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    avatarClassName
                )}
            >
                <User className="h-5 w-5 opacity-90 text-text" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
                <p className="text-xs text-gray-2 mt-0.5">{date}</p>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((t) => (
                            <span
                                key={t}
                                className="text-[11px] font-medium text-text bg-gray-1 px-2 py-0.5 rounded-md"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
                <AdexButton
                    variant="outline"
                    type="button"
                    className="rounded-lg h-8 px-3 text-xs font-semibold border-sky-400 text-text hover:bg-gray-1"
                    onClick={onView}
                >
                    View
                </AdexButton>
                <AdexButton
                    variant="outline"
                    type="button"
                    className="rounded-lg h-8 px-3 text-xs font-semibold border-sky-400 text-text hover:bg-gray-1"
                    onClick={onDownload}
                >
                    Download
                </AdexButton>
            </div>
        </div>
    );
}
