"use client";

import React, { useState, useMemo } from "react";
import { useGlobalStore } from "@/lib/global-store";
import { Course, Note, NoteSortOption } from "./types";
import { CourseGrid } from "./course-grid";
import { NotesSidebar } from "./notes-sidebar";
import { NoteViewer } from "./note-viewer";
import { NoteEditorDialog } from "./note-editor-dialog";
import { EditCourseDialog } from "./edit-course-dialog";

export default function NotesModule() {
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
  } = useGlobalStore();

  // Navigation states
  const [viewMode, setViewMode] = useState<"courses" | "notes">("courses");
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Filter & Search states inside notes view
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<NoteSortOption>("lecture-asc");

  // Dialog states
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  // Active courses and active course notes
  const activeCourses = useMemo(
    () => courses.filter((c) => !c.isDeleted),
    [courses]
  );

  const activeCourse = useMemo(
    () => activeCourses.find((c) => c.id === activeCourseId) || null,
    [activeCourses, activeCourseId]
  );

  const activeCourseNotes = useMemo(
    () =>
      notes.filter((n) => n.courseId === activeCourseId && !n.isDeleted),
    [notes, activeCourseId]
  );

  // Select note logic
  const currentSelectedNote = useMemo(() => {
    if (!activeCourseNotes || activeCourseNotes.length === 0) return null;
    if (selectedNoteId) {
      const found = activeCourseNotes.find((n) => n.id === selectedNoteId);
      if (found) return found;
    }
    // Default to the first note chronologically by lecture number
    const sorted = [...activeCourseNotes].sort(
      (a, b) =>
        (a.lectureNumber || 0) - (b.lectureNumber || 0) ||
        (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0)
    );
    return sorted[0] || null;
  }, [activeCourseNotes, selectedNoteId]);

  // Handlers
  const handleSelectCourse = (courseId: string, initialNoteId?: string) => {
    setActiveCourseId(courseId);
    setSelectedNoteId(initialNoteId || null);
    setSidebarSearchQuery("");
    setSelectedTag(null);
    setViewMode("notes");
  };

  const handleBackToCourses = () => {
    setViewMode("courses");
    setActiveCourseId(null);
    setSelectedNoteId(null);
    setSidebarSearchQuery("");
    setSelectedTag(null);
  };

  const handleOpenCreateNote = (targetCourseId?: string) => {
    if (targetCourseId) {
      setActiveCourseId(targetCourseId);
    }
    setNoteToEdit(null);
    setIsNoteEditorOpen(true);
  };

  const handleOpenEditNote = (note: Note) => {
    setNoteToEdit(note);
    setIsNoteEditorOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setIsEditCourseOpen(true);
  };

  const handleSaveNewNote = async (noteData: {
    courseId: string;
    courseName: string;
    title: string;
    date: string;
    lectureNumber: number;
    tags: string[];
    content: string;
  }) => {
    const createdNote = await addNote(noteData);
    if (createdNote) {
      setActiveCourseId(createdNote.courseId);
      setSelectedNoteId(createdNote.id);
      setViewMode("notes");
    }
  };

  const handleDeleteNoteWithSync = async (noteId: string) => {
    await deleteNote(noteId);
    if (selectedNoteId === noteId) {
      // Find remaining notes in this course
      const remaining = activeCourseNotes.filter((n) => n.id !== noteId);
      if (remaining.length > 0) {
        setSelectedNoteId(remaining[0].id);
      } else {
        setSelectedNoteId(null);
      }
    }
  };

  const handleDeleteCourseWithSync = async (courseId: string) => {
    await deleteCourse(courseId);
    if (activeCourseId === courseId) {
      handleBackToCourses();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-background text-foreground flex flex-col">
      {viewMode === "courses" || !activeCourse ? (
        <div className="flex-1 overflow-y-auto">
          <CourseGrid
            courses={activeCourses}
            notes={notes}
            onSelectCourse={handleSelectCourse}
            onAddCourse={addCourse}
            onEditCourse={handleOpenEditCourse}
            onDeleteCourse={handleDeleteCourseWithSync}
            onOpenCreateNote={() => handleOpenCreateNote()}
          />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Notes Sidebar */}
          <NotesSidebar
            activeCourse={activeCourse}
            notes={notes}
            selectedNoteId={currentSelectedNote?.id || null}
            onSelectNote={setSelectedNoteId}
            onBackToCourses={handleBackToCourses}
            onOpenCreateNote={() => handleOpenCreateNote(activeCourse.id)}
            searchQuery={sidebarSearchQuery}
            onSearchChange={setSidebarSearchQuery}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />

          {/* Note Viewer */}
          <NoteViewer
            note={currentSelectedNote}
            activeCourse={activeCourse}
            allCourseNotes={activeCourseNotes}
            onEditNote={handleOpenEditNote}
            onDeleteNote={handleDeleteNoteWithSync}
            onSelectNote={setSelectedNoteId}
          />
        </div>
      )}

      {/* Note Creation / Editing Dialog */}
      <NoteEditorDialog
        open={isNoteEditorOpen}
        onOpenChange={setIsNoteEditorOpen}
        noteToEdit={noteToEdit}
        activeCourseId={activeCourseId}
        courses={activeCourses}
        existingNotes={notes}
        onSaveNote={handleSaveNewNote}
        onUpdateNote={updateNote}
      />

      {/* Course Edit Dialog */}
      <EditCourseDialog
        course={courseToEdit}
        open={isEditCourseOpen}
        onOpenChange={setIsEditCourseOpen}
        onUpdateCourse={updateCourse}
      />
    </div>
  );
}
