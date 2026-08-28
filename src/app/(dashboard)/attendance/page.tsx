import { Metadata } from "next";
import { AttendanceDashboard } from "@/components/attendance/attendance-dashboard";

export const metadata: Metadata = {
  title: "Attendance | Future Helper",
  description: "Track your class attendance.",
};

export default function AttendancePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AttendanceDashboard />
    </div>
  );
}
