import React from "react";
import { History } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * System activity row
 * Props from API: name (userName), action, timeAgo, userImageUrl
 */
export default function DashboardActivityItem({
    name,
    action,
    timeAgo,
    userImageUrl,
    className,
}) {
    return (
        <div
            className={cn(
                "flex gap-3 py-2.5 border-b border-slate-50 last:border-b-0",
                className
            )}
        >
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 overflow-hidden">
                {userImageUrl ? (
                    <img
                        src={userImageUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <History className="h-4 w-4" />
                )}
            </div>

            {/* Text */}
            <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{action}</p>
                {timeAgo && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo}</p>
                )}
            </div>
        </div>
    );
}
