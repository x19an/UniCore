"use client";

import { useState } from "react";
import { CheckIn, Goal } from "./types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, Trash2, Calendar, Sparkles } from "lucide-react";
import { formatFullDateTime, formatRelativeDate, generateUniqueId, parseSafeDate } from "./goal-utils";

interface CheckInHistoryDialogProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateGoal: (updatedGoal: Goal) => void;
}

export function CheckInHistoryDialog({
  goal,
  open,
  onOpenChange,
  onUpdateGoal,
}: CheckInHistoryDialogProps) {
  const [notes, setNotes] = useState("");

  const handleAddCheckIn = () => {
    if (!notes.trim()) return;

    const newCheckIn: CheckIn = {
      id: generateUniqueId(),
      date: new Date().toISOString(),
      notes: notes.trim(),
    };

    onUpdateGoal({
      ...goal,
      checkIns: [newCheckIn, ...(goal.checkIns || [])],
    });

    setNotes("");
  };

  const handleDeleteCheckIn = (checkInId: string) => {
    const updatedCheckIns = (goal.checkIns || []).filter((c) => c.id !== checkInId);
    onUpdateGoal({
      ...goal,
      checkIns: updatedCheckIns,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAddCheckIn();
    }
  };

  const checkIns = (goal.checkIns || []).slice().sort((a, b) => {
    const dateA = parseSafeDate(a.date)?.getTime() || 0;
    const dateB = parseSafeDate(b.date)?.getTime() || 0;
    return dateB - dateA;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Check-in & Progress Log
          </DialogTitle>
          <DialogDescription className="line-clamp-1 font-medium text-foreground/80">
            {goal.title}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2 overflow-hidden flex-1">
          {/* Check-in input */}
          <div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/20 border-border/60">
            <Textarea
              placeholder="Record a milestone, breakthrough, or progress update... (Ctrl+Enter to save)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none text-sm bg-background/60 focus-visible:ring-1"
              rows={3}
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-muted-foreground">
                Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono border">Ctrl+Enter</kbd>
              </span>
              <Button
                size="sm"
                onClick={handleAddCheckIn}
                disabled={!notes.trim()}
                className="h-8 gap-1.5"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Add Log
              </Button>
            </div>
          </div>

          {/* History logs */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Progress History ({checkIns.length})
              </h4>
            </div>

            {checkIns.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center bg-muted/10 text-muted-foreground">
                <Calendar className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">No check-ins logged yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep track of momentum by logging periodic milestones.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[220px] pr-3 -mr-3">
                <div className="flex flex-col gap-3 py-1">
                  {checkIns.map((checkIn) => {
                    const relativeTime = formatRelativeDate(checkIn.date);
                    const fullTime = formatFullDateTime(checkIn.date);

                    return (
                      <div
                        key={checkIn.id}
                        className="group flex flex-col gap-1 p-3 rounded-lg border bg-card/60 hover:bg-card hover:border-border transition-colors relative"
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className="text-xs font-medium text-muted-foreground"
                            title={fullTime}
                          >
                            {relativeTime}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteCheckIn(checkIn.id)}
                            title="Delete log"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                          {checkIn.notes}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
