"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Plus,
  StickyNote,
  Layers,
  Hash,
  Calendar,
  X,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course, Note, formatNoteDate } from "./types";
import { CourseCard } from "./course-card";
import { EmptyState } from "./empty-state";
import { AddCourseDialog } from "./add-course-dialog";

interface CourseGridProps {
  courses: Course[];
  notes: Note[];
  onSelectCourse: (courseId: string, initialNoteId?: string) => void;
  onAddCourse: (course: Omit<Course, "id">) => Promise<Course | undefined | void>;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onOpenCreateNote: () => void;
}

export function CourseGrid({
  courses,
  notes,
  onSelectCourse,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onOpenCreateNote,
}: CourseGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

  const activeCourses = useMemo(
    () => courses.filter((c) => !c.isDeleted),
    [courses]
  );
  const activeNotes = useMemo(
    () => notes.filter((n) => !n.isDeleted),
    [notes]
  );

  // Global search filtering across courses AND notes
  const { filteredCourses, matchedNotes } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return { filteredCourses: activeCourses, matchedNotes: [] };
    }

    const matchedC = activeCourses.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.code && c.code.toLowerCase().includes(query))
    );

    const matchedN = activeNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query) ||
        (Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase().includes(query))) ||
        n.courseName.toLowerCase().includes(query)
    );

    return { filteredCourses: matchedC, matchedNotes: matchedN };
  }, [searchQuery, activeCourses, activeNotes]);

  // Overall statistics
  const totalNotesCount = activeNotes.length;
  const totalLecturesCount = useMemo(() => {
    const lectureKeys = new Set(
      activeNotes.map((n) => `${n.courseId}-lec-${n.lectureNumber}`)
    );
    return lectureKeys.size;
  }, [activeNotes]);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-primary" />
            Lecture Notes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Organized by course and lecture. Search across Markdown notes, code snippets, and summaries.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <AddCourseDialog
            open={isAddCourseOpen}
            onOpenChange={setIsAddCourseOpen}
            onAddCourse={onAddCourse}
          />
          {activeCourses.length > 0 && (
            <Button onClick={onOpenCreateNote} variant="secondary" className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> New Note
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border/70 bg-card/60 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{activeCourses.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Active Courses</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <StickyNote className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{totalNotesCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Total Notes Written</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{totalLecturesCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Lectures Cataloged</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search all courses, lecture topics, markdown keywords, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-9 h-11 bg-card/70 border-border/80 text-sm shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {activeCourses.length === 0 ? (
        <EmptyState
          type="no-courses"
          onAction={() => setIsAddCourseOpen(true)}
        />
      ) : searchQuery.trim() ? (
        /* Search results view */
        <div className="space-y-8">
          {/* Matched Courses */}
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Courses ({filteredCourses.length})
            </h2>
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    notes={notes}
                    onSelectCourse={onSelectCourse}
                    onEditCourse={onEditCourse}
                    onDeleteCourse={onDeleteCourse}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No courses match &quot;{searchQuery}&quot;.</p>
            )}
          </div>

          {/* Matched Notes */}
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Matching Notes ({matchedNotes.length})
            </h2>
            {matchedNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => onSelectCourse(note.courseId, note.id)}
                    className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] font-semibold border-primary/40 text-primary">
                        {note.courseName}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatNoteDate(note.date)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">
                      {note.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {note.content.replace(/[#*`_~[\]()]/g, '').slice(0, 120)}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">Lecture {note.lectureNumber}</span>
                      <span className="text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Open Note <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No note contents match &quot;{searchQuery}&quot;.</p>
            )}
          </div>
        </div>
      ) : (
        /* Regular Courses Grid */
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              All Courses ({activeCourses.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                notes={notes}
                onSelectCourse={onSelectCourse}
                onEditCourse={onEditCourse}
                onDeleteCourse={onDeleteCourse}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
