/**
 * Parse a time string to normalized "HH:mm" (24h). Accepts "H:mm", "HH:mm:ss".
 * Returns "" if the value cannot be parsed.
 */
export function normalizeTimeHHmm(value) {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!m) return "";
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
