import React, { useRef } from "react";
import { User, X } from "lucide-react";

/**
 * Profile image uploader — stores raw File for FormData upload.
 *
 * @param {string}   previewUrl   - URL to display (blob URL or server URL)
 * @param {Function} onFileChange - (file: File|null, previewUrl: string) => void
 */
export default function ImageUploader({ previewUrl, onFileChange }) {
    const inputRef = useRef(null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        onFileChange(file, preview);
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-img-upload-border hover:bg-white transition-all group"
        >
            {/* Avatar preview */}
            <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border border-slate-200 bg-white flex items-center justify-center shadow-sm">
                {previewUrl
                    ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    : <User className="h-4 w-4 text-slate-400" />
                }
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-600 truncate">
                    {previewUrl ? "Photo selected" : "Upload profile photo"}
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG · max 5MB</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {previewUrl && (
                    <button
                        type="button"
                        onClick={() => onFileChange(null, "")}
                        className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove photo"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
                <span
                    onClick={() => inputRef.current?.click()}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-button-add-border group-hover:text-text transition-colors whitespace-nowrap"
                >
                    Browse
                </span>
            </div>

            <input id="image-upload" name="profileImage" ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
    );
}
