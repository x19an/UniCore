"use client";

import React, { useMemo } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Book,
  Calendar,
  X,
  ArrowUpDown,
  Tag as TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Course, Note, NoteSortOption, formatNoteDate } from "./types";
import { EmptyState } from "./empty-state";

interface NotesSidebarProps {
  activeCourse: Course;
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onBackToCourses: () => void;
  onOpenCreateNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  sortOption: NoteSortOption;
  onSortChange: (sort: NoteSortOption) => void;
}

export function NotesSidebar({
  activeCourse,
  notes,
  selectedNoteId,
  onSelectNote,
  onBackToCourses,
  onOpenCreateNote,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  sortOption,
  onSortChange,
}: NotesSidebarProps) {
  // Course-specific active notes
  const courseNotes = useMemo(
    () => notes.filter((n) => n.courseId === activeCourse.id && !n.isDeleted),
    [notes, activeCourse.id]
  );

  // All tags available in this course
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    courseNotes.forEach((n) => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set);
  }, [courseNotes]);

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let list = [...courseNotes];

    // Filter by tag
    if (selectedTag) {
      list = list.filter((n) =>
        Array.isArray(n.tags) && n.tags.includes(selectedTag)
      );
    }

    // Filter by keyword
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    list.sort((a, b) => {
      switch (sortOption) {
        case "lecture-asc":
          return (a.lectureNumber || 0) - (b.lectureNumber || 0) || (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0);
        case "lecture-desc":
          return (b.lectureNumber || 0) - (a.lectureNumber || 0) || (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0);
        case "date-desc":
          return (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0);
        case "date-asc":
          return (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0);
        case "title-asc":
          return a.title.localeCompare(b.title);
        default:
          return (a.lectureNumber || 0) - (b.lectureNumber || 0);
      }
    });

    return list;
  }, [courseNotes, selectedTag, searchQuery, sortOption]);

  const sortLabels: Record<NoteSortOption, string> = {
    "lecture-asc": "Lecture (1 → N)",
    "lecture-desc": "Lecture (N → 1)",
    "date-desc": "Date (Newest First)",
    "date-asc": "Date (Oldest First)",
    "title-asc": "Title (A → Z)",
  };

  return (
    <div className="w-80 md:w-96 border-r border-border/80 flex flex-col bg-card/40 shrink-0 h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border/80 space-y-3 shrink-0">
        {/* Back to courses button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToCourses}
          className="-ml-2 h-8 px-2 text-muted-foreground hover:text-foreground text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Courses
        </Button>

        {/* Course info */}
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-primary/10 text-primary">
              <Book className="w-4 h-4" />
            </div>
            <span className="font-mono text-xs font-bold text-primary">
              {activeCourse.code || "COURSE"}
            </span>
          </div>
          <h2
            className="text-base font-bold text-foreground truncate mt-1"
            title={activeCourse.name}
          >
            {activeCourse.name}
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {courseNotes.length} {courseNotes.length === 1 ? "note" : "notes"} cataloged
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Filter notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-8 h-8 text-xs bg-background"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="h-7 text-[11px] px-2 gap-1 text-muted-foreground">
                  <ArrowUpDown className="w-3 h-3" />
                  <span>{sortLabels[sortOption]}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onClick={() => onSortChange("lecture-asc")}>
                Lecture (1 → N)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("lecture-desc")}>
                Lecture (N → 1)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("date-desc")}>
                Date (Newest First)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("date-asc")}>
                Date (Oldest First)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("title-asc")}>
                Title (A → Z)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={onOpenCreateNote}
            className="h-7 text-xs px-2.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> New Note
          </Button>
        </div>

        {/* Tag pills filter */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none pt-1">
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              onClick={() => onSelectTag(null)}
              className="cursor-pointer text-[10px] px-2 py-0.5 rounded-full shrink-0"
            >
              All
            </Badge>
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                className="cursor-pointer text-[10px] px-2 py-0.5 rounded-full shrink-0 gap-1"
              >
                <TagIcon className="w-2.5 h-2.5 opacity-70" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          {filteredAndSortedNotes.length === 0 ? (
            <EmptyState
              type={courseNotes.length === 0 ? "no-notes" : "no-search-results"}
              searchQuery={searchQuery}
              onAction={
                courseNotes.length === 0
                  ? onOpenCreateNote
                  : () => {
                      onSearchChange("");
                      onSelectTag(null);
                    }
              }
              actionText={courseNotes.length === 0 ? "Create First Note" : "Reset Filters"}
            />
          ) : (
            filteredAndSortedNotes.map((note) => {
              const isSelected = selectedNoteId === note.id;
              const cleanSnippet = note.content
                .replace(/[#*`_~[\]()]/g, '')
                .replace(/\n+/g, ' ')
                .trim();

              return (
                <button
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-150 relative group ${
                    isSelected
                      ? "bg-primary/15 text-foreground border border-primary/40 shadow-sm"
                      : "hover:bg-accent/60 text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  {/* Active bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r" />
                  )}

                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 font-semibold font-mono ${
                        isSelected
                          ? "border-primary/50 text-primary bg-primary/10"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      Lec {note.lectureNumber}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatNoteDate(note.date)}
                    </span>
                  </div>

                  <div className="font-semibold text-foreground text-xs md:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {note.title}
                  </div>

                  {cleanSnippet && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {cleanSnippet}
                    </p>
                  )}

                  {/* Tags */}
                  {Array.isArray(note.tags) && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/40"
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[9px] text-muted-foreground">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
