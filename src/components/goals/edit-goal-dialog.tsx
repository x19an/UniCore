"use client";

import { useState } from "react";
import { Goal, GoalStatus, GoalType } from "./types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_CONFIG } from "./goal-utils";

interface EditGoalDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedGoal: Goal) => void;
}

interface EditGoalFormProps {
  goal: Goal;
  onClose: () => void;
  onSave: (updatedGoal: Goal) => void;
}

function EditGoalForm({ goal, onClose, onSave }: EditGoalFormProps) {
  const [title, setTitle] = useState(goal.title || "");
  const [description, setDescription] = useState(goal.description || "");
  const [targetDate, setTargetDate] = useState(() => {
    if (!goal.targetDate) return "";
    const dateMatch = goal.targetDate.match(/^(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : goal.targetDate;
  });
  const [status, setStatus] = useState<GoalStatus>(goal.status || "not-started");
  const [type, setType] = useState<GoalType>(goal.type || "long-term");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...goal,
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate ? targetDate : undefined,
      status,
      type,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Edit Goal</DialogTitle>
        <DialogDescription>
          Update the details and target timeline for this goal.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-type">Goal Horizon</Label>
            <Select value={type} onValueChange={(val) => val && setType(val as GoalType)}>
              <SelectTrigger id="edit-type" className="w-full">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long-term">Long-term (Years)</SelectItem>
                <SelectItem value="short-term">Short-term (Weeks)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={(val) => val && setStatus(val as GoalStatus)}>
              <SelectTrigger id="edit-status" className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-target-date">
            Target Date <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            id="edit-target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-description">
            Description <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does milestone achievement look like?"
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditGoalDialog({ goal, open, onOpenChange, onSave }: EditGoalDialogProps) {
  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        {open && (
          <EditGoalForm
            key={goal.id}
            goal={goal}
            onClose={() => onOpenChange(false)}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
