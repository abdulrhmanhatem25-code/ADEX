import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { WEEKDAY_OPTIONS, weekdayLabel } from "@/shared/constants/weekdays";

/**
 * Styled day-of-week picker; `value` is API string e.g. "Sunday".
 */
export default function DayOfWeekSelect({ value, onValueChange, isAr = false, variant = "default", className = "" }) {
  const isCompact = variant === "compact";

  const triggerBase = cn(
    "border-slate-200 bg-white text-slate-700 shadow-sm transition-[box-shadow,background-color,border-color]",
    "hover:border-slate-300 hover:bg-slate-50/80",
    "focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-500/25",
    "[&_svg]:text-slate-400",
    isCompact
      ? "h-8 min-w-0 flex-1 gap-1 rounded-lg px-2 text-xs font-semibold [&_svg]:size-3.5"
      : "h-11 w-full gap-2 rounded-xl px-3 text-sm font-medium"
  );

  const contentBase =
    "z-[300] max-h-[min(280px,var(--radix-select-content-available-height))] rounded-xl border border-slate-200 bg-white p-1 shadow-lg";

  const itemBase = cn(
    "cursor-pointer rounded-lg pr-8",
    isCompact ? "py-1.5 pl-2 text-xs" : "py-2.5 pl-3 text-sm"
  );

  return (
    <Select key={isAr ? "ar" : "en"} value={value || WEEKDAY_OPTIONS[0].value} onValueChange={onValueChange}>
      <SelectTrigger
        size={isCompact ? "sm" : "default"}
        aria-label={isAr ? "اليوم" : "Day of week"}
        className={cn(triggerBase, className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={4} collisionPadding={16} className={contentBase}>
        {WEEKDAY_OPTIONS.map((row) => (
          <SelectItem key={row.value} value={row.value} className={itemBase}>
            {weekdayLabel(row, isAr)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
