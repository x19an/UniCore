"use client";

import { useState } from "react";
import { Goal, GoalStatus } from "./types";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Trash2, MessageSquarePlus, Edit3, AlertCircle, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckInHistoryDialog } from "./check-in-history-dialog";
import { EditGoalDialog } from "./edit-goal-dialog";
import { formatGoalDate, isGoalOverdue, STATUS_CONFIG } from "./goal-utils";

interface GoalCardProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOverdue = isGoalOverdue(goal);
  const formattedDate = formatGoalDate(goal.targetDate);
  const checkInsCount = goal.checkIns?.length || 0;
  const isDone = goal.status === "done";
  const currentStatusConfig = STATUS_CONFIG[goal.status || "not-started"];

  return (
    <>
      <Card className={`flex flex-col group transition-all duration-200 border-border/70 hover:border-border hover:shadow-md bg-card ${isDone ? "opacity-75 bg-card/50" : ""}`}>
        <CardHeader className="pb-3 space-y-2.5">
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className={`text-base font-semibold leading-snug break-words ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {goal.title}
                </CardTitle>
                {isOverdue && (
                  <Badge variant="destructive" className="text-[10px] h-5 px-1.5 gap-1 font-medium animate-in fade-in">
                    <AlertCircle className="h-3 w-3" /> Overdue
                  </Badge>
                )}
              </div>
            </div>

            <Select
              value={goal.status || "not-started"}
              onValueChange={(val) => val && onUpdate({ ...goal, status: val as GoalStatus })}
            >
              <SelectTrigger className="w-[125px] h-7 text-xs font-medium shrink-0">
                <SelectValue>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${currentStatusConfig.dotClass}`} />
                    <span>{currentStatusConfig.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {goal.description && (
            <CardDescription className="text-xs text-muted-foreground/90 whitespace-pre-wrap line-clamp-3 leading-relaxed">
              {goal.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardFooter className="pt-2 flex justify-between items-center text-xs text-muted-foreground border-t border-border/40 mt-auto px-4 py-2.5 bg-muted/20">
          <div className="flex items-center gap-3">
            {formattedDate ? (
              <span className={`flex items-center gap-1 font-medium ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                <CalendarIcon className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
            ) : (
              <span className="italic text-muted-foreground/60 text-[11px]">No target date</span>
            )}

            {checkInsCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1.5 font-normal cursor-pointer hover:bg-secondary/80 gap-1"
                onClick={() => setIsCheckInOpen(true)}
              >
                <CheckCircle2 className="h-3 w-3 text-primary" />
                {checkInsCount} {checkInsCount === 1 ? "log" : "logs"}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditOpen(true)}
              title="Edit goal"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => setIsCheckInOpen(true)}
              title="Progress & Check-ins"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span className="sr-only">Check-in</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(goal.id)}
              title="Delete goal"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <CheckInHistoryDialog
        goal={goal}
        open={isCheckInOpen}
        onOpenChange={setIsCheckInOpen}
        onUpdateGoal={onUpdate}
      />

      <EditGoalDialog
        goal={goal}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={onUpdate}
      />
    </>
  );
}
