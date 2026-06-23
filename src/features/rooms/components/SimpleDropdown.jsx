import React, { useState } from "react";

export default function SimpleDropdown({ value, options, onChange, placeholder = "Select..." }) {
    const [open, setOpen] = useState(false);
    const selected = options.find(o => o.value === value || o.name === value);
    
    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm transition focus:outline-none bg-white ${selected ? "text-slate-800" : "text-slate-400"} ${open ? "border-indigo-300 ring-2 ring-indigo-200" : "border-slate-200"}`}
            >
                <span>{selected ? selected.name : placeholder}</span>
                <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${value === opt.value ? "bg-indigo-500 text-white" : "text-slate-700 hover:bg-slate-50"}`}
                            >
                                {opt.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
