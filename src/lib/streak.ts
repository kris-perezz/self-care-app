/**
 * Compute an updated streak value based on the last active date and timezone.
 * Call this when a goal is completed.
 */
export function computeStreak(
  currentStreak: number,
  lastActiveDate: string | null,
  timezone: string
): { newStreak: number; todayStr: string } {
  const todayStr = getTodayInTimezone(timezone);

  if (!lastActiveDate) {
    // First ever goal completion
    return { newStreak: 1, todayStr };
  }

  if (lastActiveDate === todayStr) {
    // Already active today — no streak change
    return { newStreak: currentStreak, todayStr };
  }

  const yesterday = getYesterdayInTimezone(timezone);
  if (lastActiveDate === yesterday) {
    // Consecutive day — increment
    return { newStreak: currentStreak + 1, todayStr };
  }

  // Gap — reset to 1
  return { newStreak: 1, todayStr };
}

function getTodayInTimezone(timezone: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
}

function getYesterdayInTimezone(timezone: string): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toLocaleDateString("en-CA", { timeZone: timezone });
}

/** Get today's date string in a given timezone (YYYY-MM-DD format) */
export function getToday(timezone: string): string {
  return getTodayInTimezone(timezone);
}

/**
 * Returns true if an interval goal is currently due.
 * - hours: exact elapsed ms >= interval * 3600000
 * - days: calendar days elapsed (in user's timezone) >= interval
 * - months: calendar months elapsed, with 31st-overflow normalization
 */
export function getIsDue(
  goal: {
    recurrence_interval: number;
    recurrence_unit: "hours" | "days" | "months";
    last_completed_at: string | null;
  },
  timezone: string
): boolean {
  if (!goal.last_completed_at) return true;

  const now = new Date();
  const completed = new Date(goal.last_completed_at);

  if (goal.recurrence_unit === "hours") {
    const elapsedMs = now.getTime() - completed.getTime();
    return elapsedMs >= goal.recurrence_interval * 60 * 60 * 1000;
  }

  if (goal.recurrence_unit === "days") {
    const completedDay = completed.toLocaleDateString("en-CA", { timeZone: timezone });
    const nowDay = now.toLocaleDateString("en-CA", { timeZone: timezone });
    const [cy, cm, cd] = completedDay.split("-").map(Number);
    const [ny, nm, nd] = nowDay.split("-").map(Number);
    const completedDate = new Date(cy, cm - 1, cd);
    const nowDate = new Date(ny, nm - 1, nd);
    const daysDiff = Math.round(
      (nowDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff >= goal.recurrence_interval;
  }

  if (goal.recurrence_unit === "months") {
    const completedLocal = new Date(
      completed.toLocaleString("en-US", { timeZone: timezone })
    );
    const nowLocal = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const nextDue = new Date(completedLocal);
    nextDue.setMonth(nextDue.getMonth() + goal.recurrence_interval);
    // Normalize 31st overflow: if day shifted, roll back to last day of target month
    if (nextDue.getDate() < completedLocal.getDate()) {
      nextDue.setDate(0);
    }
    return nowLocal >= nextDue;
  }

  return false;
}
