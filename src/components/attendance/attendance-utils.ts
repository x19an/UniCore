import { Course, Session, SessionStatus } from "./types";

/**
 * Returns YYYY-MM-DD in local time
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * Normalizes day name strings like "Monday", "mon", "Tue", "thursday" into "Mon", "Tue", etc.
 */
export function normalizeDayName(raw: string): string | null {
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return null;

  if (cleaned.startsWith("mon")) return "Mon";
  if (cleaned.startsWith("tue") || cleaned === "tu") return "Tue";
  if (cleaned.startsWith("wed") || cleaned === "w") return "Wed";
  if (cleaned.startsWith("thu") || cleaned === "th" || cleaned.startsWith("thur")) return "Thu";
  if (cleaned.startsWith("fri") || cleaned === "f") return "Fri";
  if (cleaned.startsWith("sat") || cleaned === "sa") return "Sat";
  if (cleaned.startsWith("sun") || cleaned === "su") return "Sun";

  return null;
}

/**
 * Parses a day entry such as "Mon 2", "Monday (2)", "Wed: 2", "Fri"
 * into a standardized day string and number of periods.
 */
export function parseDayAndPeriods(dayEntry: string): { day: string; periods: number } | null {
  const trimmed = dayEntry.trim();
  if (!trimmed) return null;

  // Extract any number in the string
  const numberMatch = trimmed.match(/\b\d+\b/);
  const periods = numberMatch ? Math.max(1, Math.min(10, parseInt(numberMatch[0], 10))) : 1;

  // Extract day portion
  const dayMatch = trimmed.match(/^[A-Za-z]+/);
  if (!dayMatch) return null;

  const normalizedDay = normalizeDayName(dayMatch[0]);
  if (!normalizedDay) return null;

  return {
    day: normalizedDay,
    periods,
  };
}

/**
 * Parses course days array into a Map of Day -> Periods (e.g. { "Mon": 2, "Wed": 1 })
 */
export function parseCourseDaysMap(days?: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  if (!days || !Array.isArray(days)) return map;

  days.forEach(d => {
    const parsed = parseDayAndPeriods(d);
    if (parsed) {
      map[parsed.day] = (map[parsed.day] || 0) + parsed.periods;
    }
  });

  return map;
}

/**
 * Formats a day string for beautiful UI display (e.g. "Mon 2" -> "Mon (2 periods)")
 */
export function formatDayDisplay(dayEntry: string): string {
  const parsed = parseDayAndPeriods(dayEntry);
  if (!parsed) return dayEntry;
  if (parsed.periods > 1) {
    return `${parsed.day} (${parsed.periods} periods)`;
  }
  return parsed.day;
}

export interface AttendanceCalculationResult {
  total: number;
  attended: number;
  missed: number;
  cancelled: number;
  percentage: number;
  statusText: string;
  statusColor: string;
  canMiss: number;
  mustAttend: number;
  isAtRisk: boolean;
  isImpossible: boolean;
}

/**
 * Calculates accurate attendance statistics using integer arithmetic to prevent floating-point bugs.
 */
export function calculateCourseAttendance(course: Course, sessions: Session[]): AttendanceCalculationResult {
  const courseSessions = sessions.filter(s => s.courseId === course.id && !s.isDeleted);
  const relevant = courseSessions.filter(s => s.status !== "cancelled");
  const total = relevant.length;
  const attended = relevant.filter(s => s.status === "attended").length;
  const missed = relevant.filter(s => s.status === "missed").length;
  const cancelled = courseSessions.filter(s => s.status === "cancelled").length;

  const percentage = total === 0 ? 100 : (attended / total) * 100;
  const required = course.requiredAttendance ?? 75;

  let canMiss = 0;
  let mustAttend = 0;
  let statusText = "";
  let statusColor = "";
  let isAtRisk = false;
  let isImpossible = false;

  if (total === 0) {
    statusText = "No classes logged yet.";
    statusColor = "text-muted-foreground";
  } else if (required <= 0) {
    statusText = "No minimum attendance required.";
    statusColor = "text-green-500 dark:text-green-400";
    canMiss = Infinity;
  } else if (percentage >= required) {
    // Formula for safe misses: largest integer M such that attended / (total + M) >= required / 100
    // => required * M <= 100 * attended - required * total
    // => M = floor((100 * attended - required * total) / required)
    canMiss = Math.max(0, Math.floor((100 * attended - required * total) / required));
    if (canMiss === 0) {
      statusText = "On track. Do not miss the next class to maintain threshold.";
      statusColor = "text-amber-500 dark:text-amber-400";
      isAtRisk = true;
    } else {
      statusText = `You can safely miss ${canMiss} more class${canMiss !== 1 ? "es" : ""}.`;
      statusColor = "text-green-500 dark:text-green-400";
    }
  } else {
    isAtRisk = true;
    if (required >= 100) {
      isImpossible = true;
      mustAttend = Infinity;
      statusText = "Cannot reach 100% requirement once a class is missed.";
      statusColor = "text-destructive dark:text-red-400";
    } else {
      // Formula for classes to attend: smallest integer A such that (attended + A) / (total + A) >= required / 100
      // => (100 - required) * A >= required * total - 100 * attended
      // => A = ceil((required * total - 100 * attended) / (100 - required))
      mustAttend = Math.max(1, Math.ceil((required * total - 100 * attended) / (100 - required)));
      statusText = `You must attend ${mustAttend} consecutive class${mustAttend !== 1 ? "es" : ""} to reach ${required}%.`;
      statusColor = "text-destructive dark:text-red-400";
    }
  }

  return {
    total,
    attended,
    missed,
    cancelled,
    percentage,
    statusText,
    statusColor,
    canMiss,
    mustAttend,
    isAtRisk,
    isImpossible,
  };
}
