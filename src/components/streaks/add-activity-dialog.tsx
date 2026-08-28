"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Sparkles } from "lucide-react";
import { Activity, ActivityCategory, ACTIVITY_CATEGORIES, HABIT_TEMPLATES, HabitTemplate } from "./mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface AddActivityDialogProps {
  onAdd: (activity: Omit<Activity, "id" | "completedTimeMinutes" | "currentStreak" | "longestStreak" | "lastResetDate">) => void;
}

export function AddActivityDialog({ onAdd }: AddActivityDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("Learning");
  const [open, setOpen] = useState(false);

  const handleApplyTemplate = (template: HabitTemplate) => {
    setName(template.name);
    setDescription(template.description);
    setTargetTime(template.targetTimeMinutes.toString());
    setCategory(template.category);
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setTargetTime("");
    setCategory("Learning");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetTime) return;

    const parsedTarget = parseInt(targetTime, 10);
    if (isNaN(parsedTarget) || parsedTarget <= 0) return;

    onAdd({
      name: name.trim(),
      description: description.trim(),
      targetTimeMinutes: parsedTarget,
      category,
    });

    handleReset();
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => { handleReset(); setOpen(true); }} className="shrink-0 gap-2 shadow-sm">
        <Plus className="w-4 h-4" /> Add Habit Tracker
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Add New Habit Tracker
              </DialogTitle>
              <DialogDescription>
                Define a habit target (daily or weekly) and start building consistent momentum.
              </DialogDescription>
            </DialogHeader>

            {/* Quick Templates Section */}
            <div className="pt-2 pb-1 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {HABIT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <span>{tmpl.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                      {tmpl.frequencyLabel}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 py-3 border-t mt-3">
              <div className="space-y-2">
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                  id="habit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., French Practice"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="habit-description">Description (Optional)</Label>
                <Textarea
                  id="habit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Duolingo or Anki flashcards"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="habit-targetTime">Weekly Target (Minutes)</Label>
                  <Input
                    id="habit-targetTime"
                    type="number"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    placeholder="e.g., 90"
                    min="1"
                    required
                  />
                  <div className="flex gap-1.5 pt-1">
                    {[
                      { label: "70m (10m/d)", val: 70 },
                      { label: "90m (3x30)", val: 90 },
                      { label: "180m (3x60)", val: 180 },
                      { label: "300m", val: 300 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setTargetTime(preset.val.toString())}
                        className="text-[11px] text-muted-foreground hover:text-primary hover:underline"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="habit-category">Category</Label>
                  <Select value={category} onValueChange={(v) => v && setCategory(v as ActivityCategory)}>
                    <SelectTrigger id="habit-category" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || !targetTime}>
                Create Habit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
