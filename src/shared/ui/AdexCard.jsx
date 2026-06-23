import React from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// AdexCard — Full control over every visual property
//
// Variants:
//   AdexCard.Action  — أيقونة + نص (للنافيجيشن)
//   AdexCard.Feature — أيقونة + عنوان + وصف
//   AdexCard.Profile — كارت شخص بمعلومات وأزرار
//   AdexCard.Stat    — رقم + أيقونة + تسمية
//   AdexCard.Panel   — غلاف أبيض للمحتوى (مخططات، جداول…)
// ─────────────────────────────────────────────────────────────────────────────

// ── Helper: IconBox ───────────────────────────────────────────────────────────
// Props:
//   icon            — الأيقونة نفسها (ReactNode)
//   iconColor       — كلاس لون الأيقونة (tailwind)
//   iconBg          — كلاس لون الـ bg (tailwind)
//   iconSize        — كلاس حجم الصندوق (tailwind)       default: "w-12 h-12"
//   iconRadius      — كلاس radius الصندوق               default: "rounded-2xl"
//   iconClassName   — كلاسات إضافية للصندوق
function IconBox({
    icon,
    iconColor = "",
    iconBg = "",
    iconSize = "w-12 h-12",
    iconRadius = "rounded-2xl",
    iconClassName,
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-center flex-shrink-0 transition-all duration-200",
                iconSize,
                iconRadius,
                iconColor,
                iconBg,
                iconClassName
            )}
        >
            {icon}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant 1: ACTION CARD
// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   icon            — الأيقونة
//   label           — النص تحت الأيقونة
//   to              — React Router path (يخلي الكارد لينك)
//   onClick         — دالة لما تضغط
//   iconColor       — كلاس لون الأيقونة
//   iconBg          — كلاس لون الـ bg
//   iconSize        — حجم صندوق الأيقونة (tailwind class)
//   iconRadius      — radius صندوق الأيقونة
//   iconClassName   — كلاسات إضافية لصندوق الأيقونة
//   labelColor      — لون النص          default: "text-(--text-color)"
//   labelSize       — حجم النص (tailwind class)
//   labelClassName  — كلاسات إضافية للنص
//   bg              — لون خلفية الكارد  default: "bg-(--light-color)"
//   border          — بوردر الكارد      default: "border border-slate-100"
//   shadow          — ظل الكارد         default: "shadow-sm"
//   radius          — radius الكارد     default: "rounded-2xl"
//   padding         — padding الكارد    default: "p-6"
//   hover           — هوفر الكارد       default: "hover:shadow-lg hover:-translate-y-1"
//   className       — على الـ wrapper الخارجي (flex-1 / w-full / etc.)
//   cardClassName   — كلاسات على الكارد الداخلي (للـ visuals)
function ActionCard({
    icon,
    label,
    to,
    onClick,
    // Icon styling
    iconColor,
    iconBg,
    iconSize = "w-14 h-14",
    iconRadius = "rounded-2xl",
    iconClassName,
    // Label styling
    labelColor = "text-(--text-color)",
    labelSize = "text-sm",
    labelClassName,
    // Card styling
    bg = "bg-card",
    border = "border border-card-border",
    shadow = "shadow-sm",
    radius = "rounded-2xl",
    padding = "p-6",
    hover = "hover:shadow-lg hover:-translate-y-1",
    className,
    cardClassName,
}) {
    const cardClass = cn(
        "flex flex-col items-center justify-center gap-3 h-full",
        "transition-all duration-200 cursor-pointer select-none",
        bg, border, shadow, radius, padding, hover,
        cardClassName
    );

    const content = (
        <div className={cardClass}>
            <IconBox
                icon={icon}
                iconColor={iconColor}
                iconBg={iconBg}
                iconSize={iconSize}
                iconRadius={iconRadius}
                iconClassName={iconClassName}
            />
            <span className={cn("font-semibold text-center", labelSize, labelColor, labelClassName)}>
                {label}
            </span>
        </div>
    );

    if (to) return (
        <Link to={to} className={cn("no-underline", className)}>
            {content}
        </Link>
    );
    return (
        <div className={className} onClick={onClick}>
            {content}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant 2: FEATURE CARD
// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   icon, title, description, to
//   iconColor / iconBg / iconSize / iconRadius / iconClassName
//   titleColor / titleSize / titleClassName
//   descColor / descSize / descClassName
//   bg / border / shadow / radius / padding / hover
//   className     → على الـ wrapper الخارجي (flex-1 / w-full / etc.)
//   cardClassName → على الكارد الداخلي (visuals إضافية)
function FeatureCard({
    icon,
    title,
    description,
    to,
    onClick,
    // Icon
    iconColor,
    iconBg,
    iconSize = "w-12 h-12",
    iconRadius = "rounded-xl",
    iconClassName,
    // Text
    titleColor = "text-slate-800",
    titleSize = "text-[15px]",
    titleClassName,
    descColor = "text-(--description-color)",
    descSize = "text-xs",
    descClassName,
    // Card
    bg = "bg-card",
    border = "border border-card-border",
    shadow = "shadow-sm",
    radius = "rounded-2xl",
    padding = "p-5",
    hover = "hover:shadow-md hover:-translate-y-0.5",
    // className → wrapper الخارجي (للـ flex / grid layout)
    className,
    // cardClassName → الكارد الداخلي (visuals)
    cardClassName,
}) {
    const cardClass = cn(
        "flex flex-col gap-3 h-full",
        "transition-all duration-200",
        to || onClick ? "cursor-pointer" : "",
        bg, border, shadow, radius, padding, hover,
        cardClassName
    );

    const content = (
        <div className={cardClass}>
            <IconBox
                icon={icon}
                iconColor={iconColor}
                iconBg={iconBg}
                iconSize={iconSize}
                iconRadius={iconRadius}
                iconClassName={iconClassName}
            />
            <div>
                <p className={cn("font-bold leading-snug mb-1", titleSize, titleColor, titleClassName)}>
                    {title}
                </p>
                {description && (
                    <p className={cn("leading-relaxed break-words", descSize, descColor, descClassName)}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );

    if (to) return (
        <Link to={to} className={cn("no-underline", className)}>
            {content}
        </Link>
    );
    return (
        <div className={className} onClick={onClick}>
            {content}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant 3: PROFILE CARD
// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   name            — الاسم
//   role            — الدور (Professor, Assistant…)
//   info            — [{ icon, text }]
//   avatar          — URL صورة (اختياري)
//   onEdit          — دالة Edit Profile
//   onDelete        — دالة Delete
//   onOptions       — دالة ⋮
//   actions         — ReactNode بديل لصف الأزرار
//   editLabel       — نص زرار Edit      default: "Edit Profile"
//   deleteLabel     — نص زرار Delete    default: "Delete"
//   // Avatar
//   avatarSize      — حجم الأفاتار      default: "w-11 h-11"
//   avatarBg        — لون خلفية الأفاتار
//   avatarTextColor — لون الحرف في الأفاتار
//   // Role badge
//   roleBg          — خلفية الـ badge   default: "bg-indigo-100"
//   roleColor       — لون نص الـ badge  default: "text-indigo-600"
//   // Name
//   nameColor       — لون الاسم
//   nameSize        — حجم الاسم
//   // Info
//   infoColor       — لون صفوف الـ info
//   // Edit/Delete buttons
//   editBg          — خلفية زرار Edit
//   editTextColor   — لون نص Edit
//   deleteBg        — خلفية زرار Delete
//   deleteTextColor — لون نص Delete
//   // Card
//   bg / border / shadow / radius / padding / hover / className
function ProfileCard({
    name,
    role,
    info = [],
    avatar,
    onEdit,
    onDelete,
    onOptions,
    actions,
    avatarOverlay,
    // Labels
    editLabel = "Edit Profile",
    deleteLabel = "Delete",
    // Avatar
    avatarSize = "w-11 h-11",
    avatarBg = "bg-slate-200",
    avatarTextColor = "text-slate-600",
    // Role badge
    roleBg = "bg-indigo-100",
    roleColor = "text-indigo-600",
    // Name
    nameColor = "text-slate-800",
    nameSize = "text-[15px]",
    // Info
    infoColor = "text-slate-500",
    // Buttons
    editBg = "bg-slate-50 hover:bg-slate-100",
    editTextColor = "text-slate-600",
    deleteBg = "bg-red-50 hover:bg-red-100",
    deleteTextColor = "text-red-400",
    // Card
    bg = "bg-white",
    border = "border border-slate-100",
    shadow = "shadow-sm",
    radius = "rounded-2xl",
    padding = "p-4",
    hover = "hover:shadow-md",
    className,
}) {
    const initials = name ? name.trim()[0].toUpperCase() : "?";
    const useCustomActions = actions !== undefined;
    const showFooter = useCustomActions ? actions != null : Boolean(onEdit || onDelete);

    return (
        <div className={cn(
            "flex flex-col gap-4 transition-shadow duration-200",
            bg, border, shadow, radius, padding, hover,
            className
        )}>
            {/* Top: avatar + name + role + options */}
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                    <div className={cn(
                        "flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden",
                        avatarSize, avatarBg
                    )}>
                        {avatar
                            ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            : <span className={cn("font-bold text-sm", avatarTextColor)}>{initials}</span>
                        }
                    </div>
                    {avatarOverlay}
                </div>

                {/* Name + Role */}
                <div className="flex-1 min-w-0">
                    <p className={cn("font-bold leading-tight truncate", nameSize, nameColor)}>{name}</p>
                    {role && (
                        <span className={cn(
                            "inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
                            roleBg, roleColor
                        )}>
                            {role}
                        </span>
                    )}
                </div>

                {/* Options ⋮ */}
                {onOptions && (
                    <button
                        onClick={onOptions}
                        className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0 p-0.5"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Info rows */}
            {info.length > 0 && (
                <div className={cn("flex flex-col gap-2 text-xs", infoColor)}>
                    {info.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            {item.icon && <span className="text-slate-400 flex-shrink-0">{item.icon}</span>}
                            <span className="truncate">{item.text}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Divider */}
            {showFooter && <div className="border-t border-slate-100" />}

            {/* Action buttons */}
            {showFooter &&
                (useCustomActions ? (
                    actions
                ) : (
                    <div className="flex gap-2">
                        {onEdit && (
                            <button
                                type="button"
                                onClick={onEdit}
                                className={cn(
                                    "flex-1 text-sm font-medium py-2 rounded-xl transition-colors",
                                    editBg,
                                    editTextColor
                                )}
                            >
                                {editLabel}
                            </button>
                        )}
                        {onDelete && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className={cn(
                                    "flex-1 text-sm font-semibold py-2 rounded-xl transition-colors",
                                    deleteBg,
                                    deleteTextColor
                                )}
                            >
                                {deleteLabel}
                            </button>
                        )}
                    </div>
                ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant 4: STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   icon, value, label
//   iconColor / iconBg / iconSize / iconRadius / iconClassName
//   valueColor      — لون الرقم         default: "text-slate-800"
//   valueSize       — حجم الرقم         default: "text-2xl"
//   valueClassName
//   labelColor      — لون التسمية       default: "text-slate-400"
//   labelSize       — حجم التسمية       default: "text-xs"
//   labelClassName
//   bg / border / shadow / radius / padding / hover / className
function StatCard({
    icon,
    value,
    label,
    // Icon
    iconColor,
    iconBg,
    iconSize = "w-10 h-10",
    iconRadius = "rounded-xl",
    iconClassName,
    // Value
    valueColor = "text-slate-800",
    valueSize = "text-2xl",
    valueClassName,
    // Label
    labelColor = "text-slate-400",
    labelSize = "text-xs",
    labelClassName,
    // Card
    bg = "bg-white",
    border = "border border-slate-100",
    shadow = "shadow-sm",
    radius = "rounded-2xl",
    padding = "px-5 py-4",
    hover = "hover:shadow-md hover:-translate-y-0.5",
    className,
}) {
    return (
        <div className={cn(
            "flex items-center gap-4 transition-all duration-200",
            bg, border, shadow, radius, padding, hover,
            className
        )}>
            <IconBox
                icon={icon}
                iconColor={iconColor}
                iconBg={iconBg}
                iconSize={iconSize}
                iconRadius={iconRadius}
                iconClassName={iconClassName}
            />
            <div>
                <p className={cn("font-extrabold leading-none", valueSize, valueColor, valueClassName)}>
                    {value}
                </p>
                <p className={cn("mt-0.5 font-medium", labelSize, labelColor, labelClassName)}>
                    {label}
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant 5: PANEL — غلاف أبيض للمحتوى (مخططات، قوائم…)
// ─────────────────────────────────────────────────────────────────────────────
function PanelCard({
    children,
    className,
    padding = "p-5",
    bg = "bg-white",
    border = "border border-slate-100",
    shadow = "shadow-sm",
    radius = "rounded-2xl",
}) {
    return (
        <div className={cn(bg, border, shadow, radius, padding, className)}>{children}</div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
const AdexCard = {
    Action: ActionCard,
    Feature: FeatureCard,
    Profile: ProfileCard,
    Stat: StatCard,
    Panel: PanelCard,
};

export default AdexCard;
export { ActionCard, FeatureCard, ProfileCard, StatCard, PanelCard };
