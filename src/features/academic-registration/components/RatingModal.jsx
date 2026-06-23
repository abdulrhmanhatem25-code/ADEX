import React, { useState } from "react";
import { Star, Send, Loader2, MessageSquare, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { submitRatingApi } from "@/shared/services/enrollmentsApi";

const QUICK_COMMENTS = [
    { label: "👍 Great experience", value: "Great experience" },
    { label: "⚡ Fast & easy", value: "Fast and easy process" },
    { label: "🎯 Very helpful", value: "Very helpful system" },
    { label: "💡 Needs improvement", value: "Needs some improvement" },
    { label: "😐 Average", value: "Average experience" },
];

const STAR_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function RatingModal({ open, onOpenChange, studentId }) {
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleQuickComment = (value) => {
        setComment((prev) => (prev ? prev + ", " + value : value));
    };

    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        try {
            await submitRatingApi({ studentId, ratingScore: rating, comment });
            setSubmitted(true);
        } catch {
            // Error toast is handled globally by the api interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset after animation
        setTimeout(() => {
            setRating(0);
            setHoveredStar(0);
            setComment("");
            setSubmitted(false);
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md overflow-hidden p-0" showCloseButton={false} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 px-6 pt-7 pb-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <DialogTitle className="text-lg font-extrabold text-white tracking-tight">
                                Rate Your Experience
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-indigo-100 text-sm mt-1">
                            How was the enrollment process? Your feedback helps us improve.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {submitted ? (
                    /* ── Success State ── */
                    <div className="px-6 py-10 flex flex-col items-center gap-3 text-center animate-in fade-in-0 zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900">Thank you!</h3>
                        <p className="text-sm text-slate-400 max-w-xs">
                            Your feedback has been submitted successfully. We appreciate your time!
                        </p>
                        <button
                            onClick={handleClose}
                            className="mt-3 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    /* ── Rating Form ── */
                    <div className="px-6 py-5 space-y-5">
                        {/* Star Rating */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isActive = star <= (hoveredStar || rating);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            className={cn(
                                                "p-1 rounded-lg transition-all duration-200 hover:scale-110",
                                                isActive ? "scale-105" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <Star
                                                className={cn(
                                                    "w-8 h-8 transition-colors duration-200",
                                                    isActive
                                                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                                                        : "fill-transparent text-slate-200"
                                                )}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            <p className={cn(
                                "text-xs font-semibold h-4 transition-colors",
                                (hoveredStar || rating) > 0 ? "text-amber-500" : "text-slate-300"
                            )}>
                                {(hoveredStar || rating) > 0
                                    ? STAR_LABELS[(hoveredStar || rating) - 1]
                                    : "Select a rating"}
                            </p>
                        </div>

                        {/* Quick Comment Chips */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5" />
                                Quick feedback
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_COMMENTS.map((chip) => (
                                    <button
                                        key={chip.value}
                                        type="button"
                                        onClick={() => handleQuickComment(chip.value)}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-150"
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment Textarea */}
                        <div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your feedback here... (optional)"
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                disabled={rating === 0 || isSubmitting}
                                onClick={handleSubmit}
                                className={cn(
                                    "flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all",
                                    rating > 0 && !isSubmitting
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-200/50"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                                ) : (
                                    <><Send className="w-4 h-4" />Submit</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
