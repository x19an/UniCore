export type { Activity } from "@/lib/types";
import { Activity } from "@/lib/types";

export type ActivityCategory = "Learning" | "Health" | "Productivity" | "Mindfulness" | "Other";

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  "Learning",
  "Health",
  "Productivity",
  "Mindfulness",
  "Other",
];

export interface HabitTemplate {
  name: string;
  description: string;
  targetTimeMinutes: number;
  category: ActivityCategory;
  frequencyLabel: string;
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    name: "French Practice",
    description: "Duolingo, vocabulary cards, or conversation",
    targetTimeMinutes: 90,
    category: "Learning",
    frequencyLabel: "3x / week (30m)",
  },
  {
    name: "Morning Run",
    description: "Outdoor jog or treadmill cardio",
    targetTimeMinutes: 180,
    category: "Health",
    frequencyLabel: "3x / week (60m)",
  },
  {
    name: "Read a Book",
    description: "Non-fiction, career, or fiction reading",
    targetTimeMinutes: 140,
    category: "Learning",
    frequencyLabel: "Daily (20m/day)",
  },
  {
    name: "Deep Work & Coding",
    description: "Focused uninterrupted programming",
    targetTimeMinutes: 300,
    category: "Productivity",
    frequencyLabel: "5x / week (60m)",
  },
  {
    name: "Mindful Meditation",
    description: "Breathing exercise or guided meditation",
    targetTimeMinutes: 70,
    category: "Mindfulness",
    frequencyLabel: "Daily (10m/day)",
  },
  {
    name: "Strength Workout",
    description: "Gym resistance training or calisthenics",
    targetTimeMinutes: 150,
    category: "Health",
    frequencyLabel: "3x / week (50m)",
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    name: "French Practice",
    description: "Duolingo or Anki flashcards",
    targetTimeMinutes: 90,
    completedTimeMinutes: 45,
    currentStreak: 12,
    longestStreak: 45,
    category: "Learning",
  },
  {
    id: "2",
    name: "Morning Run",
    description: "At least 3km cardio session",
    targetTimeMinutes: 180,
    completedTimeMinutes: 180,
    currentStreak: 4,
    longestStreak: 12,
    category: "Health",
  },
  {
    id: "3",
    name: "Read a Book",
    description: "Non-fiction reading before bed",
    targetTimeMinutes: 120,
    completedTimeMinutes: 30,
    currentStreak: 0,
    longestStreak: 20,
    category: "Learning",
  },
  {
    id: "4",
    name: "Deep Work",
    description: "Uninterrupted coding sessions",
    targetTimeMinutes: 600,
    completedTimeMinutes: 450,
    currentStreak: 5,
    longestStreak: 5,
    category: "Productivity",
  },
  {
    id: "5",
    name: "Meditation",
    description: "Mindful breathing and relaxation",
    targetTimeMinutes: 70,
    completedTimeMinutes: 70,
    currentStreak: 42,
    longestStreak: 60,
    category: "Mindfulness",
  },
];

export const formatTimeMinutes = (mins: number): string => {
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};
