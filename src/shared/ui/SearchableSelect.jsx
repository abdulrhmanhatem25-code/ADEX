import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * SearchableSelect
 *
 * A dropdown where the trigger IS the search input.
 * - Click to open, click again to close (toggle).
 * - Typing filters options in real-time.
 * - Supports async/API loading state.
 *
 * ─── Props ──────────────────────────────────────────────────
 * options[]            Array of option objects
 * value                Currently selected option (object | null)
 * onValueChange        Called with selected option (object | null)
 * placeholder          Shown when nothing selected and input empty
 * emptyMessage         Text shown when no options match search
 * labelKey             Object key for display text   (default: "name")
 * valueKey             Object key for unique id       (default: "id")
 *
 * ─── API / Loading ──────────────────────────────────────────
 * isLoading            Show a spinner instead of list while fetching
 * loadingMessage       Custom loading text  (default: "Loading...")
 *
 * ─── Style overrides (all optional) ─────────────────────────
 * className            Wrapper element — controls outer width/height
 * inputClassName       The input field
 * dropdownClassName    The popup dropdown container
 * itemClassName        Each option row
 * selectedItemClassName Extra classes when item is selected
 * ─────────────────────────────────────────────────────────────
 */
export function SearchableSelect({
    options = [],
    value = null,
    onValueChange,
    placeholder = "Search...",
    emptyMessage = "No results found.",
    labelKey = "name",
    valueKey = "id",
    // Loading / async
    isLoading = false,
    loadingMessage = "Loading...",
    // Styling
    className,
    inputClassName,
    dropdownClassName,
    itemClassName,
    selectedItemClassName,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Guard: always treat options as an array
    const safeOptions = Array.isArray(options) ? options : [];

    const filtered = query
        ? safeOptions.filter((o) =>
            String(o[labelKey] ?? "").toLowerCase().includes(query.toLowerCase())
        )
        : safeOptions;

    /** Toggle open/close on click */
    const handleClick = () => {
        if (open) {
            setOpen(false);
            setQuery("");
            inputRef.current?.blur();
        } else {
            setOpen(true);
            setQuery("");
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleChange = (e) => {
        setQuery(e.target.value);
        if (!open) setOpen(true);
    };

    const handleSelect = (option) => {
        onValueChange(option);
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
    };

    // Shown in input: when open → searchable query, when closed → selected label
    const displayValue = open ? query : (value ? value[labelKey] : "");

    return (
        <div ref={wrapperRef} className={cn("relative w-full", className)}>

            {/* ── Trigger Input ── */}
            <div className="relative" onClick={handleClick}>
                <input
                    id="searchable-select"
                    name="searchableSelect"
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    autoComplete="off"
                    readOnly={!open}  // only editable (searchable) when open
                    className={cn(
                        "w-full outline-none border border-searchableselect-border rounded-2xl",
                        "bg-searchableselect-bg text-text placeholder:text-text",
                        "font-medium px-4 pr-10 h-12 shadow-sm",
                        "transition-colors hover:bg-searchableselect-hover",
                        open && "bg-searchableselect-open caret-searchableselect-border",
                        "cursor-pointer select-none",
                        inputClassName
                    )}
                />
                <ChevronsUpDown
                    className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none",
                        "text-text transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </div>

            {/* ── Dropdown ── */}
            {open && (
                <div
                    className={cn(
                        "absolute z-50 mt-1.5 left-0 w-full",
                        "bg-white border border-searchableselect-border/60 rounded-2xl shadow-xl overflow-hidden",
                        dropdownClassName
                    )}
                >
                    <ul className="max-h-[260px] overflow-y-auto py-1.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-1 [&::-webkit-scrollbar-track]:bg-transparent">

                        {/* Loading state */}
                        {isLoading ? (
                            <li className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-slate-400">
                                <Loader2 className="h-4 w-4 animate-spin text-pink-400" />
                                {loadingMessage}
                            </li>

                            /* No results */
                        ) : filtered.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-text text-center">
                                {emptyMessage}
                            </li>

                            /* Options */
                        ) : (
                            filtered.map((option, index) => {
                                // Guard: only match if both sides are defined and equal
                                const optVal = option[valueKey];
                                const selVal = value?.[valueKey];
                                const isSelected = value != null && optVal !== undefined && selVal !== undefined && String(optVal) === String(selVal);
                                return (
                                    <li
                                        key={option[valueKey] ?? index}
                                        onMouseDown={(e) => e.preventDefault()} // keep input focused
                                        onClick={() => handleSelect(option)}
                                        className={cn(
                                            "flex items-center gap-2.5 mx-1 px-3.5 py-3 mb-0.5",
                                            "rounded-xl cursor-pointer text-sm font-medium text-text",
                                            "hover:bg-searchableselect-hover transition-colors select-none",
                                            itemClassName,
                                            isSelected && cn("bg-[#fce7f3] text-text font-semibold", selectedItemClassName)
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "h-3.5 w-3.5 text-pink-400 shrink-0 transition-opacity",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option[labelKey]}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
