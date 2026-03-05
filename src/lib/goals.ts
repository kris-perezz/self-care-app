export const DAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export const DAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const DAYS = DAY_SHORT.map((label, value) => ({ label, value }));

export function formatRecurringDays(days: number[]): string {
  if (!days || days.length === 0) return "";
  const sorted = [...days].sort((a, b) => a - b);
  const sortedStr = sorted.join(",");
  if (sorted.length === 7) return "Daily";
  if (sortedStr === "1,2,3,4,5") return "Weekdays";
  if (sortedStr === "0,6") return "Weekends";
  return sorted.map((d) => DAY_SHORT[d]).join(" · ");
}
