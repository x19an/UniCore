"use client";

import React, { useState } from "react";
import {
  Calendar,
  Hash,
  Edit2,
  Trash2,
  Copy,
  Check,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Course, Note, formatNoteDate } from "./types";
import { MarkdownRenderer } from "./markdown-renderer";

interface NoteViewerProps {
  note: Note | null;
  activeCourse: Course;
  allCourseNotes: Note[];
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onSelectNote: (noteId: string) => void;
}

export function NoteViewer({
  note,
  activeCourse,
  allCourseNotes,
  onEditNote,
  onDeleteNote,
  onSelectNote,
}: NoteViewerProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-background">
        <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4 text-muted-foreground/50">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">No Note Selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a lecture note from the sidebar or click New Note to capture your class thoughts.
        </p>
      </div>
    );
  }

  // Sorted list of all active notes for previous / next navigation
  const sortedNotes = [...allCourseNotes]
    .filter((n) => !n.isDeleted)
    .sort((a, b) => (a.lectureNumber || 0) - (b.lectureNumber || 0) || (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0));

  const currentIndex = sortedNotes.findIndex((n) => n.id === note.id);
  const prevNote = currentIndex > 0 ? sortedNotes[currentIndex - 1] : null;
  const nextNote =
    currentIndex >= 0 && currentIndex < sortedNotes.length - 1
      ? sortedNotes[currentIndex + 1]
      : null;

  const handleCopyMarkdown = () => {
    const fullText = `# ${note.title}\n\n**Course:** ${activeCourse.name} (${activeCourse.code})\n**Date:** ${note.date}\n**Lecture:** ${note.lectureNumber}\n\n${note.content}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const filename = `${activeCourse.code || "Course"}_Lec${note.lectureNumber}_${note.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`;
    const fullText = `# ${note.title}\n\n**Course:** ${activeCourse.name} (${activeCourse.code})\n**Date:** ${note.date}\n**Lecture:** ${note.lectureNumber}\n\n${note.content}`;
    const blob = new Blob([fullText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfirm = () => {
    onDeleteNote(note.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 md:p-8 border-b border-border/80 bg-card/20 shrink-0 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono font-semibold text-primary border-primary/30 bg-primary/10">
              {activeCourse.code || "COURSE"}
            </Badge>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-primary" /> Lecture {note.lectureNumber}
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" /> {formatNoteDate(note.date)}
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              className="h-8 text-xs gap-1.5"
              title="Copy as Markdown"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadMarkdown}
              className="h-8 text-xs gap-1.5"
              title="Download as .md file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditNote(note)}
              className="h-8 text-xs gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete Note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Note Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
          {note.title}
        </h1>

        {/* Tags */}
        {Array.isArray(note.tags) && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {note.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2.5 py-0.5 rounded-full bg-secondary/80 text-secondary-foreground"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <ScrollArea className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Note content rendered via rich markdown */}
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <MarkdownRenderer content={note.content} />
          </div>

          {/* Chronological Navigation Footer (Previous / Next Lecture) */}
          <div className="pt-8 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevNote ? (
              <button
                onClick={() => onSelectNote(prevNote.id)}
                className="p-4 rounded-xl border border-border/70 hover:border-primary/40 bg-card hover:bg-accent/40 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-muted/60 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5">
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-muted-foreground font-medium">
                    Previous • Lecture {prevNote.lectureNumber}
                  </div>
                  <div className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors mt-0.5">
                    {prevNote.title}
                  </div>
                </div>
              </button>
            ) : (
              <div />
            )}

            {nextNote && (
              <button
                onClick={() => onSelectNote(nextNote.id)}
                className="p-4 rounded-xl border border-border/70 hover:border-primary/40 bg-card hover:bg-accent/40 text-right transition-all group flex items-start justify-end gap-3 sm:col-start-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-muted-foreground font-medium">
                    Next • Lecture {nextNote.lectureNumber}
                  </div>
                  <div className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors mt-0.5">
                    {nextNote.title}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/60 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Delete Note Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Lecture Note?
            </DialogTitle>
            <DialogDescription className="text-sm pt-2">
              Are you sure you want to delete <strong>{note.title}</strong>? It will be moved to the Recycle Bin and can be restored at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
