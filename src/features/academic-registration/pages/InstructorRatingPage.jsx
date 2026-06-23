import React, { useState } from "react";
import {
    Star,
    Send,
    Loader2,
    MessageSquare,
    Sparkles,
    CheckCircle2,
    Award,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { submitInstructorRatingApi } from "@/shared/services/enrollmentsApi";
import { useProfile } from "@/app/providers/ProfileProvider";

const QUICK_COMMENTS = [
    { label: "👍 Great experience", value: "Great experience" },
    { label: "⚡ Fast & easy", value: "Fast and easy process" },
    { label: "🎯 Very helpful", value: "Very helpful" },
    { label: "📚 Knowledgeable", value: "Very knowledgeable instructor" },
    { label: "🤝 Supportive", value: "Very supportive and understanding" },
    { label: "💡 Needs improvement", value: "Needs some improvement" },
    { label: "😐 Average", value: "Average experience" },
    { label: "⏰ Punctual", value: "Always punctual and organized" },
];

const STAR_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
const STAR_COLORS = [
    "text-red-400",
    "text-orange-400",
    "text-amber-400",
    "text-lime-500",
    "text-emerald-500",
];

export default function InstructorRatingPage() {
    const { currentInstructorId } = useProfile();

    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const activeStar = hoveredStar || rating;

    const handleQuickComment = (value) => {
        setComment((prev) => (prev ? prev + ", " + value : value));
    };

    const handleSubmit = async () => {
        if (rating === 0 || !currentInstructorId) return;
        setIsSubmitting(true);
        try {
            await submitInstructorRatingApi({
                instructorId: currentInstructorId,
                ratingScore: rating,
                comment,
            });
            setSubmitted(true);
        } catch {
            // Error toast handled by global interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setRating(0);
        setHoveredStar(0);
        setComment("");
        setSubmitted(false);
    };

    return (
        <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" />
                    Rate Instructor
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Share your feedback about the instructor. Your rating helps improve the experience.
                </p>
            </div>

            <div className="max-w-xl mx-auto">
                {submitted ? (
                    /* ── Success State ── */
                    <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
                        {/* Success gradient header */}
                        <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-6 py-8">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-extrabold text-white mb-1">Thank You!</h2>
                                <p className="text-emerald-100 text-sm max-w-xs">
                                    Your feedback has been submitted successfully. We appreciate your time!
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-6 flex flex-col items-center gap-3">
                            {/* Show submitted rating */}
                            <div className="flex items-center gap-1.5 mb-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={cn(
                                            "w-6 h-6 transition-colors",
                                            s <= rating
                                                ? "fill-amber-400 text-amber-400"
                                                : "fill-transparent text-slate-200"
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-slate-400">
                                You rated: <span className="font-bold text-slate-700">{STAR_LABELS[rating - 1]}</span>
                            </p>

                            <button
                                onClick={handleReset}
                                className="mt-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
                            >
                                Submit Another Rating
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── Rating Form ── */
                    <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden">
                        {/* Gradient header */}
                        <div className="relative bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 px-6 pt-7 pb-5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2.5 mb-1">
                                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-extrabold text-white tracking-tight">
                                        Rate Your Experience
                                    </h2>
                                </div>
                                <p className="text-indigo-100 text-sm mt-1">
                                    How was your experience? Your feedback helps us improve the process.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-6 space-y-6">
                            {/* Star Rating */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const isActive = star <= activeStar;
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredStar(star)}
                                                onMouseLeave={() => setHoveredStar(0)}
                                                className={cn(
                                                    "p-1.5 rounded-xl transition-all duration-200 hover:scale-110",
                                                    isActive ? "scale-105" : "hover:bg-slate-50"
                                                )}
                                            >
                                                <Star
                                                    className={cn(
                                                        "w-9 h-9 transition-colors duration-200",
                                                        isActive
                                                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                                                            : "fill-transparent text-slate-200"
                                                    )}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2 h-6 transition-all duration-200",
                                    activeStar > 0 ? "opacity-100" : "opacity-50"
                                )}>
                                    {activeStar > 0 ? (
                                        <>
                                            <span className={cn(
                                                "text-sm font-bold",
                                                STAR_COLORS[activeStar - 1]
                                            )}>
                                                {STAR_LABELS[activeStar - 1]}
                                            </span>
                                            <span className="text-xs text-slate-300">
                                                ({activeStar}/5)
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-xs font-medium text-slate-300">
                                            Tap a star to rate
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Comment Chips */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-2.5 flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Quick feedback
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_COMMENTS.map((chip) => (
                                        <button
                                            key={chip.value}
                                            type="button"
                                            onClick={() => handleQuickComment(chip.value)}
                                            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-150 active:scale-95"
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
                                    rows={4}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all resize-none"
                                />
                                {comment && (
                                    <p className="text-xs text-slate-300 mt-1 text-right">
                                        {comment.length} characters
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="button"
                                disabled={rating === 0 || isSubmitting || !currentInstructorId}
                                onClick={handleSubmit}
                                className={cn(
                                    "w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-200",
                                    rating > 0 && !isSubmitting && currentInstructorId
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-200/50 active:scale-[0.98]"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                                ) : (
                                    <><Send className="w-4 h-4" />Submit Rating</>
                                )}
                            </button>

                            {!currentInstructorId && (
                                <p className="text-xs text-center text-red-400">
                                    Unable to detect your instructor ID. Please contact support.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
