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

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (goal: Omit<Goal, "id">) => void;
  defaultType: GoalType;
}

export function AddGoalDialog({ open, onOpenChange, onAdd, defaultType }: AddGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<GoalStatus>("not-started");
  const [goalType, setGoalType] = useState<GoalType>(defaultType);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setGoalType(defaultType);
      setTitle("");
      setDescription("");
      setTargetDate("");
      setStatus("not-started");
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
      status,
      type: goalType,
    });

    setTitle("");
    setDescription("");
    setTargetDate("");
    setStatus("not-started");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              Add {goalType === "long-term" ? "Long-term" : "Short-term"} Goal
            </DialogTitle>
            <DialogDescription>
              {goalType === "long-term"
                ? "Define a larger multi-month or multi-year vision you want to work toward."
                : "Create a focused weekly or monthly milestone to complete soon."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  goalType === "long-term"
                    ? "e.g., Launch SaaS Startup, Run a Marathon"
                    : "e.g., Complete Chapter 4, Draft pitch deck"
                }
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="goal-type">Goal Horizon</Label>
                <Select
                  value={goalType}
                  onValueChange={(val) => val && setGoalType(val as GoalType)}
                >
                  <SelectTrigger id="goal-type" className="w-full">
                    <SelectValue placeholder="Horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long-term">Long-term (Years)</SelectItem>
                    <SelectItem value="short-term">Short-term (Weeks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goal-status">Initial Status</Label>
                <Select
                  value={status}
                  onValueChange={(val) => val && setStatus(val as GoalStatus)}
                >
                  <SelectTrigger id="goal-status" className="w-full">
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
              <Label htmlFor="goal-targetDate">
                Target Date <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="goal-targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-description">
                Description <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does success look like? Any key steps or notes..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Save Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
