"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Activity, ActivityCategory, ACTIVITY_CATEGORIES, MOCK_ACTIVITIES, formatTimeMinutes } from "./mock-data";
import { ActivityCard } from "./activity-card";
import { AddActivityDialog } from "./add-activity-dialog";
import { useGlobalStore } from "@/lib/global-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Trophy, Clock, CheckCircle2, Search, Sparkles, X, Target, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakDashboard() {
  const {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    batchUpdateActivities,
    isLoaded,
  } = useGlobalStore();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const weeklyResetCheckRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter out soft-deleted activities
  const activeActivities = useMemo(() => {
    return activities.filter((a) => !a.isDeleted);
  }, [activities]);

  // Robust Mon-Sun weekly reset logic
  useEffect(() => {
    if (!mounted || !isLoaded || activeActivities.length === 0 || weeklyResetCheckRef.current) {
      return;
    }

    weeklyResetCheckRef.current = true;

    const now = new Date();
    const currentDay = now.getDay();
    // Monday is 0, Sunday is 6
    const daysSinceMonday = (currentDay + 6) % 7;
    const currentMonday = new Date(now);
    currentMonday.setHours(0, 0, 0, 0);
    currentMonday.setDate(now.getDate() - daysSinceMonday);

    const previousMonday = new Date(currentMonday);
    previousMonday.setDate(currentMonday.getDate() - 7);

    const updatesToPerform: Activity[] = [];

    activeActivities.forEach((activity) => {
      // If activity has never had a reset date, assign current timestamp
      if (!activity.lastResetDate) {
        updatesToPerform.push({
          ...activity,
          lastResetDate: now.toISOString(),
        });
        return;
      }

      const lastReset = new Date(activity.lastResetDate);

      // If the last reset was before the current week's Monday 00:00
      if (lastReset < currentMonday) {
        // Did the user miss more than 1 whole week?
        const missedFullWeek = lastReset < previousMonday;
        const metTargetLastWeek = activity.completedTimeMinutes >= activity.targetTimeMinutes;

        // Reset streak to 0 if they failed the previous week or missed full weeks
        const newStreak = missedFullWeek || !metTargetLastWeek ? 0 : activity.currentStreak;

        updatesToPerform.push({
          ...activity,
          completedTimeMinutes: 0,
          currentStreak: newStreak,
          lastResetDate: now.toISOString(),
        });
      }
    });

    if (updatesToPerform.length > 0) {
      batchUpdateActivities(updatesToPerform);
    }
  }, [mounted, isLoaded, activeActivities, batchUpdateActivities]);

  const handleAddTime = (id: string, minutes: number) => {
    const activity = activeActivities.find((a) => a.id === id);
    if (!activity || minutes <= 0) return;

    const wasCompleted = activity.completedTimeMinutes >= activity.targetTimeMinutes;
    const newCompletedTime = activity.completedTimeMinutes + minutes;
    const isNowCompleted = newCompletedTime >= activity.targetTimeMinutes;

    let newStreak = activity.currentStreak;
    let newLongest = activity.longestStreak;

    // First time reaching goal this week increments current streak
    if (!wasCompleted && isNowCompleted) {
      newStreak += 1;
      if (newStreak > newLongest) {
        newLongest = newStreak;
      }
    }

    updateActivity({
      ...activity,
      completedTimeMinutes: newCompletedTime,
      currentStreak: newStreak,
      longestStreak: newLongest,
    });
  };

  const handleAddActivity = (
    newActivity: Omit<Activity, "id" | "completedTimeMinutes" | "currentStreak" | "longestStreak" | "lastResetDate">
  ) => {
    addActivity({
      ...newActivity,
      completedTimeMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastResetDate: new Date().toISOString(),
    });
  };

  const handleUpdateActivity = (updated: Activity) => {
    updateActivity(updated);
  };

  const handleDelete = (id: string) => {
    deleteActivity(id);
  };

  const handleLoadMockData = () => {
    MOCK_ACTIVITIES.forEach((item) => {
      addActivity({
        name: item.name,
        description: item.description,
        targetTimeMinutes: item.targetTimeMinutes,
        completedTimeMinutes: item.completedTimeMinutes,
        currentStreak: item.currentStreak,
        longestStreak: item.longestStreak,
        category: item.category,
        lastResetDate: new Date().toISOString(),
      });
    });
  };

  // Filtered activities based on search and category
  const filteredActivities = useMemo(() => {
    return activeActivities.filter((activity) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || activity.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeActivities, searchQuery, selectedCategory]);

  // Summary Metrics calculations
  const totalCompletedCount = activeActivities.filter(
    (a) => a.completedTimeMinutes >= a.targetTimeMinutes
  ).length;

  const totalMinutesLogged = activeActivities.reduce(
    (acc, a) => acc + a.completedTimeMinutes,
    0
  );

  const topStreakActivity = useMemo(() => {
    if (activeActivities.length === 0) return null;
    return [...activeActivities].sort((a, b) => b.currentStreak - a.currentStreak)[0];
  }, [activeActivities]);

  // Loading Skeleton
  if (!mounted || !isLoaded) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Habits */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Active Habits</span>
              <Target className="w-4 h-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold mt-1">{activeActivities.length}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Tracked across {new Set(activeActivities.map((a) => a.category)).size} categories
          </CardContent>
        </Card>

        {/* Metric 2: Weekly Targets Met */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Goals Met This Week</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold mt-1 text-emerald-400">
              {totalCompletedCount} <span className="text-sm font-normal text-muted-foreground">/ {activeActivities.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            {activeActivities.length > 0
              ? `${Math.round((totalCompletedCount / activeActivities.length) * 100)}% weekly success rate`
              : "No habits tracked yet"}
          </CardContent>
        </Card>

        {/* Metric 3: Total Time Tracked */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Total Time Logged</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold mt-1 text-blue-400">
              {formatTimeMinutes(totalMinutesLogged)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Dedicated to growth this week
          </CardContent>
        </Card>

        {/* Metric 4: Longest Active Streak */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Top Active Streak</span>
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold mt-1 text-orange-400 flex items-center gap-1.5">
              {topStreakActivity && topStreakActivity.currentStreak > 0 ? (
                <>
                  <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
                  {topStreakActivity.currentStreak} <span className="text-sm font-normal text-muted-foreground">wks</span>
                </>
              ) : (
                <span className="text-lg text-muted-foreground font-normal">0 wks</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground truncate">
            {topStreakActivity && topStreakActivity.currentStreak > 0
              ? topStreakActivity.name
              : "Complete goals to build streaks"}
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Search, Category Filters, and Add Habit Button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="pl-9 pr-8"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mr-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Resets Mon 00:00</span>
            </div>
            <AddActivityDialog onAdd={handleAddActivity} />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={cn(
              "px-3 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer",
              selectedCategory === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            All ({activeActivities.length})
          </button>
          {ACTIVITY_CATEGORIES.map((cat) => {
            const count = activeActivities.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1.5",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{cat}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Habit Cards */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onAddTime={handleAddTime}
              onUpdate={handleUpdateActivity}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : activeActivities.length === 0 ? (
        /* Empty State: No Habits Created Yet */
        <Card className="border-dashed border-border/80 bg-card/30 p-8 text-center">
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Flame className="w-10 h-10" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <CardTitle className="text-xl">No Habit Trackers Yet</CardTitle>
              <CardDescription>
                Define small, daily or weekly habits (like French Practice, Morning Run, or Deep Work)
                and watch your flame streak grow each week.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <AddActivityDialog onAdd={handleAddActivity} />
              <Button variant="outline" onClick={handleLoadMockData} className="gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Load Sample Habits
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Empty State: Filter / Search has 0 results */
        <Card className="border-dashed border-border/80 bg-card/30 p-8 text-center">
          <CardContent className="flex flex-col items-center justify-center py-6 space-y-3">
            <Search className="w-8 h-8 text-muted-foreground opacity-50" />
            <div className="space-y-1">
              <CardTitle className="text-lg">No matching habits found</CardTitle>
              <CardDescription>
                No habits match your current search &ldquo;{searchQuery}&rdquo; or filter.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
