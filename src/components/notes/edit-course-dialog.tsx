"use client";

import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Course } from "@/lib/types";

interface EditCourseDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCourse: (course: Course) => Promise<void>;
}

function EditCourseForm({
  course,
  onUpdateCourse,
  onClose,
}: {
  course: Course;
  onUpdateCourse: (course: Course) => Promise<void>;
  onClose: () => void;
}) {
  const [courseCode, setCourseCode] = useState(course.code || "");
  const [courseName, setCourseName] = useState(course.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedCode = courseCode.trim().toUpperCase();
    const trimmedName = courseName.trim();

    if (!trimmedCode || !trimmedName) return;

    setIsSubmitting(true);
    try {
      await onUpdateCourse({
        ...course,
        code: trimmedCode,
        name: trimmedName,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="w-5 h-5 text-primary" />
          Edit Course Details
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Update the course code and name for this course.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="editCourseCode" className="text-sm font-medium">
            Course Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="editCourseCode"
            placeholder="e.g. CS101"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCourseName" className="text-sm font-medium">
            Course Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="editCourseName"
            placeholder="e.g. Intro to Computer Science"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!courseCode.trim() || !courseName.trim() || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditCourseDialog({
  course,
  open,
  onOpenChange,
  onUpdateCourse,
}: EditCourseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && course && (
          <EditCourseForm
            key={`edit-course-${course.id}`}
            course={course}
            onUpdateCourse={onUpdateCourse}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
