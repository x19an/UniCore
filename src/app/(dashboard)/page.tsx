"use client";
import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { isToday, isBefore, startOfDay } from "date-fns";

import { useGlobalStore } from "@/lib/global-store";

export default function Home() {
  const { todos, activities, courses, sessions } = useGlobalStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  // 1. Today's Priorities
  const today = startOfDay(new Date());
  const activeTodos = todos.filter(todo => !todo.isCompleted && !todo.isDeleted);
  const todaysTodos = activeTodos.filter(todo => {
    if (!todo.dueDate) return false;
    const due = startOfDay(new Date(todo.dueDate));
    return isBefore(due, today) || isToday(due);
  }).sort((a, b) => {
    const aDue = startOfDay(new Date(a.dueDate!));
    const bDue = startOfDay(new Date(b.dueDate!));
    if (isBefore(aDue, bDue)) return -1;
    if (isBefore(bDue, aDue)) return 1;
    return 0;
  });

  // 2. Active Streaks (Trackers)
  const activeTrackers = activities.filter(a => !a.isDeleted).map(activity => {
    const progress = Math.min(100, Math.round((activity.completedTimeMinutes / activity.targetTimeMinutes) * 100));
    return { ...activity, progress };
  });

  // 3. Attendance Risk
  const activeAttendanceCourses = courses.filter(c => !c.isDeleted && c.days && c.days.length > 0 && c.creditHours);
  const atRiskCourses = activeAttendanceCourses.map(course => {
    const relevantSessions = sessions.filter(s => s.courseId === course.id && !s.isDeleted && s.status !== 'cancelled');
    const total = relevantSessions.length;
    let percentage = 100;
    if (total > 0) {
      const attended = relevantSessions.filter(s => s.status === 'attended').length;
      percentage = Math.round((attended / total) * 100);
    }
    const required = course.requiredAttendance ?? 75;
    const isAtRisk = total > 0 ? percentage <= required + 5 : false;
    return { ...course, percentage, isAtRisk, requiredAttendance: required };
  }).filter(c => c.isAtRisk);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Here&apos;s a summary of what&apos;s happening today.</p>
      </div>
      
      {!mounted ? (
        <div className="min-h-[200px]" />
      ) : (
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Priorities */}
        <Card className="col-span-1 border-border/50 bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Today&apos;s Priorities
            </CardTitle>
            <CardDescription>Tasks due today or overdue.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {todaysTodos.length === 0 ? (
               <p className="text-sm text-muted-foreground">All caught up for today!</p>
            ) : (
               todaysTodos.map(todo => {
                 const isOverdue = isBefore(startOfDay(new Date(todo.dueDate!)), today);
                 return (
                   <div key={todo.id} className="flex items-start gap-3 rounded-lg border p-3 bg-muted/20">
                      <Checkbox className="mt-1" checked={todo.isCompleted} disabled />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{todo.title}</p>
                        {todo.course && <p className="text-xs text-muted-foreground">{todo.course}</p>}
                      </div>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                      )}
                   </div>
                 );
               })
            )}
          </CardContent>
        </Card>

        {/* Active Trackers */}
        <Card className="col-span-1 border-border/50 bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Active Trackers
            </CardTitle>
            <CardDescription>Your weekly goals progress.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-5">
            {activeTrackers.map(tracker => (
               <div key={tracker.id} className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="font-medium">{tracker.name}</span>
                   <span className="text-muted-foreground">{tracker.completedTimeMinutes} / {tracker.targetTimeMinutes}m</span>
                 </div>
                 <Progress value={tracker.progress} className="h-2" />
               </div>
            ))}
          </CardContent>
        </Card>

        {/* Attendance Risk */}
        <Card className="col-span-1 border-border/50 bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Attendance Risk
            </CardTitle>
            <CardDescription>Courses near or below requirements.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {atRiskCourses.length === 0 ? (
               <p className="text-sm text-muted-foreground">All courses are in good standing.</p>
            ) : (
               atRiskCourses.map(course => (
                 <div key={course.id} className="flex flex-col gap-2 rounded-lg border p-3 bg-muted/20">
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-medium">{course.name}</span>
                     <Badge variant={course.percentage < course.requiredAttendance ? "destructive" : "secondary"}>
                       {course.percentage}%
                     </Badge>
                   </div>
                   <div className="flex justify-between text-xs text-muted-foreground">
                     <span>Required: {course.requiredAttendance}%</span>
                     {course.percentage < course.requiredAttendance && (
                       <span className="text-destructive font-medium">Below Requirement</span>
                     )}
                   </div>
                 </div>
               ))
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}
