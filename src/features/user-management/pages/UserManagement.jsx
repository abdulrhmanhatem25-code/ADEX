import React, { useState, useEffect, useRef } from "react"
import { Search, Loader2, User, ChevronLeft, ChevronRight, Hash, Mail, Shield, Pencil, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import AdexCard from "@/shared/ui/AdexCard"
import AdexButton from "@/shared/ui/AdexButton"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import useListPage from "@/shared/hooks/useListPage"
import { fetchUsersApi, updateUserRoleApi, getUserPermissionsApi, updateUserPermissionsApi } from "@/features/user-management/services/usersApi"
import { uploadImageApi } from "@/shared/services/staffApi"
import { getFullImageUrl } from "@/shared/services/profileApi"
import { getGroupedPermissions } from "@/shared/constants/permissions"  

const ROLES = ["SuperAdmin","Admin", "Student", "Doctor", "Technical Assistant", "Assistant"]

export default function UserManagement() {
    const { t, i18n } = useTranslation()
    const list = useListPage({ fetchFn: fetchUsersApi, limit: 8 })

    // ── Modals State ──
    const [roleModalOpen, setRoleModalOpen] = useState(false)
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
    
    // ── Form State ──
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [selectedRole, setSelectedRole] = useState("")
    const [selectedPermissions, setSelectedPermissions] = useState([])
    
    // ── Loading State ──
    const [isSavingRole, setIsSavingRole] = useState(false)
    const [isSavingPermissions, setIsSavingPermissions] = useState(false)
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false)

    // ── Handsers ──
    function handleOpenRoleModal(user) {
        setSelectedUserId(user.id)
        setSelectedRole(user.roles?.[0] || "")
        setRoleModalOpen(true)
    }

    async function handleOpenPermissionsModal(user) {
        setSelectedUserId(user.id)
        setSelectedPermissions([])
        setPermissionsModalOpen(true)
        setIsLoadingPermissions(true)

        try {
            const res = await getUserPermissionsApi(user.id)
            setSelectedPermissions(res.data || [])
        } catch (error) {
            console.error("Failed to load permissions:", error)
        } finally {
            setIsLoadingPermissions(false)
        }
    }

    function togglePermission(perm) {
        setSelectedPermissions(prev => 
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        )
    }

    function togglePermissionGroup(groupPermissions) {
        const allSelected = groupPermissions.every(p => selectedPermissions.includes(p))
        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(p => !groupPermissions.includes(p)))
        } else {
            const newToAdd = groupPermissions.filter(p => !selectedPermissions.includes(p))
            setSelectedPermissions(prev => [...prev, ...newToAdd])
        }
    }

    async function handleSaveRoleOnly() {
        if (!selectedUserId || !selectedRole) return
        setIsSavingRole(true)
        try {
            await updateUserRoleApi(selectedUserId, [selectedRole])
            list.reload()
            setRoleModalOpen(false)
        } catch (error) {
            console.error("Failed to update user role:", error)
        } finally {
            setIsSavingRole(false)
        }
    }

    async function handleSavePermissionsOnly() {
        if (!selectedUserId) return
        setIsSavingPermissions(true)
        try {
            await updateUserPermissionsApi(selectedUserId, selectedPermissions)
            list.reload()
            setPermissionsModalOpen(false)
        } catch (error) {
            console.error("Failed to update user permissions:", error)
        } finally {
            setIsSavingPermissions(false)
        }
    }

    // ── Image Handlers ──
    async function handleImageUpload(instructorId, e) {
        if (!instructorId) {
            alert(t("users.noInstructorId", "No Instructor ID linked to this user."))
            return
        }
        const file = e.target.files?.[0]
        if (!file) return

        // Optimistic update
        const tempUrl = URL.createObjectURL(file)
        list.updateItem(u => u.instructorId === instructorId, u => ({ ...u, imageUrl: tempUrl }))

        try {
            await uploadImageApi(instructorId, file)
            list.reload()
        } catch (error) {
            console.error("Failed to upload image:", error)
        } finally {
            e.target.value = "" // clear input
        }
    }

    async function handleDeleteImage(instructorId) {
        if (!instructorId) return
        
        // Optimistic delete
        list.updateItem(u => u.instructorId === instructorId, u => ({ ...u, imageUrl: null }))

        try {
            await uploadImageApi(instructorId, null)
            list.reload()
        } catch (error) {
            console.error("Failed to delete image:", error)
        }
    }

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-4 w-full">
            
            {/* ── Header & Search ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{t('users.title')}</h1>
                    </div>
                    <div className="flex-1 max-w-sm min-w-[200px] relative mt-2 sm:mt-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="user-search"
                            name="userSearch"
                            value={list.search}
                            onChange={(e) => list.setSearch(e.target.value)}
                            placeholder={t('users.searchPlaceholder')}
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition shadow-sm"
                        />
                    </div>
                </div>

                {/* ── Cards Grid ── */}
                {list.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p>{t('users.loading')}</p>
                    </div>
                ) : list.items.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        {t('users.noUsers')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {list.items.map((u) => {
                            const avatarUrl = u.imageUrl;
                            const finalAvatarUrl = getFullImageUrl(avatarUrl) || undefined;

                            return (
                                <AdexCard.Profile
                                    key={u.id}
                                    name={(i18n.language === 'ar' && u.fullNameAr) ? u.fullNameAr : u.fullName}
                                    role={u.roles?.[0] || t('users.noRole')}
                                    avatar={finalAvatarUrl}
                                    avatarSize="w-14 h-14"
                                    roleBg="bg-blue-50"
                                    roleColor="text-blue-600"
                                    className="h-auto"
                                    info={[
                                        { icon: <Hash className="h-3.5 w-3.5" />, text: u.instructorCode || "N/A" },
                                        { icon: <Mail className="h-3.5 w-3.5" />, text: u.email },
                                    ]}
                                    avatarOverlay={
                                        u.instructorId ? (
                                            <>
                                                <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors cursor-pointer z-10 border border-white">
                                                    <Pencil className="w-3 h-3" />
                                                    <input 
                                                        id={`user-avatar-${u.instructorId}`}
                                                        name="userAvatar"
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*" 
                                                        onChange={(e) => handleImageUpload(u.instructorId, e)} 
                                                    />
                                                </label>
                                                {finalAvatarUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteImage(u.instructorId)}
                                                        className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-md hover:bg-red-200 transition-colors z-10 border border-white"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </>
                                        ) : null
                                    }
                                    actions={
                                        <div className="flex gap-2 w-full mt-2">
                                            <AdexButton
                                                variant="none"
                                                type="button"
                                                className="flex-1 min-h-9 rounded-xl py-2 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
                                                icon={<User className="w-3.5 h-3.5 shrink-0" />}
                                                onClick={() => handleOpenRoleModal(u)}
                                            >
                                                {t('users.role')}
                                            </AdexButton>
                                            <AdexButton
                                                variant="none"
                                                type="button"
                                                className="flex-1 min-h-9 rounded-xl py-2 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                                icon={<Shield className="w-3.5 h-3.5 shrink-0" />}
                                                onClick={() => handleOpenPermissionsModal(u)}
                                            >
                                                {t('users.permissions')}
                                            </AdexButton>
                                        </div>
                                    }
                                />
                            )
                        })}
                    </div>
                )}

                {/* ── Pagination ── */}
                {!list.isLoading && list.items.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-5 py-2 rounded-2xl border border-slate-100 shadow-sm text-sm text-slate-500">
                        {list.totalCount && list.totalCount > 1000 ? (
                            <span>{t('users.page', { page: list.page })}</span>
                        ) : (
                            <span>{t('users.showing', { from: (list.page - 1) * list.limit + 1, to: (list.page - 1) * list.limit + list.items.length })}</span>
                        )}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => list.setPage(p => Math.max(1, p - 1))}
                                disabled={list.page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 font-semibold text-slate-700">{t('users.page', { page: list.page })}</span>
                            <button
                                onClick={() => list.setPage(p => p + 1)}
                                disabled={!list.totalPages || list.page >= list.totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Role Edit Modal ── */}
            <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{t('users.roleModal.title')}</DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div>
                            <label htmlFor="user-role-select" className="text-sm font-bold text-slate-800 mb-2 block">{t('users.roleModal.label')}</label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-full bg-white shadow-sm border-slate-200">
                                    <SelectValue placeholder={t('users.roleModal.placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map(role => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-slate-500 mt-2">
                                {t('users.roleModal.hint')}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <AdexButton variant="outline" onClick={() => setRoleModalOpen(false)}>
                            {t('common.cancel')}
                        </AdexButton>
                        <AdexButton onClick={handleSaveRoleOnly} disabled={isSavingRole}>
                            {isSavingRole && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('users.roleModal.save')}
                        </AdexButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Permissions Edit Modal ── */}
            <Dialog open={permissionsModalOpen} onOpenChange={setPermissionsModalOpen}>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[500px] md:max-w-[600px] h-[85vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
                        <DialogTitle>{t('users.permissionsModal.title')}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50/50">
                        {isLoadingPermissions ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-indigo-600 py-10">
                                <Loader2 className="w-5 h-5 animate-spin" /> {t('users.permissionsModal.loading')}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {getGroupedPermissions().map(group => {
                                    const allSelected = group.permissions.every(p => selectedPermissions.includes(p));
                                    return (
                                        <div key={group.groupName} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                                            <div 
                                                className={`px-4 py-3 flex items-center justify-between border-b border-slate-100 cursor-pointer transition-colors ${allSelected ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 hover:bg-slate-100'}`}
                                                onClick={() => togglePermissionGroup(group.permissions)}
                                            >
                                                <span className={`font-bold text-sm capitalize ${allSelected ? 'text-indigo-800' : 'text-slate-700'}`}>
                                                    {group.groupName} <span className="text-[11px] font-medium opacity-60 ml-1">({group.permissions.length})</span>
                                                </span>
                                                <input 
                                                    id={`perm-group-${group.groupName}`}
                                                    name={`permGroup-${group.groupName}`}
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={() => {}} 
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                                                />
                                            </div>
                                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                                                {group.permissions.map(perm => {
                                                    const isChecked = selectedPermissions.includes(perm);
                                                    return (
                                                        <label key={perm} className={`flex items-start gap-2.5 p-2 rounded-md cursor-pointer transition-colors ${isChecked ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                                                            <input 
                                                                id={`perm-${perm}`}
                                                                name={perm}
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => togglePermission(perm)}
                                                                className="mt-0.5 w-4 h-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <span className={`text-xs font-semibold break-words leading-tight mt-[1px] ${isChecked ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                                {perm.split(':')[1] || perm}
                                                            </span>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
                        <AdexButton variant="outline" onClick={() => setPermissionsModalOpen(false)}>
                            {t('common.cancel')}
                        </AdexButton>
                        <AdexButton onClick={handleSavePermissionsOnly} disabled={isSavingPermissions || isLoadingPermissions}>
                            {isSavingPermissions && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('users.permissionsModal.save')}
                        </AdexButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

