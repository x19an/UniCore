import { Metadata } from "next";
import { StreakDashboard } from "@/components/streaks/streak-dashboard";

export const metadata: Metadata = {
  title: "Streaks & Habits | Future Helper",
  description: "Track your habits, log active time, and maintain weekly streaks.",
};

export default function StreaksPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Habit Streaks</h1>
        <p className="text-muted-foreground mt-2">
          Track your target time, log sessions, and build unbroken weekly streaks.
        </p>
      </div>

      <StreakDashboard />
    </div>
  );
}
