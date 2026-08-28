"use client";

import { useEffect, useState } from "react";
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
import { Activity, ActivityCategory, ACTIVITY_CATEGORIES } from "./mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface EditActivityDialogProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedActivity: Activity) => void;
}

export function EditActivityDialog({ activity, open, onOpenChange, onSave }: EditActivityDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("Other");
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);

  useEffect(() => {
    if (activity) {
      setName(activity.name);
      setDescription(activity.description || "");
      setTargetTime(activity.targetTimeMinutes.toString());
      setCategory(activity.category);
      setCurrentStreak(activity.currentStreak);
      setLongestStreak(activity.longestStreak);
    }
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !name.trim() || !targetTime) return;

    const parsedTarget = parseInt(targetTime, 10);
    if (isNaN(parsedTarget) || parsedTarget <= 0) return;

    const updatedCurrent = Math.max(0, currentStreak);
    const updatedLongest = Math.max(updatedCurrent, longestStreak);

    onSave({
      ...activity,
      name: name.trim(),
      description: description.trim(),
      targetTimeMinutes: parsedTarget,
      category,
      currentStreak: updatedCurrent,
      longestStreak: updatedLongest,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Habit Tracker</DialogTitle>
            <DialogDescription>
              Update your habit goal parameters, category, or adjust streak records.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Habit Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., French Practice"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Duolingo or Anki flashcards"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-targetTime">Weekly Target (Minutes)</Label>
                <Input
                  id="edit-targetTime"
                  type="number"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  placeholder="e.g., 90"
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={category} onValueChange={(v) => v && setCategory(v as ActivityCategory)}>
                  <SelectTrigger id="edit-category" className="w-full">
                    <SelectValue placeholder="Select a category" />
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

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <Label htmlFor="edit-currentStreak" className="text-xs text-muted-foreground">
                  Current Streak (Weeks)
                </Label>
                <Input
                  id="edit-currentStreak"
                  type="number"
                  value={currentStreak}
                  onChange={(e) => setCurrentStreak(parseInt(e.target.value, 10) || 0)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-longestStreak" className="text-xs text-muted-foreground">
                  Longest Streak (Weeks)
                </Label>
                <Input
                  id="edit-longestStreak"
                  type="number"
                  value={longestStreak}
                  onChange={(e) => setLongestStreak(parseInt(e.target.value, 10) || 0)}
                  min="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !targetTime}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
