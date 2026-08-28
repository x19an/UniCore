"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Eye, PenLine, Calendar as CalendarIcon, Hash, BookOpen } from "lucide-react";
import { Course, Note, getTodayDateStr } from "./types";
import { MarkdownToolbar } from "./markdown-toolbar";
import { MarkdownRenderer } from "./markdown-renderer";
import { createClient } from "@/utils/supabase/client";

interface NoteEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteToEdit?: Note | null;
  activeCourseId?: string | null;
  courses: Course[];
  existingNotes: Note[];
  onSaveNote: (noteData: {
    courseId: string;
    courseName: string;
    title: string;
    date: string;
    lectureNumber: number;
    tags: string[];
    content: string;
  }) => Promise<Note | undefined | void>;
  onUpdateNote?: (note: Note) => Promise<void>;
}

function NoteEditorForm({
  noteToEdit,
  activeCourseId,
  courses,
  existingNotes,
  onSaveNote,
  onUpdateNote,
  onClose,
}: {
  noteToEdit?: Note | null;
  activeCourseId?: string | null;
  courses: Course[];
  existingNotes: Note[];
  onSaveNote: (noteData: {
    courseId: string;
    courseName: string;
    title: string;
    date: string;
    lectureNumber: number;
    tags: string[];
    content: string;
  }) => Promise<Note | undefined | void>;
  onUpdateNote?: (note: Note) => Promise<void>;
  onClose: () => void;
}) {
  const activeCourses = courses.filter((c) => !c.isDeleted);
  const defaultCourseId = noteToEdit?.courseId || activeCourseId || (activeCourses[0]?.id ?? "");

  // Auto calculate default lecture number
  const calculateDefaultLec = (targetCourseId: string = defaultCourseId) => {
    if (noteToEdit?.lectureNumber) return noteToEdit.lectureNumber.toString();
    const courseNotes = existingNotes.filter(
      (n) => n.courseId === targetCourseId && !n.isDeleted
    );
    const maxLec = courseNotes.reduce(
      (max, n) => Math.max(max, n.lectureNumber || 0),
      0
    );
    return (maxLec + 1).toString();
  };

  const [title, setTitle] = useState(noteToEdit?.title || "");
  const [courseId, setCourseId] = useState(defaultCourseId);
  const [lectureNumber, setLectureNumber] = useState(calculateDefaultLec(defaultCourseId));
  const [date, setDate] = useState(noteToEdit?.date || getTodayDateStr());
  const [content, setContent] = useState(noteToEdit?.content || "");
  const [tags, setTags] = useState<string[]>(
    Array.isArray(noteToEdit?.tags) ? [...noteToEdit.tags] : []
  );
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCourseChange = (newCourseId: string | null) => {
    if (!newCourseId) return;
    setCourseId(newCourseId);
    if (!noteToEdit) {
      setLectureNumber(calculateDefaultLec(newCourseId));
    }
  };

  // Suggested tags collected from existing notes
  const suggestedTags = Array.from(
    new Set(existingNotes.flatMap((n) => n.tags || []))
  ).filter((t) => !tags.includes(t)).slice(0, 6);

  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || tagInput;
    const clean = raw.trim().toLowerCase().replace(/^[#,]+/, '');
    if (!clean) return;

    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageFile = async (file: File) => {
    if (!file) return;
    const rawName = file.name || "image.png";
    const cleanName = rawName.replace(/\.[^/.]+$/, "") || "image";
    const fileExt = (rawName.split(".").pop() || "png").toLowerCase();

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
          .from("notes_images")
          .upload(fileName, file);

        if (!error) {
          const { data: publicUrlData } = supabase.storage
            .from("notes_images")
            .getPublicUrl(fileName);

          const imageMarkdown = `\n\n![${cleanName}](${publicUrlData.publicUrl})\n\n`;
          setContent((prev) => prev + imageMarkdown);
          return;
        }
      }
    } catch (err) {
      console.warn("Supabase image upload failed, converting to Base64:", err);
    }

    // Fallback: Read as base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        const imageMarkdown = `\n\n![${cleanName}](${base64Url})\n\n`;
        setContent((prev) => prev + imageMarkdown);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleImageFile(file);
          break;
        }
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle || !courseId) return;

    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const parsedLecture = Math.max(1, parseInt(lectureNumber, 10) || 1);

    setIsSubmitting(true);
    try {
      if (noteToEdit && onUpdateNote) {
        await onUpdateNote({
          ...noteToEdit,
          courseId,
          courseName: course.name,
          title: trimmedTitle,
          date: date || getTodayDateStr(),
          lectureNumber: parsedLecture,
          tags,
          content,
        });
      } else {
        await onSaveNote({
          courseId,
          courseName: course.name,
          title: trimmedTitle,
          date: date || getTodayDateStr(),
          lectureNumber: parsedLecture,
          tags,
          content,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <DialogHeader className="p-6 pb-4 border-b border-border/80 bg-card/40 shrink-0">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <PenLine className="w-5 h-5 text-primary" />
            {noteToEdit ? "Edit Lecture Note" : "Create New Lecture Note"}
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          {noteToEdit ? "Modify note details and markdown content." : "Capture rich markdown notes, code blocks, and diagrams for your course."}
        </DialogDescription>
      </DialogHeader>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Top metadata grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Course Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="courseSelect" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5 text-primary" /> Course
            </Label>
            <Select value={courseId} onValueChange={handleCourseChange}>
              <SelectTrigger id="courseSelect" className="w-full">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {activeCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code ? `${c.code}: ` : ""}{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lecture Number */}
          <div className="space-y-1.5">
            <Label htmlFor="lecNum" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
              <Hash className="w-3.5 h-3.5 text-primary" /> Lecture Number
            </Label>
            <Input
              id="lecNum"
              type="number"
              min="1"
              placeholder="1"
              value={lectureNumber}
              onChange={(e) => setLectureNumber(e.target.value)}
              required
            />
          </div>

          {/* Lecture Date */}
          <div className="space-y-1.5">
            <Label htmlFor="lecDate" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" /> Lecture Date
            </Label>
            <Input
              id="lecDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Note Title */}
        <div className="space-y-1.5">
          <Label htmlFor="noteTitle" className="text-xs font-semibold text-muted-foreground">
            Note Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="noteTitle"
            placeholder="e.g. Memory Management, Dynamic Arrays, Backpropagation..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-medium"
            required
          />
        </div>

        {/* Tags Management */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Tags & Keywords</Label>
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-border/80 bg-muted/20 min-h-[44px]">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 pr-1.5 text-xs py-0.5 bg-primary/15 text-primary hover:bg-primary/20 transition-colors"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-destructive p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <div className="flex items-center gap-1 flex-1 min-w-[140px]">
              <Input
                placeholder="Add tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="h-7 text-xs border-0 bg-transparent shadow-none focus-visible:ring-0 px-1 placeholder:text-muted-foreground/60"
              />
              {tagInput.trim() && (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => handleAddTag()}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Tag suggestions */}
          {suggestedTags.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
              <span>Suggested:</span>
              {suggestedTags.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleAddTag(st)}
                  className="text-xs px-2 py-0.5 rounded-full border border-border/60 hover:border-primary hover:text-primary transition-colors bg-card"
                >
                  +{st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Note Content (Markdown Editor with Write / Preview Tabs) */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="noteContent" className="text-xs font-semibold text-muted-foreground">
              Lecture Content
            </Label>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")}>
              <TabsList className="h-8 p-0.5">
                <TabsTrigger value="write" className="text-xs px-2.5 py-1 gap-1.5">
                  <PenLine className="w-3.5 h-3.5" /> Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs px-2.5 py-1 gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Hidden file input for image uploads */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {activeTab === "write" ? (
            <div className="space-y-2">
              <MarkdownToolbar
                textareaRef={textareaRef}
                content={content}
                onChange={setContent}
                onOpenImageUpload={() => fileInputRef.current?.click()}
              />
              <Textarea
                ref={textareaRef}
                id="noteContent"
                placeholder="Type notes in Markdown... Paste images, write code blocks with ```, insert formulas, quotes, or tables."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                className="min-h-[320px] font-mono text-sm leading-relaxed p-4 bg-muted/10 resize-y"
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                <span>Markdown formatting supported • Ctrl+V to paste images</span>
                <span>{content.length} characters • {content.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
          ) : (
            <div className="min-h-[360px] p-6 rounded-lg border border-border/80 bg-card/40 overflow-y-auto max-h-[450px]">
              {content ? (
                <MarkdownRenderer content={content} />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Nothing to preview yet. Switch back to Write mode and add notes.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="p-4 px-6 border-t border-border/80 bg-card/40 shrink-0 gap-2">
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
          disabled={!title.trim() || !courseId || isSubmitting}
          className="shadow-sm"
        >
          {isSubmitting
            ? "Saving..."
            : noteToEdit
            ? "Save Changes"
            : "Create Note"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function NoteEditorDialog({
  open,
  onOpenChange,
  noteToEdit,
  activeCourseId,
  courses,
  existingNotes,
  onSaveNote,
  onUpdateNote,
}: NoteEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        {open && (
          <NoteEditorForm
            key={noteToEdit ? `edit-${noteToEdit.id}` : `new-${activeCourseId || "none"}`}
            noteToEdit={noteToEdit}
            activeCourseId={activeCourseId}
            courses={courses}
            existingNotes={existingNotes}
            onSaveNote={onSaveNote}
            onUpdateNote={onUpdateNote}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
