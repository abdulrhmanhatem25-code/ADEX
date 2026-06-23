import React, { useState } from "react";
import { Plus, X } from "lucide-react";

/**
 * Tag-style input for entering course codes (or any string tags).
 *
 * @param {string[]} tags      - Current tags
 * @param {Function} onAdd     - (tag: string) => void
 * @param {Function} onRemove  - (tag: string) => void
 * @param {string}   [placeholder="Enter code..."]
 * @param {string}   [emptyText="No items added"]
 * @param {string}   [addLabel="ADD"]
 */
export default function CourseTagInput({
    tags,
    onAdd,
    onRemove,
    placeholder = "Enter code...",
    emptyText = "No items added",
    addLabel = "ADD",
}) {
    const [input, setInput] = useState("");

    const handleAdd = () => {
        const val = input.trim().toUpperCase();
        if (!val || tags.includes(val)) { setInput(""); return; }
        onAdd(val);
        setInput("");
    };

    return (
        <div className="space-y-2">
            <div className="border border-slate-200/60 rounded-xl px-3 py-2 min-h-[42px] flex flex-wrap gap-2 bg-slate-50/50 backdrop-blur-sm">
                {tags.length === 0 && <span className="text-[10px] text-slate-400 my-auto font-medium">{emptyText}</span>}
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/80 rounded-lg text-[10px] font-semibold text-slate-600 shadow-sm transition-all hover:border-indigo-200">
                        {tag}
                        <button type="button" onClick={() => onRemove(tag)} className="text-slate-300 hover:text-red-500 transition-colors ml-1"><X className="h-3 w-3" /></button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    id="course-tag-input"
                    name="courseTag"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAdd())}
                    placeholder={placeholder}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-100/50 border-slate-200 outline-none transition-all placeholder:text-slate-300"
                />
                <button type="button" onClick={handleAdd} className="px-4 py-2 rounded-xl bg-button-add border border-button-add-border shadow-md text-text text-[10px] font-bold hover:bg-button-add-hover transition-all flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" />{addLabel}
                </button>
            </div>
        </div>
    );
}
