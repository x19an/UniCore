"use client";

import React, { useState } from "react";
import { Plus, BookPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Course } from "@/lib/types";

interface AddCourseDialogProps {
  onAddCourse: (course: Omit<Course, "id">) => Promise<Course | undefined | void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddCourseDialog({
  onAddCourse,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: AddCourseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [creditHours, setCreditHours] = useState("3");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedCode = courseCode.trim().toUpperCase();
    const trimmedName = courseName.trim();

    if (!trimmedCode || !trimmedName) return;

    setIsSubmitting(true);
    try {
      await onAddCourse({
        code: trimmedCode,
        name: trimmedName,
        creditHours: parseInt(creditHours, 10) || 3,
        days: ["Mon", "Wed"],
        requiredAttendance: 75,
      });

      setCourseCode("");
      setCourseName("");
      setCreditHours("3");
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger
          render={
            React.isValidElement(trigger) ? (
              trigger
            ) : (
              <Button className="shadow-sm">{trigger}</Button>
            )
          }
        />
      ) : (
        <DialogTrigger
          render={
            <Button className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Course
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookPlus className="w-5 h-5 text-primary" />
              Add New Course
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your course code, title, and credit hours to organize lecture notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="courseCode" className="text-sm font-medium">
                Course Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="courseCode"
                placeholder="e.g. CS101 or MATH204"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                autoFocus
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Short identifier for the course (e.g. CS201).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseName" className="text-sm font-medium">
                Course Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="courseName"
                placeholder="e.g. Data Structures and Algorithms"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditHours" className="text-sm font-medium">
                Credit Hours
              </Label>
              <Input
                id="creditHours"
                type="number"
                min="1"
                max="10"
                placeholder="3"
                value={creditHours}
                onChange={(e) => setCreditHours(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!courseCode.trim() || !courseName.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
