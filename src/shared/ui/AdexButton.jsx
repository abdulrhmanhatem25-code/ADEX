import React from 'react';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from "@/shared/lib/utils";

/**
 * Reusable Button component for ADEX
 * @param {Object} props
 * @param {'pink' | 'grey' | 'white' | 'outline'} props.variant - Visual style
 * @param {boolean} props.isLoading - Whether to show loading spinner
 * @param {React.ReactNode} props.icon - Icon to display before text
 * @param {string} props.className - Custom Tailwind classes
 * @param {string} props.textColor - Custom Tailwind classes
 * @param {string} props.to - React Router path — لو حطيت path هنا الزرار يولي Link
 * @param {React.ReactNode} props.iconRight - أيقونة بتظهر بعد النص (يمين)
 */
const AdexButton = ({
    children,
    variant = 'pink',
    isLoading = false,
    icon = null,
    className = "",
    disabled = false,
    bgColor = null,   // Allow custom hex/tailwind bg
    textColor = "", // Allow custom textColor
    to = null,        // React Router path — لو موجود الزرار يبقى Link
    iconRight = null, // أيقونة بتظهر بعد النص
    ...props
}) => {
    // These are just "presets" - everything can be overridden by className
    const variants = {
        pink: "bg-searchableselect-bg hover:bg-searchableselect-bg/80 text-slate-800 border border-searchableselect-border",
        grey: "bg-button-2 hover:bg-button-2-hover text-text shadow-xl/20 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-100",
        base: "bg-button-1 hover:bg-button-1-hover border-1 border-button-1-border text-text shadow-xl/20 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-100",
        outline: "bg-transparent hover:bg-slate-50 text-slate-400 border-slate-200",
        white: "bg-white text-text",
        none: "", // No default styles
    };

    const sharedClassName = cn(
        "flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 flex-shrink-0",
        variant !== 'none' && "rounded-2xl h-11 px-6 sm:px-9 text-sm",
        variants[variant],
        textColor,
        className
    );

    const content = (
        <>
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
                icon && <span className="shrink-0">{icon}</span>  // أيقونة قبل النص
            )}
            {children && <span>{children}</span>}
            {/* أيقونة بعد النص */}
            {!isLoading && iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
    );

    // لو في "to" → الزرار يبقى <Link> ويروح للصفحة المطلوبة
    if (to) {
        return (
            <Link
                to={to}
                style={{ backgroundColor: bgColor }}
                className={sharedClassName}
                {...props}
            >
                {content}
            </Link>
        );
    }

    // عادي → زرار button
    return (
        <button
            disabled={isLoading || disabled}
            style={{ backgroundColor: bgColor}}
            className={sharedClassName}
            {...props}
        >
            {content}
        </button>
    );
};

export default AdexButton;
