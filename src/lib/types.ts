export type Course = {
  id: string;
  name: string;
  code?: string;
  days?: string[]; // e.g. ["Mon", "Wed", "Fri"]
  creditHours?: number;
  requiredAttendance?: number; // e.g. 75
  isDeleted?: boolean;
  deletedAt?: Date | string;
};

export type SessionStatus = 'attended' | 'missed' | 'cancelled';

export type Session = {
  id: string;
  courseId: string;
  date: string; // ISO string format
  status: SessionStatus;
  periodNumber?: number; // Added to support double periods
  isDeleted?: boolean;
  deletedAt?: Date | string;
};

// Goals Types
export type GoalStatus = 'not-started' | 'in-progress' | 'done';
export type GoalType = 'long-term' | 'short-term';

export interface CheckIn {
  id: string;
  date: string;
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: GoalStatus;
  type: GoalType;
  checkIns?: CheckIn[];
  isDeleted?: boolean;
  deletedAt?: Date | string;
}

// Todos Types
export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | string;
  tags?: string[];
  course?: string;
  isCompleted: boolean;
  completedAt?: Date | string;
  priority?: Priority;
  isDeleted?: boolean;
  deletedAt?: Date | string;
}

// Streaks Types
export type Activity = {
  id: string;
  name: string;
  description: string;
  targetTimeMinutes: number;
  completedTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  category: "Learning" | "Health" | "Productivity" | "Mindfulness" | "Other";
  lastResetDate?: string;
  isDeleted?: boolean;
  deletedAt?: Date | string;
};

// Notes Types
export type Note = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  date: string; // YYYY-MM-DD
  lectureNumber: number;
  content: string; // Markdown/HTML snippet
  tags: string[];
  isDeleted?: boolean;
  deletedAt?: Date | string;
};
