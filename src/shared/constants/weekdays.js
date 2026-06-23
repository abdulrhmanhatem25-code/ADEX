/** API / form values are English weekday names. */
export const WEEKDAY_OPTIONS = [
  { value: "Sunday", labelEn: "Sunday", labelAr: "الأحد" },
  { value: "Monday", labelEn: "Monday", labelAr: "الاثنين" },
  { value: "Tuesday", labelEn: "Tuesday", labelAr: "الثلاثاء" },
  { value: "Wednesday", labelEn: "Wednesday", labelAr: "الأربعاء" },
  { value: "Thursday", labelEn: "Thursday", labelAr: "الخميس" },
  { value: "Friday", labelEn: "Friday", labelAr: "الجمعة" },
  { value: "Saturday", labelEn: "Saturday", labelAr: "السبت" },
];

export function weekdayLabel(row, isAr) {
  if (!row) return "";
  return isAr ? row.labelAr : row.labelEn;
}
