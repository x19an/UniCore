import { Goal } from "./types";

export const MOCK_GOALS: Goal[] = [
  {
    id: "mock-goal-1",
    title: "Master AI Engineering & Full-Stack Cloud Architecture",
    description: "Deep dive into generative AI agents, vector databases, microservices, and distributed systems.",
    targetDate: "2027-12-31",
    status: "in-progress",
    type: "long-term",
    checkIns: [
      {
        id: "mock-checkin-1",
        date: "2026-08-25T10:00:00.000Z",
        notes: "Completed building multi-agent workflow architecture with automated tool dispatch.",
      },
      {
        id: "mock-checkin-2",
        date: "2026-08-18T14:30:00.000Z",
        notes: "Set up vector search pipelines and RAG evaluation benchmarks.",
      },
    ],
  },
  {
    id: "mock-goal-2",
    title: "Launch Future Helper Platform & Scale to 10k Active Users",
    description: "Ship polished productivity suite, launch on Product Hunt, gather user feedback, and iterate.",
    targetDate: "2027-06-30",
    status: "not-started",
    type: "long-term",
    checkIns: [],
  },
  {
    id: "mock-goal-3",
    title: "Run a Half-Marathon (21.1 km)",
    description: "Build weekly running volume to 30km/week, maintain proper nutrition and recovery.",
    targetDate: "2026-11-15",
    status: "in-progress",
    type: "long-term",
    checkIns: [
      {
        id: "mock-checkin-3",
        date: "2026-08-26T08:15:00.000Z",
        notes: "Hit 10k tempo run at 5:15/km pace. Feeling strong!",
      },
    ],
  },
  {
    id: "mock-goal-4",
    title: "Finalize Goals module QA and test hydration",
    description: "Verify all edge cases, dialog forms, date formatting, and dark mode styling.",
    targetDate: "2026-08-30",
    status: "in-progress",
    type: "short-term",
    checkIns: [
      {
        id: "mock-checkin-4",
        date: "2026-08-27T12:00:00.000Z",
        notes: "Resolved date parsing edge cases and added quick add inline bar.",
      },
    ],
  },
  {
    id: "mock-goal-5",
    title: "Draft weekly review & sprint roadmap",
    targetDate: "2026-09-01",
    status: "not-started",
    type: "short-term",
    checkIns: [],
  },
  {
    id: "mock-goal-6",
    title: "Deploy database migration to Supabase",
    status: "done",
    type: "short-term",
    checkIns: [],
  },
];
