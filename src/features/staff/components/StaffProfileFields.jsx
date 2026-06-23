import React from "react";

/**
 * Shared name / email / password / code / TA type fields for add & edit staff modals.
 * @param {boolean} [showPassword=true] - set false for edit when API body has no password field
 */
export default function StaffProfileFields({ form, setForm, role, taTypes, isAr, showPassword = true }) {
  return (
    <>
      {role === "ta" && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Type</label>
          <div className="flex gap-2">
            {taTypes.map(({ key, en, ar }) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm({ ...form, typeKey: key })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all
                  ${form.typeKey === key ? "bg-select-bg border-select-border text-white shadow-md" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                {isAr ? ar : en}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="staff-first-name" className="text-xs font-semibold text-slate-500">First Name (English)</label>
          <input
            id="staff-first-name"
            name="firstName"
            placeholder="e.g. Ahmed"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="staff-first-name-ar" className="text-xs font-semibold text-slate-500">First Name (Arabic)</label>
          <input
            id="staff-first-name-ar"
            name="firstNameAr"
            placeholder="أحمد"
            value={form.firstNameAr}
            onChange={(e) => setForm({ ...form, firstNameAr: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
            dir="rtl"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="staff-last-name" className="text-xs font-semibold text-slate-500">Last Name (English)</label>
          <input
            id="staff-last-name"
            name="lastName"
            placeholder="e.g. Ali"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="staff-last-name-ar" className="text-xs font-semibold text-slate-500">Last Name (Arabic)</label>
          <input
            id="staff-last-name-ar"
            name="lastNameAr"
            placeholder="علي"
            value={form.lastNameAr}
            onChange={(e) => setForm({ ...form, lastNameAr: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
            dir="rtl"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="staff-email" className="text-xs font-semibold text-slate-500">Email</label>
        <input
          id="staff-email"
          name="email"
          placeholder="ahmed.ali@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
          dir="ltr"
        />
      </div>

      {showPassword && (
      <div className="space-y-1.5">
        <label htmlFor="staff-password" className="text-xs font-semibold text-slate-500">Password</label>
        <input
          id="staff-password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
          dir="ltr"
        />
      </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="staff-code" className="text-xs font-semibold text-slate-500">Instructor Code</label>
        <input
          id="staff-code"
          name="instructorCode"
          placeholder={role === "doctor" ? "e.g. DR-101" : "e.g. TA-101"}
          value={form.instructorCode}
          onChange={(e) => setForm({ ...form, instructorCode: e.target.value })}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
          dir="ltr"
        />
      </div>
    </>
  );
}
