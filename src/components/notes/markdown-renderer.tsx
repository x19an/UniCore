"use client";

import React, { useState } from "react";
import { Check, Copy, AlertCircle, Info, Lightbulb, AlertTriangle, ExternalLink, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-border/70 bg-zinc-950 font-mono text-xs shadow-md">
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900/90 border-b border-border/50 text-zinc-400">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-300">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-zinc-100 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function InlineFormattedText({ text }: { text: string }) {
  if (!text) return null;

  // Process inline code `code`, bold **text**, italic *text*, links [text](url), etc.
  const regex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|==[^=]+==|\[[^\]]+\]\([^)]+\)|!\[[^\]]*\]\([^)]+\))/g;
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // Inline code
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <code
              key={index}
              className="px-1.5 py-0.5 mx-0.5 rounded bg-muted/80 text-primary font-mono text-[0.875em] border border-border/50 font-medium"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        // Bold + Italic
        if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
          return (
            <strong key={index} className="font-bold italic text-foreground">
              {part.slice(3, -3)}
            </strong>
          );
        }

        // Bold
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }

        // Italic
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return (
            <em key={index} className="italic text-foreground/90">
              {part.slice(1, -1)}
            </em>
          );
        }

        // Strikethrough
        if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
          return (
            <del key={index} className="line-through opacity-70">
              {part.slice(2, -2)}
            </del>
          );
        }

        // Highlight
        if (part.startsWith('==') && part.endsWith('==') && part.length >= 4) {
          return (
            <mark key={index} className="bg-primary/25 text-primary px-1 rounded">
              {part.slice(2, -2)}
            </mark>
          );
        }

        // Markdown Link: [text](url)
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const [, linkText, linkUrl] = linkMatch;
          return (
            <a
              key={index}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-primary underline underline-offset-4 hover:text-primary/80 font-medium transition-colors"
            >
              <span>{linkText}</span>
              <ExternalLink className="w-3 h-3 inline-block opacity-70" />
            </a>
          );
        }

        // Markdown Image inline: ![alt](url)
        const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          const [, alt, url] = imgMatch;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              src={url}
              alt={alt || "Note Image"}
              className="inline-block max-w-full rounded-md border border-border my-2 max-h-96 object-contain"
            />
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const [zoomImage, setZoomImage] = useState<{ url: string; alt: string } | null>(null);

  if (!content) {
    return <p className="text-muted-foreground italic">No content available.</p>;
  }

  // Parse lines into structured blocks
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeLanguage = "";
  let codeBuffer: string[] = [];

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  let inBlockquote = false;
  let blockquoteBuffer: string[] = [];
  let alertType: 'NOTE' | 'TIP' | 'WARNING' | 'IMPORTANT' | 'CAUTION' | null = null;

  const flushCodeBlock = (key: string | number) => {
    if (codeBuffer.length > 0 || inCodeBlock) {
      blocks.push(
        <CodeBlock
          key={`code-${key}`}
          code={codeBuffer.join('\n')}
          language={codeLanguage}
        />
      );
      codeBuffer = [];
      inCodeBlock = false;
      codeLanguage = "";
    }
  };

  const flushTable = (key: string | number) => {
    if (inTable && tableHeader.length > 0) {
      blocks.push(
        <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
              <tr>
                {tableHeader.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold">
                    <InlineFormattedText text={h.trim()} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/20 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2 text-foreground/90">
                      <InlineFormattedText text={cell.trim()} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeader = [];
      tableRows = [];
      inTable = false;
    }
  };

  const flushBlockquote = (key: string | number) => {
    if (blockquoteBuffer.length > 0) {
      const quoteContent = blockquoteBuffer.join('\n');
      
      if (alertType) {
        const alertConfig = {
          NOTE: {
            title: "Note",
            icon: Info,
            border: "border-blue-500/50 bg-blue-950/20 text-blue-300",
            iconColor: "text-blue-400"
          },
          TIP: {
            title: "Tip",
            icon: Lightbulb,
            border: "border-emerald-500/50 bg-emerald-950/20 text-emerald-300",
            iconColor: "text-emerald-400"
          },
          WARNING: {
            title: "Warning",
            icon: AlertTriangle,
            border: "border-amber-500/50 bg-amber-950/20 text-amber-300",
            iconColor: "text-amber-400"
          },
          IMPORTANT: {
            title: "Important",
            icon: AlertCircle,
            border: "border-purple-500/50 bg-purple-950/20 text-purple-300",
            iconColor: "text-purple-400"
          },
          CAUTION: {
            title: "Caution",
            icon: AlertTriangle,
            border: "border-rose-500/50 bg-rose-950/20 text-rose-300",
            iconColor: "text-rose-400"
          },
        }[alertType];

        const IconComponent = alertConfig.icon;

        blocks.push(
          <div
            key={`alert-${key}`}
            className={`my-4 p-4 rounded-lg border-l-4 ${alertConfig.border} flex items-start gap-3 shadow-sm`}
          >
            <IconComponent className={`w-5 h-5 ${alertConfig.iconColor} shrink-0 mt-0.5`} />
            <div className="space-y-1 text-sm text-foreground/90 leading-relaxed flex-1">
              <div className="font-semibold text-xs tracking-wider uppercase opacity-90">
                {alertConfig.title}
              </div>
              <div className="leading-relaxed">
                <InlineFormattedText text={quoteContent} />
              </div>
            </div>
          </div>
        );
      } else {
        blocks.push(
          <blockquote
            key={`quote-${key}`}
            className="my-4 border-l-4 border-primary/50 pl-4 py-1.5 italic text-muted-foreground bg-muted/20 rounded-r-md text-sm leading-relaxed"
          >
            <InlineFormattedText text={quoteContent} />
          </blockquote>
        );
      }

      blockquoteBuffer = [];
      inBlockquote = false;
      alertType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(i);
      } else {
        flushTable(i);
        flushBlockquote(i);
        inCodeBlock = true;
        codeLanguage = line.trim().replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Table handling
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushBlockquote(i);
      const cells = line.trim().split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
      
      // Check if it's header separator (e.g. |---|---| or |:---|:---:|)
      const isSeparator = cells.every(c => c.trim().match(/^:?-+:?$/));

      if (isSeparator) {
        // Just separator line, continue
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Blockquote handling
    if (line.trim().startsWith('>')) {
      inBlockquote = true;
      const rawText = line.trim().replace(/^>\s?/, '');

      // Check for GitHub style alert header (e.g. [!NOTE], [!WARNING], [!TIP])
      const alertMatch = rawText.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i);
      if (alertMatch) {
        alertType = alertMatch[1].toUpperCase() as 'NOTE' | 'TIP' | 'WARNING' | 'IMPORTANT' | 'CAUTION';
        continue;
      }

      blockquoteBuffer.push(rawText);
      continue;
    } else if (inBlockquote) {
      flushBlockquote(i);
    }

    // Empty lines
    if (line.trim() === '') {
      blocks.push(<div key={`spacer-${i}`} className="h-3" />);
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      blocks.push(<hr key={`hr-${i}`} className="my-6 border-t border-border" />);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${i}`} className="text-2xl md:text-3xl font-bold tracking-tight mt-6 mb-3 text-foreground border-b border-border/40 pb-2">
          <InlineFormattedText text={line.slice(2)} />
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-xl md:text-2xl font-semibold tracking-tight mt-5 mb-2.5 text-foreground border-b border-border/30 pb-1.5">
          <InlineFormattedText text={line.slice(3)} />
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="text-lg md:text-xl font-medium mt-4 mb-2 text-primary">
          <InlineFormattedText text={line.slice(4)} />
        </h3>
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      blocks.push(
        <h4 key={`h4-${i}`} className="text-base font-medium mt-3 mb-1.5 text-foreground/90">
          <InlineFormattedText text={line.slice(5)} />
        </h4>
      );
      continue;
    }

    if (line.startsWith('##### ')) {
      blocks.push(
        <h5 key={`h5-${i}`} className="text-sm font-semibold mt-2.5 mb-1 text-foreground/80">
          <InlineFormattedText text={line.slice(6)} />
        </h5>
      );
      continue;
    }

    if (line.startsWith('###### ')) {
      blocks.push(
        <h6 key={`h6-${i}`} className="text-xs font-semibold uppercase tracking-wider mt-2 mb-1 text-muted-foreground">
          <InlineFormattedText text={line.slice(7)} />
        </h6>
      );
      continue;
    }

    // Task list items: - [x] or - [ ]
    const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)/);
    if (taskMatch) {
      const isChecked = taskMatch[1].toLowerCase() === 'x';
      const taskText = taskMatch[2];
      blocks.push(
        <div key={`task-${i}`} className="flex items-start gap-2.5 my-1.5 ml-2 text-sm leading-relaxed">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="rounded border-border mt-1 accent-primary w-4 h-4 cursor-default pointer-events-none"
          />
          <span className={isChecked ? "line-through text-muted-foreground" : "text-foreground"}>
            <InlineFormattedText text={taskText} />
          </span>
        </div>
      );
      continue;
    }

    // Unordered List Items: - or *
    if (line.match(/^[-*]\s+(.*)/)) {
      const listContent = line.replace(/^[-*]\s+/, '');
      blocks.push(
        <div key={`ul-${i}`} className="flex items-start gap-2.5 my-1 ml-3 text-sm leading-relaxed text-foreground">
          <span className="text-primary font-bold text-base leading-none select-none">•</span>
          <div className="flex-1">
            <InlineFormattedText text={listContent} />
          </div>
        </div>
      );
      continue;
    }

    // Ordered List Items: 1. 2. etc.
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      const num = orderedMatch[1];
      const text = orderedMatch[2];
      blocks.push(
        <div key={`ol-${i}`} className="flex items-start gap-2.5 my-1 ml-3 text-sm leading-relaxed text-foreground">
          <span className="font-semibold text-primary/80 select-none text-xs min-w-[1.2rem] mt-0.5">
            {num}.
          </span>
          <div className="flex-1">
            <InlineFormattedText text={text} />
          </div>
        </div>
      );
      continue;
    }

    // Standalone Image: ![alt](url)
    const standAloneImgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (standAloneImgMatch) {
      const alt = standAloneImgMatch[1] || "Note Image";
      const url = standAloneImgMatch[2];
      blocks.push(
        <div key={`img-container-${i}`} className="my-4 group relative inline-block max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt}
            onClick={() => setZoomImage({ url, alt })}
            className="rounded-lg border border-border max-w-full max-h-[450px] object-contain shadow-sm cursor-zoom-in hover:brightness-105 transition-all"
          />
          <button
            onClick={() => setZoomImage({ url, alt })}
            className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Expand Image"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          {alt && alt !== "Image" && alt !== "Note Image" && (
            <p className="text-xs text-muted-foreground text-center mt-1.5">{alt}</p>
          )}
        </div>
      );
      continue;
    }

    // Standard paragraph
    blocks.push(
      <p key={`p-${i}`} className="text-sm md:text-base leading-relaxed text-foreground/90 my-1.5">
        <InlineFormattedText text={line} />
      </p>
    );
  }

  // Flush remaining buffers
  flushCodeBlock('final');
  flushTable('final');
  flushBlockquote('final');

  return (
    <div className={`space-y-1 ${className}`}>
      {blocks}

      {/* Image Zoom Lightbox Dialog */}
      <Dialog open={!!zoomImage} onOpenChange={(open) => !open && setZoomImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-zinc-950/95 border-zinc-800">
          <DialogTitle className="sr-only">{zoomImage?.alt || "Image preview"}</DialogTitle>
          <div className="flex flex-col items-center justify-center p-2">
            {zoomImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={zoomImage.url}
                alt={zoomImage.alt}
                className="max-h-[80vh] w-auto object-contain rounded-md"
              />
            )}
            {zoomImage?.alt && (
              <p className="text-xs text-zinc-400 mt-2">{zoomImage.alt}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
