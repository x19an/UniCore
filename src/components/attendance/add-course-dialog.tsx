"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlobalStore } from "@/lib/global-store";
import { Plus } from "lucide-react";
import { DAY_NAMES_SHORT } from "./attendance-utils";

export function AddCourseDialog() {
  const { courses, addCourse, updateCourse } = useGlobalStore();
  const [open, setOpen] = useState(false);

  // New Course State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // Shared State
  const [days, setDays] = useState("");
  const [creditHours, setCreditHours] = useState("3");
  const [reqPercent, setReqPercent] = useState("75");

  // Existing Course State
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Filter courses missing attendance details (e.g. created in Notes without schedule)
  const coursesMissingDetails = courses.filter(
    c => !c.isDeleted && (!c.days || c.days.length === 0 || !c.creditHours)
  );

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addCourse({
      name: name.trim(),
      code: code.trim() || undefined,
      days: days
        .split(",")
        .map(d => d.trim())
        .filter(Boolean),
      creditHours: Math.max(1, Number(creditHours) || 3),
      requiredAttendance: Math.min(100, Math.max(0, Number(reqPercent) || 75)),
    });
    resetAndClose();
  };

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) return;

    await updateCourse({
      ...course,
      days: days
        .split(",")
        .map(d => d.trim())
        .filter(Boolean),
      creditHours: Math.max(1, Number(creditHours) || 3),
      requiredAttendance: Math.min(100, Math.max(0, Number(reqPercent) || 75)),
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setOpen(false);
    setName("");
    setCode("");
    setDays("");
    setCreditHours("3");
    setReqPercent("75");
    setSelectedCourseId("");
  };

  const handleToggleDayChip = (day: string) => {
    const currentDays = days
      .split(",")
      .map(d => d.trim())
      .filter(Boolean);

    const index = currentDays.findIndex(d => d.startsWith(day));
    if (index >= 0) {
      currentDays.splice(index, 1);
    } else {
      currentDays.push(day);
    }
    setDays(currentDays.join(", "));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Course
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Course</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={coursesMissingDetails.length > 0 ? "link" : "new"} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="link" disabled={coursesMissingDetails.length === 0}>
              Link Existing {coursesMissingDetails.length > 0 && `(${coursesMissingDetails.length})`}
            </TabsTrigger>
            <TabsTrigger value="new">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="link">
            <form onSubmit={handleLinkExisting} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Select Existing Course</Label>
                <Select
                  value={selectedCourseId}
                  onValueChange={(val: string | null) => setSelectedCourseId(val || "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an existing course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesMissingDetails.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code ? `${c.code} - ` : ""}{c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="days-link">Days &amp; Periods</Label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {DAY_NAMES_SHORT.filter(d => d !== "Sun").map(day => {
                    const isSelected = days.toLowerCase().includes(day.toLowerCase());
                    return (
                      <Button
                        key={day}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => handleToggleDayChip(day)}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </div>
                <Input
                  id="days-link"
                  value={days}
                  onChange={e => setDays(e.target.value)}
                  placeholder="e.g. Mon 2, Wed, Fri"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Use numbers for multi-period days (e.g. &quot;Mon 2&quot; for double period).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="creditHours-link">Credit Hours</Label>
                  <Input
                    id="creditHours-link"
                    type="number"
                    min="1"
                    max="10"
                    value={creditHours}
                    onChange={e => setCreditHours(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reqPercent-link">Required Attendance (%)</Label>
                  <Input
                    id="reqPercent-link"
                    type="number"
                    min="0"
                    max="100"
                    value={reqPercent}
                    onChange={e => setReqPercent(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2">
                Link Course Details
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="new">
            <form onSubmit={handleCreateNew} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code">Course Code (optional)</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. CS 201"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="days">Days &amp; Periods</Label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {DAY_NAMES_SHORT.filter(d => d !== "Sun").map(day => {
                    const isSelected = days.toLowerCase().includes(day.toLowerCase());
                    return (
                      <Button
                        key={day}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => handleToggleDayChip(day)}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </div>
                <Input
                  id="days"
                  value={days}
                  onChange={e => setDays(e.target.value)}
                  placeholder="e.g. Mon 2, Wed, Fri"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Use numbers for multi-period days (e.g. &quot;Mon 2&quot; for double period).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="creditHours">Credit Hours</Label>
                  <Input
                    id="creditHours"
                    type="number"
                    min="1"
                    max="10"
                    value={creditHours}
                    onChange={e => setCreditHours(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reqPercent">Required Attendance (%)</Label>
                  <Input
                    id="reqPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={reqPercent}
                    onChange={e => setReqPercent(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2">
                Create New Course
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
