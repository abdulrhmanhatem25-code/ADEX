import React, { useMemo } from "react";
import { normalizeTimeHHmm } from "@/shared/utils/timeHHmm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const pad2 = (n) => String(n).padStart(2, "0");

/**
 * 24-hour time picker (hours 00–23, minutes 00–59). Value / onChange use "HH:mm".
 *
 * @param {"compact" | "default"} variant - compact for dense rows; default for forms
 */
export default function TimeInput24({
  value,
  onChange,
  className = "",
  selectClassName = "",
  variant = "default",
}) {
  const { h, m } = useMemo(() => {
    const norm = normalizeTimeHHmm(value);
    if (!norm) return { h: 0, m: 0 };
    const [hs, ms] = norm.split(":").map((x) => parseInt(x, 10));
    return { h: hs, m: ms };
  }, [value]);

  const emit = (nh, nm) => {
    onChange(`${pad2(nh)}:${pad2(nm)}`);
  };

  const isCompact = variant === "compact";

  const triggerBase = cn(
    "border-slate-200 bg-white text-slate-700 shadow-sm transition-[box-shadow,background-color,border-color]",
    "hover:border-slate-300 hover:bg-slate-50/80",
    "focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-500/25",
    "[&_svg]:text-slate-400",
    isCompact
      ? "h-8 min-w-[3.75rem] gap-1 rounded-lg px-2 text-xs font-semibold tabular-nums [&_svg]:size-3.5"
      : "h-9 w-full min-w-0 gap-1.5 rounded-xl px-2.5 text-sm font-medium tabular-nums"
  );

  const contentBase = cn(
    "max-h-[min(280px,var(--radix-select-content-available-height))] rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
  );

  const itemBase = cn(
    "cursor-pointer rounded-lg pr-8 tabular-nums",
    isCompact ? "py-1.5 pl-2 text-xs" : "py-2 pl-2.5 text-sm"
  );

  const hourValue = pad2(h);
  const minuteValue = pad2(m);

  const segment = (type, currentStr, options, onPick, ariaLabel) => (
    <Select value={currentStr} onValueChange={onPick}>
      <SelectTrigger
        size={isCompact ? "sm" : "default"}
        aria-label={ariaLabel}
        className={cn(triggerBase, selectClassName)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={4} collisionPadding={16} className={contentBase}>
        {options.map((n) => {
          const v = pad2(n);
          return (
            <SelectItem key={`${type}-${v}`} value={v} className={itemBase}>
              {v}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  const wrap = (node) => (isCompact ? node : <div className="min-w-0 flex-1">{node}</div>);

  const colon = (
    <span
      className={cn(
        "shrink-0 tabular-nums text-slate-400 select-none",
        isCompact ? "px-0.5 text-xs font-semibold" : "flex items-center justify-center text-sm font-semibold"
      )}
      aria-hidden
    >
      :
    </span>
  );

  return (
    <div
      className={cn(
        "flex items-center",
        isCompact ? "shrink-0 gap-0.5" : "w-full min-w-0 gap-1.5",
        className
      )}
      lang="en"
    >
      {wrap(segment("h", hourValue, HOURS, (v) => emit(parseInt(v, 10), m), "Hour (24h)"))}
      {colon}
      {wrap(segment("m", minuteValue, MINUTES, (v) => emit(h, parseInt(v, 10)), "Minute"))}
    </div>
  );
}
