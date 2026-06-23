import React, { useEffect, useRef, useState } from "react"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import AdexButton from "@/shared/ui/AdexButton"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/shared/lib/utils"
import { updateProfileApi, updateProfileImageApi, changePasswordApi } from "@/shared/services/profileApi"
import { useAuth } from "@/app/providers/AuthProvider"
import { useProfile } from "@/app/providers/ProfileProvider"

const TAB_EDIT = "edit"
const TAB_SECURITY = "security"

const inputClass =
    "h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs text-sky-600 placeholder:text-sky-400/70 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 md:text-xs disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
const labelClass = "text-[11px] font-semibold text-slate-800 leading-tight"

function SettingsField({ label, htmlFor, children }) {
    return (
        <div className="space-y-1">
            <label htmlFor={htmlFor} className={labelClass}>{label}</label>
            {children}
        </div>
    )
}

export default function Settings() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState(TAB_EDIT)
    const fileRef = useRef(null)
    const [avatarPreview, setAvatarPreview] = useState(null)

    const { hasPermission } = useAuth()
    const { userProfile, profileImageUrl, refreshProfile } = useProfile()
    const isStudent = userProfile?.roles?.includes("Student")
    const canManageSettings = !isStudent && hasPermission("settings:manage")
    
    const canEditProfile = canManageSettings || isStudent
    const canEditPassword = canManageSettings

    // ── Profile State ────────────────────────────────────────────────────────
    const [profile, setProfile] = useState(null)   // null = not loaded yet
    const [profileLoading, setProfileLoading] = useState(true)
    const [profileError, setProfileError] = useState(null)
    const [profileSaving, setProfileSaving] = useState(false)
    const [profileMsg, setProfileMsg] = useState(null)   // { type: "success"|"error", text }

    // ── Security State ───────────────────────────────────────────────────────
    const [security, setSecurity] = useState({ currentPassword: "", newPassword: "" })
    const [secSaving, setSecSaving] = useState(false)
    const [secMsg, setSecMsg] = useState(null)   // { type: "success"|"error", text }

    // ── Load Profile: from context (single source of truth) ──────────────────
    useEffect(() => {
        if (userProfile) {
            setProfile({
                fullName:    userProfile.fullName ?? "",
                fullNameAr:  userProfile.fullNameAr ?? "",
                email:       userProfile.email ?? "",
                phoneNumber: userProfile.phoneNumber ?? "",
                roles:       userProfile.roles ?? [],
                imageUrl:    profileImageUrl,
            })
            if (profileImageUrl) setAvatarPreview(profileImageUrl)
            setProfileLoading(false)
        } else {
            setProfileLoading(true)
        }
    }, [userProfile, profileImageUrl])

    // ── Handlers ─────────────────────────────────────────────────────────────
    async function handleAvatarPick(e) {
        const file = e.target.files?.[0]
        if (!file) return
        // Show preview immediately
        setAvatarPreview(URL.createObjectURL(file))
        // Upload to server
        try {
            await updateProfileImageApi(file)
            setProfileMsg({ type: "success", text: t("settings.messages.photoUpdated") })
            await refreshProfile()
        } catch {
            setProfileMsg({ type: "error", text: t("settings.messages.photoUploadFailed") })
        }
    }

    async function handleDeleteAvatar() {
        try {
            setAvatarPreview(null)
            await updateProfileImageApi(null)
            setProfileMsg({ type: "success", text: t("settings.messages.photoDeleted") })
            await refreshProfile()
        } catch {
            setProfileMsg({ type: "error", text: t("settings.messages.photoDeleteFailed") })
        }
    }

    async function handleSaveProfile() {
        setProfileSaving(true)
        setProfileMsg(null)
        try {
            await updateProfileApi({
                fullName:    profile.fullName,
                fullNameAr:  profile.fullNameAr,
                email:       profile.email,
                phoneNumber: profile.phoneNumber,
            })
            setProfileMsg({ type: "success", text: t("settings.messages.profileSaved") })
            await refreshProfile()
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.title ||
                t("settings.messages.profileSaveFailed")
            setProfileMsg({ type: "error", text: msg })
        } finally {
            setProfileSaving(false)
        }
    }

    async function handleChangePassword() {
        if (!security.currentPassword || !security.newPassword) {
            setSecMsg({ type: "error", text: t("settings.messages.fillBothPasswords") })
            return
        }
        setSecSaving(true)
        setSecMsg(null)
        try {
            await changePasswordApi({
                currentPassword: security.currentPassword,
                newPassword:     security.newPassword,
            })
            setSecMsg({ type: "success", text: t("settings.messages.passwordChanged") })
            setSecurity({ currentPassword: "", newPassword: "" })
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.title ||
                t("settings.messages.passwordChangeFailed")
            setSecMsg({ type: "error", text: msg })
        } finally {
            setSecSaving(false)
        }
    }

    // ── Shared Feedback banner ─────────────────────────────────────────────
    function FeedbackBanner({ msg }) {
        if (!msg) return null
        const colors = {
            success: "bg-green-50 border-green-200 text-green-700",
            error:   "bg-red-50   border-red-200   text-red-600",
            info:    "bg-blue-50  border-blue-200  text-blue-700",
        }
        return (
            <p className={cn("text-xs px-3 py-2 rounded-lg border mt-3", colors[msg.type])}>
                {msg.text}
            </p>
        )
    }

    return (
        <div className="min-h-0 max-w-full">
            <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-100 bg-white px-4 py-3 sm:px-5 sm:py-4 shadow-sm">

                {/* Tabs */}
                <div className="flex gap-6 border-b border-slate-100 mb-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab(TAB_EDIT)}
                        className={cn(
                            "pb-2 text-xs font-semibold transition-colors relative",
                            activeTab === TAB_EDIT
                                ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {t("settings.editProfile")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab(TAB_SECURITY)}
                        className={cn(
                            "pb-2 text-xs font-semibold transition-colors relative",
                            activeTab === TAB_SECURITY
                                ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {t("settings.security")}
                    </button>
                </div>

                {/* ── Edit Profile Tab ─────────────────────────────────── */}
                {activeTab === TAB_EDIT && (
                    <div>
                        {/* Loading */}
                        {profileLoading && (
                            <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs">{t("settings.loadingProfile")}</span>
                            </div>
                        )}

                        {/* Error */}
                        {!profileLoading && profileError && (
                            <p className="text-xs text-red-500 py-6 text-center">{profileError}</p>
                        )}

                        {/* Content */}
                        {!profileLoading && !profileError && profile && (
                            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start">
                                {/* Avatar */}
                                <div className="flex lg:flex-col items-center lg:items-start gap-2 shrink-0">
                                    <div className="relative">
                                        <Avatar className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow ring-1 ring-slate-100">
                                            <AvatarImage src={avatarPreview} className="object-cover" />
                                            <AvatarFallback className="bg-slate-200 text-slate-500 font-bold text-3xl">
                                                {profile.fullName ? profile.fullName[0].toUpperCase() : "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        {canEditProfile && (
                                            <button
                                                type="button"
                                                onClick={() => fileRef.current?.click()}
                                                className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors z-10"
                                                aria-label={t("settings.changePhoto")}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        
                                        {canEditProfile && avatarPreview && (
                                            <button
                                                type="button"
                                                onClick={handleDeleteAvatar}
                                                className="absolute -bottom-0.5 left-0 w-7 h-7 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center justify-center shadow-md hover:bg-red-200 transition-colors z-10"
                                                aria-label={t("settings.deletePhoto")}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <input
                                            id="settings-avatar"
                                            name="avatar"
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={!canEditProfile}
                                            onChange={handleAvatarPick}
                                        />
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="min-w-0 flex-1">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 sm:gap-y-2.5">
                                        <SettingsField label={t("settings.fullName")} htmlFor="settings-fullname">
                                            <Input
                                                id="settings-fullname"
                                                name="fullName"
                                                autoComplete="name"
                                                className={inputClass}
                                                value={profile.fullName}
                                                disabled={!canEditProfile}
                                                onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                                            />
                                        </SettingsField>
                                        <SettingsField label={t("settings.fullNameAr")} htmlFor="settings-fullname-ar">
                                            <Input
                                                id="settings-fullname-ar"
                                                name="fullNameAr"
                                                autoComplete="name"
                                                className={cn(inputClass, "text-right")}
                                                dir="rtl"
                                                value={profile.fullNameAr}
                                                disabled={!canEditProfile}
                                                onChange={(e) => setProfile((p) => ({ ...p, fullNameAr: e.target.value }))}
                                            />
                                        </SettingsField>
                                        <SettingsField label={t("settings.email")} htmlFor="settings-email">
                                            <Input
                                                id="settings-email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                className={inputClass}
                                                value={profile.email}
                                                disabled={!canEditProfile}
                                                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                                            />
                                        </SettingsField>
                                        <SettingsField label={t("settings.phoneNumber")} htmlFor="settings-phone">
                                            <Input
                                                id="settings-phone"
                                                name="phoneNumber"
                                                type="tel"
                                                autoComplete="tel"
                                                className={inputClass}
                                                placeholder={t("settings.phonePlaceholder")}
                                                value={profile.phoneNumber}
                                                disabled={!canEditProfile}
                                                onChange={(e) => setProfile((p) => ({ ...p, phoneNumber: e.target.value }))}
                                            />
                                        </SettingsField>
                                    </div>

                                    <FeedbackBanner msg={profileMsg} />

                                    {canEditProfile && (
                                        <div className="flex justify-end mt-4">
                                            <AdexButton
                                                variant="none"
                                                type="button"
                                                disabled={profileSaving}
                                                className="h-8 min-w-[96px] rounded-lg px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-60"
                                                onClick={handleSaveProfile}
                                            >
                                                {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t("settings.save")}
                                            </AdexButton>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Security Tab ─────────────────────────────────────── */}
                {activeTab === TAB_SECURITY && (
                    <div className="w-full">
                        <h2 className="text-sm font-bold text-slate-800 mb-3">{t("settings.changePassword")}</h2>
                        <div className="space-y-3">
                            <SettingsField label={t("settings.currentPassword")} htmlFor="settings-current-password">
                                <Input
                                    id="settings-current-password"
                                    name="currentPassword"
                                    type="password"
                                    autoComplete="current-password"
                                    className={inputClass}
                                    placeholder={t("settings.passwordPlaceholder")}
                                    value={security.currentPassword}
                                    disabled={!canEditPassword}
                                    onChange={(e) => setSecurity((s) => ({ ...s, currentPassword: e.target.value }))}
                                />
                            </SettingsField>
                            <SettingsField label={t("settings.newPassword")} htmlFor="settings-new-password">
                                <Input
                                    id="settings-new-password"
                                    name="newPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    className={inputClass}
                                    placeholder={t("settings.passwordPlaceholder")}
                                    value={security.newPassword}
                                    disabled={!canEditPassword}
                                    onChange={(e) => setSecurity((s) => ({ ...s, newPassword: e.target.value }))}
                                />
                            </SettingsField>
                        </div>

                        <FeedbackBanner msg={secMsg} />

                        {canEditPassword && (
                            <div className="flex justify-end mt-4">
                                <AdexButton
                                    variant="none"
                                    type="button"
                                    disabled={secSaving}
                                    className="h-8 min-w-[96px] rounded-lg px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-60"
                                    onClick={handleChangePassword}
                                >
                                    {secSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t("settings.save")}
                                </AdexButton>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}
