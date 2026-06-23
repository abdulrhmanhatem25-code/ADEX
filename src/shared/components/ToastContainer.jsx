import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import toast from "@/shared/lib/toast";

/* ── Single Toast Item ────────────────────────────────── */
function ToastItem({ item, onRemove }) {
    const isSuccess = item.type === "success";
    const [exiting, setExiting] = useState(false);

    const dismiss = useCallback(() => {
        setExiting(true);
        setTimeout(() => onRemove(item.id), 300);
    }, [item.id, onRemove]);

    useEffect(() => {
        const timer = setTimeout(dismiss, 4500);
        return () => clearTimeout(timer);
    }, [dismiss]);

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                minWidth: 320,
                maxWidth: 500,
                padding: "14px 18px",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                lineHeight: 1.5,
                backdropFilter: "blur(12px)",
                boxShadow: isSuccess
                    ? "0 8px 32px rgba(16,185,129,.3), 0 0 0 1px rgba(16,185,129,.15)"
                    : "0 8px 32px rgba(239,68,68,.3), 0 0 0 1px rgba(239,68,68,.15)",
                background: isSuccess
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                animation: exiting
                    ? "adex-toast-out .3s ease-in forwards"
                    : "adex-toast-in .35s cubic-bezier(.21,1.02,.73,1)",
                pointerEvents: "auto",
            }}
        >
            {isSuccess ? (
                <CheckCircle2 style={{ width: 20, height: 20, flexShrink: 0 }} />
            ) : (
                <AlertCircle style={{ width: 20, height: 20, flexShrink: 0 }} />
            )}
            <span style={{ flex: 1, whiteSpace: "pre-wrap" }}>{item.message}</span>
            <button
                onClick={(e) => { e.stopPropagation(); dismiss(); }}
                style={{
                    background: "rgba(255,255,255,.18)",
                    border: "none",
                    borderRadius: 8,
                    padding: 5,
                    cursor: "pointer",
                    display: "flex",
                    color: "#fff",
                    transition: "background .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.18)")}
            >
                <X style={{ width: 14, height: 14 }} />
            </button>
        </div>
    );
}

/* ── Global Toast Container ───────────────────────────── */
export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const unsubscribe = toast.subscribe((item) => {
            setToasts((prev) => [...prev, item]);
        });
        return unsubscribe;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    if (toasts.length === 0) return null;

    return createPortal(
        <div
            style={{
                position: "fixed",
                top: 24,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 99999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                pointerEvents: "none",
            }}
        >
            {toasts.map((item) => (
                <ToastItem key={item.id} item={item} onRemove={removeToast} />
            ))}

            <style>{`
                @keyframes adex-toast-in {
                    from { opacity: 0; transform: translateY(-18px) scale(.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes adex-toast-out {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to   { opacity: 0; transform: translateY(-12px) scale(.96); }
                }
            `}</style>
        </div>,
        document.body
    );
}
