export const FILTERS = [
    { key: "all",        label: "advisor.filterAll" },
    { key: "finished",   label: "advisor.filterFinished" },
    { key: "pending",    label: "advisor.filterPending" },
    { key: "approved",   label: "advisor.filterApproved" },
    { key: "notApproved",label: "advisor.filterNotApproved" },
    { key: "paid",       label: "advisor.filterPaid" },
    { key: "notPaid",    label: "advisor.filterNotPaid" },
];

/** Parse the API response object { students: [...], summary: {...} } */
export function parseResponse(raw) {
    if (!raw || typeof raw !== "object") return { students: [], summary: {} };
    return {
        students: Array.isArray(raw.students) ? raw.students : [],
        summary: raw.summary ?? {},
    };
}

export function applyFilter(students, filter) {
    switch (filter) {
        case "finished": return students.filter((s) => s.isRegistrationFinished);
        case "pending": return students.filter((s) => !s.isRegistrationFinished);
        case "approved": return students.filter((s) => s.isAdvisorApproved);
        case "notApproved": return students.filter((s) => !s.isAdvisorApproved);
        case "paid": return students.filter((s) => s.hasPaidFees);
        case "notPaid": return students.filter((s) => !s.hasPaidFees);
        default: return students;
    }
}
