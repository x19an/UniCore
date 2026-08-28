"use client";

import { useState } from "react";
import { Goal, GoalStatus } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CalendarIcon, MessageSquarePlus, Edit3, AlertCircle } from "lucide-react";
import { CheckInHistoryDialog } from "./check-in-history-dialog";
import { EditGoalDialog } from "./edit-goal-dialog";
import { formatGoalDate, isGoalOverdue, STATUS_CONFIG } from "./goal-utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ShortTermGoalItemProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export function ShortTermGoalItem({ goal, onUpdate, onDelete }: ShortTermGoalItemProps) {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isDone = goal.status === "done";
  const isOverdue = isGoalOverdue(goal);
  const formattedDate = formatGoalDate(goal.targetDate);
  const checkInsCount = goal.checkIns?.length || 0;
  const currentStatusConfig = STATUS_CONFIG[goal.status || "not-started"];

  const toggleDone = () => {
    onUpdate({
      ...goal,
      status: isDone ? "not-started" : "done",
    });
  };

  const handleStatusChange = (status: GoalStatus) => {
    onUpdate({
      ...goal,
      status,
    });
  };

  return (
    <>
      <div
        className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
          isDone
            ? "bg-muted/40 text-muted-foreground border-border/50"
            : "bg-card hover:bg-card/90 border-border/70 hover:border-border hover:shadow-xs"
        }`}
      >
        <Checkbox
          checked={isDone}
          onCheckedChange={toggleDone}
          className="mt-0.5 shrink-0 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          aria-label={isDone ? "Mark as not started" : "Mark as done"}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium leading-snug break-words ${
                isDone ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {goal.title}
            </span>

            {isOverdue && (
              <Badge variant="destructive" className="text-[10px] h-4.5 px-1 gap-0.5 shrink-0">
                <AlertCircle className="h-2.5 w-2.5" /> Overdue
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
            {/* Status Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline focus:outline-none"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${currentStatusConfig.dotClass}`} />
                    <span>{currentStatusConfig.label}</span>
                  </button>
                }
              />
              <DropdownMenuContent align="start" className="text-xs">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => handleStatusChange(key as GoalStatus)}
                    className="flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                    <span>{config.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {formattedDate && (
              <>
                <span className="text-border">•</span>
                <span className={`flex items-center gap-1 text-[11px] ${isOverdue ? "text-destructive font-medium" : ""}`}>
                  <CalendarIcon className="h-3 w-3" />
                  {formattedDate}
                </span>
              </>
            )}

            {checkInsCount > 0 && (
              <>
                <span className="text-border">•</span>
                <button
                  type="button"
                  onClick={() => setIsCheckInOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  <MessageSquarePlus className="h-3 w-3" />
                  {checkInsCount} {checkInsCount === 1 ? "log" : "logs"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
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
      </div>

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
