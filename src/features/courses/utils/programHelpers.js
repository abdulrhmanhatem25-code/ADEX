export const PROGRAM_OPTIONS = [
    { label: "CS", value: "cs", id: 1 },
    { label: "IT", value: "it", id: 2 },
    { label: "Both", value: "both", ids: [1, 2] },
];

export function programIdsToValue(programIds) {
    if (!programIds || programIds.length === 0) return "cs";
    if (programIds.length >= 2) return "both";
    if (programIds.includes(2)) return "it";
    return "cs";
}
