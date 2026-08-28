import { Goal, GoalStatus } from "./types";
import { format, formatDistanceToNow, isBefore, isValid, parseISO, startOfDay } from "date-fns";

/**
 * Safely parse a date string or Date object
 */
export function parseSafeDate(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isValid(dateInput) ? dateInput : null;
  }
  
  if (typeof dateInput === "string") {
    // If it's a simple YYYY-MM-DD format, parse as local date to prevent UTC shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split("-").map(Number);
      const parsed = new Date(year, month - 1, day);
      return isValid(parsed) ? parsed : null;
    }
    
    // Otherwise try parseISO
    const parsed = parseISO(dateInput);
    if (isValid(parsed)) return parsed;
    
    // Fallback to standard Date constructor
    const fallback = new Date(dateInput);
    if (isValid(fallback)) return fallback;
  }
  
  return null;
}

/**
 * Formats a goal target date nicely (e.g. "Aug 28, 2026")
 */
export function formatGoalDate(dateInput?: string | Date | null): string {
  const date = parseSafeDate(dateInput);
  if (!date) return "";
  try {
    return format(date, "MMM d, yyyy");
  } catch {
    return "";
  }
}

/**
 * Formats a relative date (e.g. "2 hours ago")
 */
export function formatRelativeDate(dateInput?: string | Date | null): string {
  const date = parseSafeDate(dateInput);
  if (!date) return "recently";
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "recently";
  }
}

/**
 * Formats full date and time (e.g. "Aug 28, 2026 at 2:30 PM")
 */
export function formatFullDateTime(dateInput?: string | Date | null): string {
  const date = parseSafeDate(dateInput);
  if (!date) return "";
  try {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch {
    return "";
  }
}

/**
 * Checks if a goal is past its target date and not yet completed
 */
export function isGoalOverdue(goal: Goal): boolean {
  if (goal.status === "done" || !goal.targetDate) return false;
  const targetDate = parseSafeDate(goal.targetDate);
  if (!targetDate) return false;
  
  const today = startOfDay(new Date());
  return isBefore(startOfDay(targetDate), today);
}

/**
 * Generates a unique ID
 */
export function generateUniqueId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const STATUS_CONFIG: Record<GoalStatus, StatusConfig> = {
  "not-started": {
    label: "Not Started",
    badgeClass: "bg-muted text-muted-foreground border-border/60 hover:bg-muted/80",
    dotClass: "bg-muted-foreground/60",
  },
  "in-progress": {
    label: "In Progress",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
    dotClass: "bg-amber-500 animate-pulse",
  },
  "done": {
    label: "Done",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
};
