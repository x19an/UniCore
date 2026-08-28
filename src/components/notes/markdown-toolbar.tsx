"use client";

import React from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  onChange: (value: string) => void;
  onOpenImageUpload?: () => void;
}

export function MarkdownToolbar({
  textareaRef,
  content,
  onChange,
  onOpenImageUpload,
}: MarkdownToolbarProps) {
  const insertFormatting = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;

    const replacement = `${before}${selectedText}${after}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);

    onChange(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const insertLinePrefix = (prefix: string, defaultText: string = "Item") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText) {
      const lines = selectedText.split('\n');
      const formatted = lines.map(line => `${prefix}${line}`).join('\n');
      const newContent = content.substring(0, start) + formatted + content.substring(end);
      onChange(newContent);
    } else {
      const isNewLine = start === 0 || content[start - 1] === '\n';
      const insertText = isNewLine ? `${prefix}${defaultText}` : `\n${prefix}${defaultText}`;
      const newContent = content.substring(0, start) + insertText + content.substring(end);
      onChange(newContent);
    }

    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const insertTable = () => {
    const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Data 1 | Data 2 | Data 3 |\n| Data 4 | Data 5 | Data 6 |\n`;
    insertFormatting("", "", tableTemplate);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (!url) return;
    const title = prompt("Enter link title:", "Resource Link") || "link";
    insertFormatting(`[${title}](`, `)`, url);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-muted/40 border border-border/80 rounded-lg text-muted-foreground">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => insertFormatting("**", "**", "bold text")}
        title="Bold (Ctrl+B)"
        className="h-8 w-8 hover:text-foreground"
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => insertFormatting("*", "*", "italic text")}
        title="Italic (Ctrl+I)"
        className="h-8 w-8 hover:text-foreground"
      >
        <Italic className="w-4 h-4" />
      </Button>

      <div className="h-4 w-px bg-border/80 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => insertLinePrefix("# ", "Heading 1")}
        title="Heading 1"
        className="h-8 w-8 hover:text-foreground"
      >
        <Heading1 className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => insertLinePrefix("## ", "Heading 2")}
        title="Heading 2"
        className="h-8 w-8 hover:text-foreground"
      >
        <Heading2 className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => insertLinePrefix("### ", "Heading 3")}
        title="Heading 3"
        className="h-8 w-8 hover:text-foreground"
      >
        <Heading3 className="w-4 h-4" />
      </Button>

      <div className="h-4 w-px bg-border/80 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => insertLinePrefix("- ", "List item")}
        title="Bullet List"
        className="h-8 w-8 hover:text-foreground"
      >
        <List className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => insertLinePrefix("1. ", "Numbered item")}
        title="Numbered List"
        className="h-8 w-8 hover:text-foreground"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => insertLinePrefix("- [ ] ", "Checklist task")}
        title="Task List"
        className="h-8 w-8 hover:text-foreground"
      >
        <ListTodo className="w-4 h-4" />
      </Button>

      <div className="h-4 w-px bg-border/80 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => insertFormatting("```typescript\n", "\n```", "// Write code here")}
        title="Code Block"
        className="h-8 w-8 hover:text-foreground"
      >
        <Code className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => insertLinePrefix("> ", "Quote")}
        title="Blockquote"
        className="h-8 w-8 hover:text-foreground"
      >
        <Quote className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={insertTable}
        title="Insert Table"
        className="h-8 w-8 hover:text-foreground"
      >
        <TableIcon className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={insertLink}
        title="Insert Link"
        className="h-8 w-8 hover:text-foreground"
      >
        <LinkIcon className="w-4 h-4" />
      </Button>

      {onOpenImageUpload && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onOpenImageUpload}
          title="Upload or Insert Image"
          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
