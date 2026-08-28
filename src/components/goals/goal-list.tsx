"use client";

import { Goal, GoalType } from "./types";
import { GoalCard } from "./goal-card";
import { ShortTermGoalItem } from "./short-term-goal-item";
import { Button } from "@/components/ui/button";
import { Plus, Target, Sparkles } from "lucide-react";

interface GoalListProps {
  goals: Goal[];
  onUpdate: (goal: Goal) => void;
  onDelete: (id: string) => void;
  type: GoalType;
  onAddNew?: () => void;
  isFiltered?: boolean;
}

export function GoalList({ goals, onUpdate, onDelete, type, onAddNew, isFiltered }: GoalListProps) {
  const isLongTerm = type === "long-term";
  const typeLabel = isLongTerm ? "long-term goals" : "short-term goals";

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-card/40 text-center text-muted-foreground transition-all">
        <div className="p-3 rounded-full bg-muted/50 mb-3">
          {isLongTerm ? (
            <Target className="h-6 w-6 text-muted-foreground/70" />
          ) : (
            <Sparkles className="h-6 w-6 text-muted-foreground/70" />
          )}
        </div>
        <p className="text-sm font-medium text-foreground/80">
          {isFiltered ? `No matching ${typeLabel} found.` : `No ${typeLabel} yet.`}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          {isLongTerm
            ? "Establish high-impact milestones for your career, health, or personal vision."
            : "Set actionable weekly tasks or sprint milestones to maintain momentum."}
        </p>
        {onAddNew && !isFiltered && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddNew}
            className="mt-4 h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Create {isLongTerm ? "Long-term Goal" : "Short-term Goal"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {goals.map((goal) =>
        isLongTerm ? (
          <GoalCard key={goal.id} goal={goal} onUpdate={onUpdate} onDelete={onDelete} />
        ) : (
          <ShortTermGoalItem key={goal.id} goal={goal} onUpdate={onUpdate} onDelete={onDelete} />
        )
      )}
    </div>
  );
}
