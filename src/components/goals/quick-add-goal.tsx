"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { Goal } from "./types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatGoalDate } from "./goal-utils";

interface QuickAddGoalProps {
  onAdd: (goal: Omit<Goal, "id">) => void;
  type?: "short-term" | "long-term";
  placeholder?: string;
}

export function QuickAddGoal({
  onAdd,
  type = "short-term",
  placeholder = "Quick add a short-term goal... (Press Enter)",
}: QuickAddGoalProps) {
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      targetDate: targetDate || undefined,
      status: "not-started",
      type,
    });

    setTitle("");
    setTargetDate("");
    setIsDatePickerOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 pr-20 bg-background/50 focus-visible:ring-1 border-border/70"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 text-muted-foreground hover:text-foreground ${
                    targetDate ? "text-primary hover:text-primary font-medium" : ""
                  }`}
                  title={targetDate ? `Target: ${formatGoalDate(targetDate)}` : "Set target date"}
                >
                  <Calendar className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <PopoverContent className="w-auto p-3" align="end">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Target Date</p>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => {
                    setTargetDate(e.target.value);
                    if (e.target.value) setIsDatePickerOpen(false);
                  }}
                  className="h-8 text-xs"
                />
                {targetDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs w-full text-destructive hover:text-destructive"
                    onClick={() => {
                      setTargetDate("");
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Clear date
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={!title.trim()}
        className="h-10 px-3 shrink-0"
      >
        <Plus className="h-4 w-4 mr-1" /> Add
      </Button>
    </form>
  );
}
