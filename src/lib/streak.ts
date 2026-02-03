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
