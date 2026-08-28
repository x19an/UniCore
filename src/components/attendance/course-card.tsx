"use client";

import { useMemo } from "react";
import { Course, Session, SessionStatus } from "./types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LogSessionDialog } from "./log-session-dialog";
import { EditCourseDialog } from "./edit-course-dialog";
import {
  calculateCourseAttendance,
  parseCourseDaysMap,
  formatDayDisplay,
  getLocalDateString,
  DAY_NAMES_SHORT,
} from "./attendance-utils";
import { Check, X, CalendarOff, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface CourseCardProps {
  course: Course;
  sessions: Session[];
  onLogSession: (courseId: string, date: string, status: SessionStatus, periodNumber: number) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export function CourseCard({ course, sessions, onLogSession, onDeleteSession }: CourseCardProps) {
  const stats = useMemo(() => calculateCourseAttendance(course, sessions), [course, sessions]);
  const daysMap = useMemo(() => parseCourseDaysMap(course.days), [course.days]);

  const today = new Date();
  const todayDayName = DAY_NAMES_SHORT[today.getDay()];
  const todayPeriodsCount = daysMap[todayDayName] || 0;
  const isScheduledToday = todayPeriodsCount > 0;
  const todayDateStr = getLocalDateString(today);

  // Find all sessions logged for today for this course
  const todaySessions = useMemo(() => {
    return sessions.filter(
      s => s.courseId === course.id && !s.isDeleted && s.date === todayDateStr
    );
  }, [sessions, course.id, todayDateStr]);

  const required = course.requiredAttendance ?? 75;

  // Determine progress bar indicator color
  const getIndicatorColor = () => {
    if (stats.percentage >= required) return "bg-emerald-500";
    if (stats.percentage >= required - 5) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <Card className="flex flex-col h-full bg-card/60 backdrop-blur-sm border-border/60 hover:border-border transition-colors shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {course.code && (
                <Badge variant="secondary" className="font-mono text-xs px-1.5 py-0">
                  {course.code}
                </Badge>
              )}
              <CardTitle className="text-lg font-semibold tracking-tight truncate" title={course.name}>
                {course.name}
              </CardTitle>
            </div>

            <CardDescription className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="font-medium text-foreground/80">{course.creditHours ?? 3} Credits</span>
              <span>•</span>
              <span className="text-muted-foreground">
                {course.days && course.days.length > 0
                  ? course.days.map(formatDayDisplay).join(", ")
                  : "No schedule"}
              </span>
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant={stats.isAtRisk ? "destructive" : "outline"}
              className="text-xs font-medium"
            >
              Req: {required}%
            </Badge>
            <EditCourseDialog course={course} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-1">
        {/* Attendance Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              Attendance: <strong className="text-foreground">{stats.attended}</strong> / {stats.total} classes
              {stats.cancelled > 0 && <span className="text-muted-foreground/70"> ({stats.cancelled} cancelled)</span>}
            </span>
            <span className="font-bold text-sm">
              {stats.total === 0 ? "—" : `${stats.percentage.toFixed(1)}%`}
            </span>
          </div>

          <Progress
            value={stats.total === 0 ? 0 : stats.percentage}
            className="h-2 bg-muted/60"
            indicatorClassName={getIndicatorColor()}
          />
        </div>

        {/* Calculation insight status text */}
        <div className="flex items-start gap-2 text-xs">
          {stats.isAtRisk ? (
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-destructive shrink-0" />
          ) : stats.total > 0 ? (
            <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
          ) : (
            <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
          )}
          <span className={`font-medium leading-relaxed ${stats.statusColor}`}>
            {stats.statusText}
          </span>
        </div>

        {/* Today's Schedule & Quick Action */}
        {isScheduledToday && (
          <div className="pt-2 border-t border-border/40 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>Today&apos;s Class ({todayDayName} - {todayPeriodsCount} {todayPeriodsCount > 1 ? "Periods" : "Period"})</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {Array.from({ length: todayPeriodsCount }, (_, idx) => {
                const periodNum = idx + 1;
                const existing = todaySessions.find(s => (s.periodNumber || 1) === periodNum);

                return (
                  <div
                    key={periodNum}
                    className="flex items-center justify-between p-1.5 px-2 rounded-md bg-muted/30 border border-border/40 text-xs"
                  >
                    <span className="font-medium text-muted-foreground text-[11px]">
                      Period {periodNum}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={existing?.status === "attended" ? "default" : "outline"}
                        className={`h-6 text-[10px] px-2 gap-1 ${
                          existing?.status === "attended"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                            : "hover:bg-emerald-500/10 hover:text-emerald-500"
                        }`}
                        onClick={() => onLogSession(course.id, todayDateStr, "attended", periodNum)}
                      >
                        <Check className="h-3 w-3" /> Present
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={existing?.status === "missed" ? "destructive" : "outline"}
                        className={`h-6 text-[10px] px-2 gap-1 ${
                          existing?.status === "missed"
                            ? "bg-destructive text-destructive-foreground border-transparent"
                            : "hover:bg-destructive/10 hover:text-destructive"
                        }`}
                        onClick={() => onLogSession(course.id, todayDateStr, "missed", periodNum)}
                      >
                        <X className="h-3 w-3" /> Absent
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={existing?.status === "cancelled" ? "secondary" : "ghost"}
                        className={`h-6 text-[10px] px-1.5 ${
                          existing?.status === "cancelled"
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => onLogSession(course.id, todayDateStr, "cancelled", periodNum)}
                        title="Cancelled"
                      >
                        <CalendarOff className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <LogSessionDialog
          course={course}
          sessions={sessions}
          onLog={onLogSession}
          onDeleteSession={onDeleteSession}
        />
      </CardFooter>
    </Card>
  );
}
