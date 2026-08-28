"use client";

import React, { useState } from "react";
import { Book, Calendar, Hash, FileText, MoreVertical, Edit2, Trash2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Course, Note, formatNoteDate } from "./types";

interface CourseCardProps {
  course: Course;
  notes: Note[];
  onSelectCourse: (courseId: string) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export function CourseCard({
  course,
  notes,
  onSelectCourse,
  onEditCourse,
  onDeleteCourse,
}: CourseCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const courseNotes = notes
    .filter((n) => n.courseId === course.id && !n.isDeleted)
    .sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0));

  const noteCount = courseNotes.length;
  const latestNote = courseNotes[0];
  const allTags = Array.from(new Set(courseNotes.flatMap((n) => n.tags || []))).slice(0, 4);

  const handleDeleteConfirm = () => {
    onDeleteCourse(course.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card
        onClick={() => onSelectCourse(course.id)}
        className="group relative flex flex-col justify-between overflow-hidden border border-border/80 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer rounded-xl"
      >
        {/* Accent top gradient line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary/40 to-transparent group-hover:from-primary group-hover:via-primary/70 group-hover:to-primary/30 transition-all duration-300" />

        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                  <Book className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5 border-primary/30 text-primary">
                  {course.code || "COURSE"}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground truncate mt-2 group-hover:text-primary transition-colors">
                {course.name}
              </CardTitle>
            </div>

            {/* Menu Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Course actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEditCourse(course)}>
                  <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Course
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-3">
          {latestNote ? (
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Hash className="w-3 h-3 text-primary" /> Lec {latestNote.lectureNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatNoteDate(latestNote.date)}
                </span>
              </div>
              <p className="font-medium text-foreground truncate">{latestNote.title}</p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-muted/20 border border-dashed border-border/60 text-xs text-muted-foreground italic text-center">
              No notes taken yet.
            </div>
          )}

          {/* Tags preview */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-5 pt-2 border-t border-border/60 flex items-center justify-between bg-muted/10">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">{noteCount}</span>
            <span>{noteCount === 1 ? "note" : "notes"}</span>
          </div>

          <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View Notes <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Course?
            </DialogTitle>
            <DialogDescription className="text-sm pt-2">
              Are you sure you want to move <strong>{course.code || course.name}</strong> to the recycle bin? You can restore it anytime from the Recycle Bin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
