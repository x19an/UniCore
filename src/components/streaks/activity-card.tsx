"use client";

import { useState } from "react";
import { Activity, formatTimeMinutes, ActivityCategory } from "./mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Clock, CheckCircle2, Trash2, Edit3, RotateCcw, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditActivityDialog } from "./edit-activity-dialog";

interface ActivityCardProps {
  activity: Activity;
  onAddTime: (id: string, minutes: number) => void;
  onUpdate: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export function ActivityCard({ activity, onAddTime, onUpdate, onDelete }: ActivityCardProps) {
  const [addMinutes, setAddMinutes] = useState<string>("30");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  const isCompleted = activity.completedTimeMinutes >= activity.targetTimeMinutes;
  const progressValue = activity.targetTimeMinutes > 0
    ? Math.min((activity.completedTimeMinutes / activity.targetTimeMinutes) * 100, 100)
    : 0;
  const rawPercentage = activity.targetTimeMinutes > 0
    ? Math.round((activity.completedTimeMinutes / activity.targetTimeMinutes) * 100)
    : 0;

  const categoryStyles: Record<ActivityCategory, { badge: string; border: string }> = {
    Learning: {
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      border: "hover:border-blue-500/30",
    },
    Health: {
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      border: "hover:border-emerald-500/30",
    },
    Productivity: {
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      border: "hover:border-purple-500/30",
    },
    Mindfulness: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      border: "hover:border-amber-500/30",
    },
    Other: {
      badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      border: "hover:border-slate-500/30",
    },
  };

  const style = categoryStyles[activity.category as ActivityCategory] || categoryStyles.Other;

  const handleAdd = (customMins?: number) => {
    const mins = customMins !== undefined ? customMins : parseInt(addMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      onAddTime(activity.id, mins);
    }
  };

  const handleQuickCheckOff = () => {
    const remaining = Math.max(0, activity.targetTimeMinutes - activity.completedTimeMinutes);
    if (remaining > 0) {
      onAddTime(activity.id, remaining);
    } else {
      // If already met target, add a standard 30m session
      onAddTime(activity.id, 30);
    }
  };

  const handleResetThisWeek = () => {
    // Reset completedTimeMinutes for this week without changing streaks
    onUpdate({
      ...activity,
      completedTimeMinutes: 0,
    });
  };

  return (
    <>
      <Card
        className={cn(
          "relative flex flex-col justify-between transition-all duration-300 border-border/60 bg-card hover:shadow-lg",
          style.border,
          isCompleted && "border-emerald-500/40 bg-emerald-950/10 shadow-sm"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                  {activity.name}
                </CardTitle>
                {isCompleted && (
                  <Badge variant="outline" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs py-0 px-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Met Goal
                  </Badge>
                )}
              </div>
              {activity.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="outline" className={cn("text-xs font-normal border", style.badge)}>
                {activity.category}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditOpen(true)}
                title="Edit Habit"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(activity.id)}
                title="Delete Habit"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-3 flex-1">
          {/* Streaks & Target Info Badges */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-muted/30 border border-border/40 text-xs">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Target
              </span>
              <span className="font-semibold text-foreground mt-0.5">
                {formatTimeMinutes(activity.targetTimeMinutes)}/wk
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center border-x border-border/40">
              <span className="text-[10px] text-orange-400 flex items-center gap-1 font-medium">
                <Flame className={cn("w-3.5 h-3.5", activity.currentStreak > 0 ? "fill-orange-500 text-orange-500 animate-pulse" : "text-muted-foreground")} />
                Streak
              </span>
              <span className="font-bold text-orange-400 mt-0.5">
                {activity.currentStreak} {activity.currentStreak === 1 ? "wk" : "wks"}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-amber-400 flex items-center gap-1 font-medium">
                <Trophy className="w-3 h-3 text-amber-400" /> Best
              </span>
              <span className="font-semibold text-amber-400 mt-0.5">
                {activity.longestStreak} {activity.longestStreak === 1 ? "wk" : "wks"}
              </span>
            </div>
          </div>

          {/* Progress Bar & Stats */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Weekly Progress</span>
              <span className="text-foreground font-mono">
                {formatTimeMinutes(activity.completedTimeMinutes)} / {formatTimeMinutes(activity.targetTimeMinutes)}
                <span className={cn("ml-1.5 font-bold", isCompleted ? "text-emerald-400" : "text-muted-foreground")}>
                  ({rawPercentage}%)
                </span>
              </span>
            </div>
            <Progress
              value={progressValue}
              className={cn(
                "h-2.5 rounded-full transition-all bg-muted",
                isCompleted ? "[&>div]:bg-emerald-500" : "[&>div]:bg-primary"
              )}
            />
          </div>

          {/* Quick Preset Time Chips */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground">Quick Log:</span>
            <div className="flex gap-1">
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleAdd(mins)}
                  className="px-2 py-0.5 text-xs rounded bg-muted/60 hover:bg-primary/20 hover:text-primary border border-border/40 text-muted-foreground transition-colors cursor-pointer"
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-4 border-t border-border/40 flex flex-col gap-2">
          {/* Main Action Bar */}
          <div className="flex w-full gap-2">
            <div className="relative flex-1">
              <Button
                onClick={handleQuickCheckOff}
                className={cn(
                  "w-full gap-1.5 transition-all shadow-sm",
                  isCompleted
                    ? "bg-emerald-600/90 hover:bg-emerald-600 text-white"
                    : "bg-primary hover:bg-primary/90"
                )}
                size="sm"
              >
                {isCompleted ? (
                  <>
                    <Check className="w-4 h-4" /> Goal Met (+30m)
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Check Off / Complete
                  </>
                )}
              </Button>
            </div>

            {/* Custom Minutes Input & Add Button */}
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={addMinutes}
                onChange={(e) => setAddMinutes(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                className="w-16 h-8 text-xs text-center px-1"
                placeholder="Mins"
                min="1"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => handleAdd()}
                title="Add custom minutes"
              >
                +Add
              </Button>
            </div>
          </div>

          {/* Reset Week Option (if some time is logged) */}
          {activity.completedTimeMinutes > 0 && (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={handleResetThisWeek}
                className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Reset week progress
              </button>
            </div>
          )}
        </CardFooter>
      </Card>

      <EditActivityDialog
        activity={activity}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={onUpdate}
      />
    </>
  );
}
