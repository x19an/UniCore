"use client";

import { useEffect, useState, useMemo } from "react";
import { Course, Session, SessionStatus } from "./types";
import { useGlobalStore } from "@/lib/global-store";
import { CourseCard } from "./course-card";
import { AddCourseDialog } from "./add-course-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getLocalDateString,
  parseCourseDaysMap,
  DAY_NAMES_SHORT,
  calculateCourseAttendance,
} from "./attendance-utils";
import {
  Trash2,
  CalendarCheck,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Filter,
} from "lucide-react";

export function AttendanceDashboard() {
  const {
    courses,
    sessions,
    updateSession,
    batchAddSessions,
    deleteSession,
    deleteAllSessions,
    isLoaded,
  } = useGlobalStore();

  const [historyCourseFilter, setHistoryCourseFilter] = useState<string>("all");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("all");
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const activeSessions = useMemo(() => sessions.filter(s => !s.isDeleted), [sessions]);
  const attendanceCourses = useMemo(
    () => courses.filter(c => !c.isDeleted && c.days && c.days.length > 0 && c.creditHours),
    [courses]
  );

  // Auto-sync sessions from start of week up to today
  useEffect(() => {
    if (!isLoaded || attendanceCourses.length === 0) return;

    const today = new Date();
    const todayStr = getLocalDateString(today);
    const lastSync = localStorage.getItem("attendance_last_sync");
    if (lastSync === todayStr) return;

    const dayOfWeek = today.getDay();
    const currentDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 for Mon, 6 for Sun

    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - currentDay, 12, 0, 0);

    const newSessions: Omit<Session, "id">[] = [];

    attendanceCourses.forEach(course => {
      const dayMap = parseCourseDaysMap(course.days);

      for (let i = 0; i <= currentDay; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dayStr = DAY_NAMES_SHORT[d.getDay()];

        if (dayMap[dayStr]) {
          const periods = dayMap[dayStr];
          const dateStr = getLocalDateString(d);

          for (let p = 1; p <= periods; p++) {
            // Check against ALL sessions (including deleted ones) to prevent resurrecting deleted logs
            const exists = sessions.some(
              s => s.courseId === course.id && s.date === dateStr && (s.periodNumber || 1) === p
            );
            const alreadyAdded = newSessions.some(
              s => s.courseId === course.id && s.date === dateStr && (s.periodNumber || 1) === p
            );

            if (!exists && !alreadyAdded) {
              newSessions.push({
                courseId: course.id,
                date: dateStr,
                status: "attended",
                periodNumber: p,
              });
            }
          }
        }
      }
    });

    if (newSessions.length > 0) {
      batchAddSessions(newSessions);
    }

    localStorage.setItem("attendance_last_sync", todayStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const handleLogSession = (courseId: string, date: string, status: SessionStatus, periodNumber: number) => {
    const existing = activeSessions.find(
      s => s.courseId === courseId && s.date === date && (s.periodNumber || 1) === periodNumber
    );
    if (existing) {
      updateSession({ ...existing, status });
    } else {
      batchAddSessions([{ courseId, date, status, periodNumber }]);
    }
  };

  const handleCycleSessionStatus = (session: Session) => {
    const nextStatus: Record<SessionStatus, SessionStatus> = {
      attended: "missed",
      missed: "cancelled",
      cancelled: "attended",
    };
    updateSession({ ...session, status: nextStatus[session.status] });
  };

  const getCourse = (id: string) => courses.find(c => c.id === id);

  // Overall Statistics Calculations
  const metrics = useMemo(() => {
    let totalClasses = 0;
    let totalAttended = 0;
    let totalMissed = 0;
    let totalCancelled = 0;
    let atRiskCount = 0;

    attendanceCourses.forEach(c => {
      const stats = calculateCourseAttendance(c, activeSessions);
      totalClasses += stats.total;
      totalAttended += stats.attended;
      totalMissed += stats.missed;
      totalCancelled += stats.cancelled;
      if (stats.isAtRisk) {
        atRiskCount += 1;
      }
    });

    const overallPercentage = totalClasses === 0 ? 100 : (totalAttended / totalClasses) * 100;

    // Today's scheduled periods
    const today = new Date();
    const todayDayName = DAY_NAMES_SHORT[today.getDay()];
    const todayDateStr = getLocalDateString(today);
    let todayScheduledPeriods = 0;
    let todayAttendedPeriods = 0;

    attendanceCourses.forEach(c => {
      const dayMap = parseCourseDaysMap(c.days);
      const periods = dayMap[todayDayName] || 0;
      todayScheduledPeriods += periods;

      const courseTodaySessions = activeSessions.filter(
        s => s.courseId === c.id && s.date === todayDateStr
      );
      todayAttendedPeriods += courseTodaySessions.filter(s => s.status === "attended").length;
    });

    return {
      overallPercentage,
      totalClasses,
      totalAttended,
      totalMissed,
      totalCancelled,
      atRiskCount,
      todayScheduledPeriods,
      todayAttendedPeriods,
    };
  }, [attendanceCourses, activeSessions]);

  // Filtered session history
  const filteredHistory = useMemo(() => {
    return [...activeSessions]
      .filter(s => {
        if (historyCourseFilter !== "all" && s.courseId !== historyCourseFilter) return false;
        if (historyStatusFilter !== "all" && s.status !== historyStatusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (diff !== 0) return diff;
        return (b.periodNumber || 1) - (a.periodNumber || 1);
      });
  }, [activeSessions, historyCourseFilter, historyStatusFilter]);

  const handleClearAllHistory = async () => {
    await deleteAllSessions();
    const todayStr = getLocalDateString();
    localStorage.setItem("attendance_last_sync", todayStr);
    setClearConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Track class sessions, double periods, and calculate safe miss thresholds.
          </p>
        </div>
        <AddCourseDialog />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/60">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Overall Attendance
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.totalClasses === 0 ? "100%" : `${metrics.overallPercentage.toFixed(1)}%`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Across {attendanceCourses.length} active course{attendanceCourses.length !== 1 ? "s" : ""}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/60">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Classes Attended
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.totalAttended} <span className="text-sm font-normal text-muted-foreground">/ {metrics.totalClasses}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            {metrics.totalMissed} missed • {metrics.totalCancelled} cancelled
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/60">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <AlertTriangle className={`h-3.5 w-3.5 ${metrics.atRiskCount > 0 ? "text-destructive" : "text-emerald-500"}`} />
              Courses At Risk
            </CardDescription>
            <CardTitle className={`text-2xl font-bold ${metrics.atRiskCount > 0 ? "text-destructive" : "text-foreground"}`}>
              {metrics.atRiskCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            {metrics.atRiskCount === 0 ? "All courses in good standing" : "Near or below required %"}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/60">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <CalendarCheck className="h-3.5 w-3.5 text-primary" /> Today&apos;s Schedule
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.todayScheduledPeriods} <span className="text-sm font-normal text-muted-foreground">periods</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            {metrics.todayScheduledPeriods > 0
              ? `${metrics.todayAttendedPeriods} logged attended`
              : "No classes scheduled today"}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BookOpen className="h-4 w-4" /> Courses Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <CalendarCheck className="h-4 w-4" /> Session History ({activeSessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 px-1 -mx-1">
            {attendanceCourses.length === 0 ? (
              <div className="w-full col-span-full text-center py-16 text-muted-foreground border rounded-lg border-dashed bg-card/20 space-y-3 shrink-0">
                <BookOpen className="h-10 w-10 mx-auto opacity-30" />
                <div>
                  <h3 className="font-semibold text-foreground">No courses tracked yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your courses with class days and required attendance percentage to start tracking.
                  </p>
                </div>
                <div className="pt-2">
                  <AddCourseDialog />
                </div>
              </div>
            ) : (
              attendanceCourses.map(course => (
                <div key={course.id} className="snap-center shrink-0 w-[85vw] max-w-[320px] md:w-auto md:max-w-none">
                  <CourseCard
                    course={course}
                    sessions={activeSessions}
                    onLogSession={handleLogSession}
                    onDeleteSession={deleteSession}
                  />
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="border-border/60">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Session History</CardTitle>
                <CardDescription>
                  Complete log of all class sessions. Click any status badge to quickly toggle it.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Course Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <Select
                    value={historyCourseFilter}
                    onValueChange={(val: string | null) => setHistoryCourseFilter(val || "all")}
                  >
                    <SelectTrigger className="h-8 text-xs w-[140px]">
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {attendanceCourses.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code ? `${c.code} ` : ""}{c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <Select
                  value={historyStatusFilter}
                  onValueChange={(val: string | null) => setHistoryStatusFilter(val || "all")}
                >
                  <SelectTrigger className="h-8 text-xs w-[120px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear All History Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setClearConfirmOpen(true)}
                  disabled={activeSessions.length === 0}
                >
                  Clear History
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed bg-muted/10">
                  <p className="text-sm">
                    {activeSessions.length === 0
                      ? "No sessions logged yet."
                      : "No sessions matching the selected filter."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date &amp; Period</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status (Click to toggle)</TableHead>
                        <TableHead className="w-[60px] text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map(session => {
                        const course = getCourse(session.courseId);
                        const periodNum = session.periodNumber || 1;

                        return (
                          <TableRow key={session.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium text-xs">
                              <div className="flex items-center gap-1.5">
                                <span>{session.date}</span>
                                {periodNum > 1 && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                                    Period {periodNum}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-xs">
                              <div className="flex items-center gap-1.5">
                                {course?.code && (
                                  <span className="font-mono font-semibold text-muted-foreground">
                                    {course.code}
                                  </span>
                                )}
                                <span>{course?.name || "Unknown Course"}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <button
                                type="button"
                                onClick={() => handleCycleSessionStatus(session)}
                                className="cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring rounded"
                                title="Click to cycle status: Attended → Missed → Cancelled"
                              >
                                <Badge
                                  variant={
                                    session.status === "attended"
                                      ? "default"
                                      : session.status === "missed"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className={`capitalize text-xs transition-transform active:scale-95 ${
                                    session.status === "attended"
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                      : ""
                                  }`}
                                >
                                  {session.status}
                                </Badge>
                              </button>
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteSession(session.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Delete session"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Clear All Attendance History?</DialogTitle>
            <DialogDescription>
              This will remove all session records from history. Auto-sync will not recreate past sessions for today.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setClearConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleClearAllHistory}
            >
              Clear All History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
