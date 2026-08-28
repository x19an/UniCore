"use client";

import { useState, useMemo } from "react";
import { Goal, GoalStatus, GoalType } from "./types";
import { GoalList } from "./goal-list";
import { QuickAddGoal } from "./quick-add-goal";
import { AddGoalDialog } from "./add-goal-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Target, Sparkles, CheckCircle2, Clock, CircleDot, X } from "lucide-react";
import { useGlobalStore } from "@/lib/global-store";

export function GoalsView() {
  const { goals, addGoal, updateGoal, deleteGoal, isLoaded } = useGlobalStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [addDialogType, setAddDialogType] = useState<GoalType>("long-term");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GoalStatus | "all">("all");

  // Filter out deleted items
  const activeGoals = useMemo(() => {
    return goals.filter((g) => !g.isDeleted);
  }, [goals]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = activeGoals.length;
    const completed = activeGoals.filter((g) => g.status === "done").length;
    const inProgress = activeGoals.filter((g) => g.status === "in-progress").length;
    const notStarted = activeGoals.filter((g) => g.status === "not-started" || !g.status).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, notStarted, completionRate };
  }, [activeGoals]);

  // Filtered goals by search and status
  const filteredGoals = useMemo(() => {
    return activeGoals.filter((g) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "not-started" ? g.status === "not-started" || !g.status : g.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [activeGoals, searchQuery, statusFilter]);

  const longTermGoals = useMemo(() => {
    return filteredGoals.filter((g) => g.type === "long-term");
  }, [filteredGoals]);

  const shortTermGoals = useMemo(() => {
    return filteredGoals.filter((g) => g.type === "short-term");
  }, [filteredGoals]);

  const handleUpdateGoal = (updatedGoal: Goal) => {
    updateGoal(updatedGoal);
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
  };

  const handleAddGoal = (goal: Omit<Goal, "id">) => {
    addGoal(goal);
    setIsFormOpen(false);
  };

  const openAddDialog = (type: GoalType) => {
    setAddDialogType(type);
    setIsFormOpen(true);
  };

  const isFiltering = searchQuery.trim() !== "" || statusFilter !== "all";

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-10" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Summary Statistics & Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="bg-card border-border/70 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Goals</p>
              <p className="text-2xl font-bold mt-0.5">{stats.total}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-bold mt-0.5 text-amber-500">{stats.inProgress}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold mt-0.5 text-emerald-500">{stats.completed}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70 shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</p>
              <span className="text-xs font-semibold">{stats.completionRate}%</span>
            </div>
            <div className="mt-2">
              <Progress value={stats.completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Search and Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search goals..."
            className="pl-9 h-9 bg-card/60 border-border/70 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="h-8 text-xs px-3 font-medium rounded-full"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "in-progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("in-progress")}
            className="h-8 text-xs px-3 font-medium rounded-full gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            In Progress
          </Button>
          <Button
            variant={statusFilter === "not-started" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("not-started")}
            className="h-8 text-xs px-3 font-medium rounded-full gap-1.5"
          >
            <CircleDot className="h-3.5 w-3.5 text-muted-foreground" />
            Not Started
          </Button>
          <Button
            variant={statusFilter === "done" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("done")}
            className="h-8 text-xs px-3 font-medium rounded-full gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Done
          </Button>
        </div>
      </div>

      {/* 3. Goals Columns: Two lists (Long-term multi-year goals & Short-term weekly/monthly goals) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Long-term Goals Column */}
        <div className="flex flex-col gap-3.5 p-4 sm:p-5 rounded-xl border bg-card/30 border-border/60">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
                  Long-term Goals
                  <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {longTermGoals.length}
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">Multi-year visions and major milestones</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAddDialog("long-term")}
              className="h-8 text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Goal
            </Button>
          </div>

          <GoalList
            goals={longTermGoals}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
            type="long-term"
            onAddNew={() => openAddDialog("long-term")}
            isFiltered={isFiltering}
          />
        </div>

        {/* Short-term Goals Column */}
        <div className="flex flex-col gap-3.5 p-4 sm:p-5 rounded-xl border bg-card/30 border-border/60">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
                  Short-term Goals
                  <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {shortTermGoals.length}
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">Weekly and monthly actionable targets</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAddDialog("short-term")}
              className="h-8 text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Goal
            </Button>
          </div>

          {/* Quick-add inline bar for short-term goals */}
          <div className="pt-1">
            <QuickAddGoal onAdd={handleAddGoal} type="short-term" />
          </div>

          <GoalList
            goals={shortTermGoals}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
            type="short-term"
            onAddNew={() => openAddDialog("short-term")}
            isFiltered={isFiltering}
          />
        </div>
      </div>

      {/* Add Goal Dialog Modal */}
      <AddGoalDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onAdd={handleAddGoal}
        defaultType={addDialogType}
      />
    </div>
  );
}
