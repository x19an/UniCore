"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGlobalStore } from "@/lib/global-store";
import { Course } from "./types";
import { Pencil, Trash2 } from "lucide-react";

export function EditCourseDialog({ course }: { course: Course }) {
  const { updateCourse, deleteCourse } = useGlobalStore();
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [name, setName] = useState(course.name);
  const [code, setCode] = useState(course.code || "");
  const [days, setDays] = useState(course.days?.join(", ") || "");
  const [creditHours, setCreditHours] = useState(course.creditHours?.toString() || "3");
  const [reqPercent, setReqPercent] = useState(course.requiredAttendance?.toString() || "75");

  // Sync state whenever dialog opens or course changes
  useEffect(() => {
    if (open) {
      setName(course.name);
      setCode(course.code || "");
      setDays(course.days?.join(", ") || "");
      setCreditHours(course.creditHours?.toString() || "3");
      setReqPercent(course.requiredAttendance?.toString() || "75");
    }
  }, [open, course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await updateCourse({
      ...course,
      name: name.trim(),
      code: code.trim() || undefined,
      days: days
        .split(",")
        .map(d => d.trim())
        .filter(Boolean),
      creditHours: Math.max(1, Number(creditHours) || 3),
      requiredAttendance: Math.min(100, Math.max(0, Number(reqPercent) || 75)),
    });
    setOpen(false);
  };

  const handleDeleteCourse = async () => {
    await deleteCourse(course.id);
    setDeleteConfirmOpen(false);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Edit Course"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          }
        />
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor={`edit-name-${course.id}`}>Course Name</Label>
              <Input
                id={`edit-name-${course.id}`}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Data Structures"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-code-${course.id}`}>Course Code (optional)</Label>
              <Input
                id={`edit-code-${course.id}`}
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. CS 101"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-days-${course.id}`}>Days &amp; Periods (comma-separated)</Label>
              <Input
                id={`edit-days-${course.id}`}
                value={days}
                onChange={e => setDays(e.target.value)}
                placeholder="e.g. Mon 2, Wed, Fri"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Tip: Add a number for multi-period days (e.g. &quot;Mon 2&quot; for double period).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`edit-credits-${course.id}`}>Credit Hours</Label>
                <Input
                  id={`edit-credits-${course.id}`}
                  type="number"
                  min="1"
                  max="10"
                  value={creditHours}
                  onChange={e => setCreditHours(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`edit-req-${course.id}`}>Required Attendance (%)</Label>
                <Input
                  id={`edit-req-${course.id}`}
                  type="number"
                  min="0"
                  max="100"
                  value={reqPercent}
                  onChange={e => setReqPercent(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Delete Course
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete &quot;{course.name}&quot;?</DialogTitle>
            <DialogDescription>
              This course will be moved to the Recycle Bin. You can restore it later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteCourse}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
