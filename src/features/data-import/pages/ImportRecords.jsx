import React, { useRef, useState, useCallback } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2, CloudUpload } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "@/shared/lib/api";

// ─── Format bytes ─────────────────────────────────────────────────────────────
function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── File Row ─────────────────────────────────────────────────────────────────
function FileRow({ file, onRemove, disabled }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm group hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
            </div>
            {!disabled && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

// ─── Result Item ──────────────────────────────────────────────────────────────
function ResultItem({ item, idx }) {
    const { t } = useTranslation();
    const ok = item.success ?? item.isSuccess ?? !item.error;
    return (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border text-sm ${ok ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-600"}`}>
            {ok
                ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            }
            <div className="min-w-0">
                <p className="font-semibold truncate">{item.fileName ?? t("dataImport.fileX", { idx: idx + 1 })}</p>
                <p className="text-xs mt-0.5 opacity-80">
                    {ok
                        ? (item.message ?? t("dataImport.importedSuccess", { count: item.recordsImported ?? "" }))
                        : (item.error ?? item.message ?? t("dataImport.importFailed"))}
                </p>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ImportRecords() {
    const { t } = useTranslation();
    const inputRef = useRef(null);
    const [files, setFiles] = useState([]);      // File[]
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [results, setResults] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const ACCEPT = ".xlsx,.xls,.csv";

    // ── Add files (dedup by name) ─────────────────────────────────────────────
    const addFiles = useCallback((incoming) => {
        const valid = Array.from(incoming).filter(f =>
            /\.(xlsx|xls|csv)$/i.test(f.name)
        );
        setFiles(prev => {
            const existingNames = new Set(prev.map(f => f.name));
            const fresh = valid.filter(f => !existingNames.has(f.name));
            return [...prev, ...fresh];
        });
    }, []);

    const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

    // ── Drag-and-drop ─────────────────────────────────────────────────────────
    const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (files.length === 0) return;
        setStatus("loading");
        setResults(null);
        setErrorMsg("");

        try {
            const fd = new FormData();
            // API expects: files[] (array of files under the key "files")
            files.forEach(f => fd.append("files", f));

            const res = await api.post("/StudentAcademicRecords/import", fd);
            setResults(Array.isArray(res.data) ? res.data : [res.data]);
            setStatus("success");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.title ||
                (typeof err?.response?.data === "string" ? err.response.data : null) ||
                err.message ||
                t("dataImport.uploadFailed");
            setErrorMsg(msg);
            setStatus("error");
        }
    };

    const reset = () => {
        setFiles([]);
        setStatus("idle");
        setResults(null);
        setErrorMsg("");
    };

    const isLoading = status === "loading";

    return (
        <div className="min-h-0 max-w-full space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-xl font-extrabold text-slate-900">{t("dataImport.title")}</h1>
                <p className="text-sm text-slate-400 mt-1">
                    {t("dataImport.subtitle")}
                </p>
            </div>

            <div className="max-w-2xl space-y-4">

                {/* Drop Zone */}
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => !isLoading && inputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-3xl border-2 border-dashed cursor-pointer transition-all select-none
                        ${isDragging
                            ? "border-indigo-400 bg-indigo-50/60 scale-[1.01]"
                            : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30"
                        }
                        ${isLoading ? "pointer-events-none opacity-60" : ""}
                    `}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-indigo-100" : "bg-white border border-slate-100 shadow-sm"}`}>
                        <CloudUpload className={`h-6 w-6 transition-colors ${isDragging ? "text-indigo-500" : "text-slate-400"}`} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">
                            {isDragging ? t("dataImport.dropFilesHere") : t("dataImport.dragDropFiles")}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{t("dataImport.clickToBrowse")}<span className="font-semibold">.xlsx, .xls, .csv</span></p>
                    </div>
                    <input
                        id="import-files"
                        name="importFiles"
                        ref={inputRef}
                        type="file"
                        accept={ACCEPT}
                        multiple
                        className="hidden"
                        onChange={e => { addFiles(e.target.files); e.target.value = ""; }}
                    />
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                {files.length === 1 ? t("dataImport.filesSelected", { count: 1 }) : t("dataImport.filesSelected_plural", { count: files.length })}
                            </p>
                            {!isLoading && (
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="text-xs text-slate-400 hover:text-red-400 transition-colors font-semibold"
                                >
                                    {t("dataImport.clearAll")}
                                </button>
                            )}
                        </div>
                        {files.map((f, idx) => (
                            <FileRow
                                key={`${f.name}-${idx}`}
                                file={f}
                                onRemove={() => removeFile(idx)}
                                disabled={isLoading}
                            />
                        ))}
                    </div>
                )}

                {/* Error banner */}
                {status === "error" && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                {/* Results */}
                {results && results.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("dataImport.importResults")}</p>
                        {results.map((item, idx) => (
                            <ResultBadge key={idx} item={item} idx={idx} />
                        ))}
                    </div>
                )}

                {/* Raw response (if results is not an array of known shape) */}
                {results && results.length === 1 && typeof results[0] === "object" && !("success" in results[0]) && !("isSuccess" in results[0]) && !("error" in results[0]) && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-bold text-slate-500 mb-2">{t("dataImport.serverResponse")}</p>
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap break-all">
                            {JSON.stringify(results[0], null, 2)}
                        </pre>
                    </div>
                )}

                {/* Submit / Reset buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={status === "success" || status === "error" ? reset : handleSubmit}
                        disabled={files.length === 0 && status === "idle"}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
                            ${status === "success"
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : status === "error"
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-slate-900 hover:bg-black text-white"
                            }
                        `}
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {status === "idle" && <Upload className="h-4 w-4" />}
                        {status === "success" && <CheckCircle2 className="h-4 w-4" />}
                        {status === "error" && <AlertCircle className="h-4 w-4" />}

                        {isLoading && t("dataImport.importing")}
                        {status === "idle" && (files.length === 0 ? t("dataImport.importFiles") : (files.length === 1 ? t("dataImport.importCountFile", { count: 1 }) : t("dataImport.importCountFile_plural", { count: files.length })))}
                        {status === "success" && t("dataImport.importAnother")}
                        {status === "error" && t("dataImport.tryAgain")}
                    </button>

                    {files.length > 0 && (
                        <button
                            type="button"
                            onClick={() => !isLoading && inputRef.current?.click()}
                            disabled={isLoading}
                            className="px-5 py-3 rounded-2xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40"
                        >
                            {t("dataImport.addMore")}
                        </button>
                    )}
                </div>

                {/* Endpoint info */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-600">POST</span>
                    <code className="text-xs text-slate-500 truncate">/api/StudentAcademicRecords/import</code>
                </div>
            </div>
        </div>
    );
}
