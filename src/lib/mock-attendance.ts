import { Course, Session } from "./types";

export const MOCK_ATTENDANCE_COURSES: Course[] = [
  {
    id: "ac1",
    name: "Data Structures",
    days: ["Mon", "Wed", "Fri"],
    creditHours: 3,
    requiredAttendance: 75,
  },
  {
    id: "ac2",
    name: "Operating Systems",
    days: ["Tue", "Thu"],
    creditHours: 3,
    requiredAttendance: 80,
  }
];

export const MOCK_SESSIONS: Session[] = [
  { id: "s1", courseId: "ac1", date: "2026-08-10", status: "attended" },
  { id: "s2", courseId: "ac1", date: "2026-08-12", status: "missed" },
  { id: "s3", courseId: "ac1", date: "2026-08-14", status: "attended" },
  { id: "s4", courseId: "ac2", date: "2026-08-11", status: "attended" },
  { id: "s5", courseId: "ac2", date: "2026-08-13", status: "attended" },
  { id: "s6", courseId: "ac2", date: "2026-08-18", status: "missed" },
];
