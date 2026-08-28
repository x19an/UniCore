"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Course, SessionStatus, Session } from "./types";
import { getLocalDateString } from "./attendance-utils";
import { Check, X, CalendarOff, Trash2 } from "lucide-react";

interface LogSessionDialogProps {
  course: Course;
  sessions?: Session[];
  onLog: (courseId: string, date: string, status: SessionStatus, periodNumber: number) => void;
  onDeleteSession?: (sessionId: string) => void;
  defaultDate?: string;
  defaultPeriod?: number;
  triggerButton?: React.ReactNode;
}

export function LogSessionDialog({
  course,
  sessions = [],
  onLog,
  onDeleteSession,
  defaultDate,
  defaultPeriod = 1,
  triggerButton,
}: LogSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => defaultDate || getLocalDateString());
  const [periodNumber, setPeriodNumber] = useState(defaultPeriod);

  // Sync defaults whenever dialog opens
  useEffect(() => {
    if (open) {
      setDate(defaultDate || getLocalDateString());
      setPeriodNumber(defaultPeriod);
    }
  }, [open, defaultDate, defaultPeriod]);

  // Find if a session already exists for this course, date, and period
  const existingSession = useMemo(() => {
    return sessions.find(
      s => s.courseId === course.id && !s.isDeleted && s.date === date && (s.periodNumber || 1) === periodNumber
    );
  }, [sessions, course.id, date, periodNumber]);

  const handleQuickLog = (status: SessionStatus) => {
    onLog(course.id, date, status, Math.max(1, periodNumber));
    setOpen(false);
  };

  const handleDelete = () => {
    if (existingSession && onDeleteSession) {
      onDeleteSession(existingSession.id);
      setOpen(false);
    }
  };

  const handleSetQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(getLocalDateString(d));
  };

  const todayStr = getLocalDateString();
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  })();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          triggerButton ? (
            (triggerButton as React.ReactElement)
          ) : (
            <Button variant="outline" size="sm" className="w-full">
              Log Session
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Log Session</span>
            <Badge variant="outline" className="text-xs font-normal">
              {course.name}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Quick Date Selector */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={date === todayStr ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => handleSetQuickDate(0)}
            >
              Today
            </Button>
            <Button
              type="button"
              variant={date === yesterdayStr ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => handleSetQuickDate(1)}
            >
              Yesterday
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="log-date" className="text-xs font-medium">
                Date
              </Label>
              <Input
                id="log-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-period" className="text-xs font-medium">
                Period Number
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  id="log-period"
                  type="number"
                  min="1"
                  max="10"
                  value={periodNumber}
                  onChange={e => setPeriodNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Existing Status Indicator */}
          {existingSession && (
            <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border text-xs">
              <span className="text-muted-foreground">Current record:</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    existingSession.status === "attended"
                      ? "default"
                      : existingSession.status === "missed"
                      ? "destructive"
                      : "secondary"
                  }
                  className={existingSession.status === "attended" ? "bg-green-500 hover:bg-green-600 capitalize" : "capitalize"}
                >
                  {existingSession.status}
                </Badge>
                {onDeleteSession && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={handleDelete}
                    title="Remove this session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <Label className="text-xs font-medium text-muted-foreground">
              {existingSession ? "Update Status" : "Record Status"}
            </Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                onClick={() => handleQuickLog("attended")}
                className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-normal"
              >
                <Check className="h-4 w-4" />
                <span>Attended (Present)</span>
              </Button>
              <Button
                type="button"
                onClick={() => handleQuickLog("missed")}
                variant="destructive"
                className="w-full justify-start gap-2 font-normal"
              >
                <X className="h-4 w-4" />
                <span>Missed (Absent)</span>
              </Button>
              <Button
                type="button"
                onClick={() => handleQuickLog("cancelled")}
                variant="secondary"
                className="w-full justify-start gap-2 font-normal"
              >
                <CalendarOff className="h-4 w-4" />
                <span>Cancelled / Class Did Not Take Place</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
