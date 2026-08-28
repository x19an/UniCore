import { GoalsView } from "@/components/goals/goals-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goals | Future Helper",
  description: "Set, track, and achieve your long-term and short-term goals.",
};

export default function GoalsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Goals</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Define long-term strategic visions and track actionable short-term milestones.
        </p>
      </div>
      <GoalsView />
    </div>
  );
}
