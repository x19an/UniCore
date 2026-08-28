import { Course, Note } from "@/lib/types";

export type { Course, Note };

export type NoteSortOption = 
  | 'lecture-asc' 
  | 'lecture-desc' 
  | 'date-desc' 
  | 'date-asc' 
  | 'title-asc';

export interface NoteFilterState {
  searchQuery: string;
  selectedTag: string | null;
  sortOption: NoteSortOption;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function formatNoteDate(dateStr?: string): string {
  if (!dateStr) return "No date";
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(monthIdx) && !isNaN(day) && monthIdx >= 0 && monthIdx < 12) {
        return `${MONTH_NAMES[monthIdx]} ${day}, ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getUTCFullYear();
      const monthIdx = d.getUTCMonth();
      const day = d.getUTCDate();
      return `${MONTH_NAMES[monthIdx]} ${day}, ${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
