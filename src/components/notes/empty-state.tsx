"use client";

import React from "react";
import { BookOpen, FileText, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "no-courses" | "no-notes" | "no-search-results";
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  searchQuery?: string;
}

export function EmptyState({
  type,
  title,
  description,
  actionText,
  onAction,
  searchQuery,
}: EmptyStateProps) {
  if (type === "no-courses") {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 my-8 rounded-2xl border border-dashed border-border/80 bg-card/30 max-w-lg mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {title || "No Courses Added Yet"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description || "Create your first course to begin capturing, categorizing, and reviewing lecture notes."}
        </p>
        {onAction && (
          <Button onClick={onAction} className="shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            {actionText || "Add Your First Course"}
          </Button>
        )}
      </div>
    );
  }

  if (type === "no-notes") {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 h-full my-auto text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground/70">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {title || "No notes in this course"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          {description || "Start taking lecture notes with rich markdown support, code blocks, and images."}
        </p>
        {onAction && (
          <Button onClick={onAction} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {actionText || "Create Lecture 1 Note"}
          </Button>
        )}
      </div>
    );
  }

  // no-search-results
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 my-6 text-muted-foreground">
      <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center mb-3 text-muted-foreground/60">
        <Search className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-1">
        {title || "No matching notes found"}
      </h4>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">
        {description || (searchQuery ? `No results for "${searchQuery}". Try searching with different keywords.` : "Try adjusting your filters or search terms.")}
      </p>
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="text-xs h-8">
          {actionText || "Clear Filters"}
        </Button>
      )}
    </div>
  );
}
