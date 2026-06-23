import React, { useState, useCallback } from "react";
import { syncExternalApi } from "@/features/schedule/services/scheduleApi";
import {
  Loader2, Zap, CheckCircle2, XCircle, RefreshCw, Server
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

/* ─── Status Phases ────────────────────────────────────────── */
const STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  SUCCESS: "success",
  ERROR: "error",
};

/* ─── Main Page ────────────────────────────────────────────── */
export default function GenerateSchedule() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastRun, setLastRun] = useState(null);

  const handleSync = useCallback(async () => {
    setStatus(STATUS.RUNNING);
    setErrorMsg("");
    try {
      await syncExternalApi();
      setStatus(STATUS.SUCCESS);
      setLastRun(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Something went wrong"
      );
      setStatus(STATUS.ERROR);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStatus(STATUS.IDLE);
    setErrorMsg("");
  }, []);

  return (
    <div className="p-4 sm:p-5 max-w-[720px] mx-auto flex flex-col items-center justify-center min-h-[70vh] gap-8">

      {/* ── Hero Card ──────────────────────────────────────── */}
      <div className="w-full bg-gen-card border border-gen-card-border rounded-2xl shadow-sm overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-gen-accent via-gen-accent-mid to-gen-accent-end" />

        <div className="px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center text-center">

          {/* Icon */}
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500",
            status === STATUS.IDLE && "bg-gen-icon-bg text-gen-accent",
            status === STATUS.RUNNING && "bg-gen-icon-bg text-gen-accent animate-pulse",
            status === STATUS.SUCCESS && "bg-gen-success-bg text-gen-success",
            status === STATUS.ERROR && "bg-gen-error-bg text-gen-error",
          )}>
            {status === STATUS.IDLE && <Server className="w-7 h-7" />}
            {status === STATUS.RUNNING && <Loader2 className="w-7 h-7 animate-spin" />}
            {status === STATUS.SUCCESS && <CheckCircle2 className="w-7 h-7" />}
            {status === STATUS.ERROR && <XCircle className="w-7 h-7" />}
          </div>

          {/* Title */}
          <h1 className="text-xl font-extrabold text-gen-title tracking-tight">
            Schedule Generation
          </h1>
          <p className="text-sm text-gen-subtitle mt-1.5 max-w-md leading-relaxed">
            Synchronize external scheduling data and generate the master timetable in one click.
          </p>

          {/* Status feedback */}
          {status === STATUS.SUCCESS && (
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-gen-success bg-gen-success-bg px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-4 h-4" />
              Sync completed successfully
              {lastRun && <span className="text-gen-success/70 font-medium ml-1">at {lastRun}</span>}
            </div>
          )}

          {status === STATUS.ERROR && (
            <div className="mt-5 w-full max-w-sm text-sm font-semibold text-gen-error bg-gen-error-bg px-4 py-2.5 rounded-xl animate-in fade-in zoom-in-95 duration-300 text-left">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 shrink-0" />
                Sync failed
              </div>
              {errorMsg && (
                <p className="text-gen-error/80 text-xs font-medium pl-6 break-words">{errorMsg}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex items-center gap-3 w-full max-w-xs">
            {status === STATUS.ERROR ? (
              <>
                <button
                  onClick={handleSync}
                  className="flex-1 flex items-center justify-center gap-2 bg-gen-accent text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-[0.97] transition-all shadow-md"
                >
                  <RefreshCw className="w-4 h-4" /> Retry
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 bg-gen-muted text-gen-muted-text py-3 px-5 rounded-xl font-semibold text-sm hover:brightness-95 active:scale-[0.97] transition-all border border-gen-card-border"
                >
                  Dismiss
                </button>
              </>
            ) : status === STATUS.SUCCESS ? (
              <button
                onClick={handleSync}
                className="flex-1 flex items-center justify-center gap-2 bg-gen-muted text-gen-muted-text py-3 rounded-xl font-bold text-sm hover:brightness-95 active:scale-[0.97] transition-all border border-gen-card-border"
              >
                <RefreshCw className="w-4 h-4" /> Run Again
              </button>
            ) : (
              <button
                disabled={status === STATUS.RUNNING}
                onClick={handleSync}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg",
                  status === STATUS.RUNNING
                    ? "bg-gen-accent/70 text-white cursor-wait"
                    : "bg-gen-accent text-white hover:brightness-110 hover:shadow-xl active:scale-[0.97]"
                )}
              >
                {status === STATUS.RUNNING ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Syncing…
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Sync & Generate
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── Info note ──────────────────────────────────────── */}
      <p className="text-xs text-gen-subtitle text-center max-w-sm leading-relaxed">
        This will call the external sync endpoint. Make sure all prerequisite data (courses, instructors, rooms) is up to date before proceeding.
      </p>
    </div>
  );
}
