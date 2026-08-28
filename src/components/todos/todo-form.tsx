'use client';

import { useState } from 'react';
import { Todo, Priority } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { format, addDays, isValid } from 'date-fns';
import { Calendar as CalendarIcon, X, Sparkles } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGlobalStore } from '@/lib/global-store';

interface TodoFormProps {
  initialData?: Todo;
  onSave: (todo: Omit<Todo, 'id' | 'isCompleted'> & { id?: string }) => void;
  onCancel: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface TodoFormFieldsProps {
  initialData?: Todo;
  onSave: (todo: Omit<Todo, 'id' | 'isCompleted'> & { id?: string }) => void;
  onClose: () => void;
}

function TodoFormFields({ initialData, onSave, onClose }: TodoFormFieldsProps) {
  const { courses } = useGlobalStore();
  const rawDate = initialData?.dueDate ? new Date(initialData.dueDate) : undefined;
  const initialDueDate = rawDate && isValid(rawDate) ? rawDate : undefined;

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDueDate);
  const [tags, setTags] = useState<string>(initialData?.tags?.join(', ') || '');
  const [course, setCourse] = useState(initialData?.course || '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Deduplicate and trim tags
    const cleanTags = Array.from(
      new Set(
        tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      )
    );

    onSave({
      id: initialData?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      tags: cleanTags,
      course: course.trim() || undefined,
      priority,
    });
    onClose();
  };

  const isEditing = !!initialData;
  const activeCourses = courses.filter(c => !c.isDeleted);

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-2">
      {/* Title */}
      <div className="grid gap-1.5">
        <Label htmlFor="todo-title" className="text-xs font-semibold">Title *</Label>
        <Input 
          id="todo-title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="e.g. Complete Problem Set 3" 
          required
          autoFocus
        />
      </div>
      
      {/* Description */}
      <div className="grid gap-1.5">
        <Label htmlFor="todo-description" className="text-xs font-semibold">Description (optional)</Label>
        <Textarea 
          id="todo-description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Add any instructions, links, or notes..." 
          rows={3}
          className="resize-none"
        />
      </div>
      
      {/* Due Date & Quick presets */}
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Due Date</Label>
          {dueDate && (
            <button
              type="button"
              onClick={() => setDueDate(undefined)}
              className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" /> Clear date
            </button>
          )}
        </div>
        
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger render={
            <Button
              type="button"
              variant="outline"
              className={`w-full justify-start text-left font-normal ${!dueDate ? "text-muted-foreground" : ""}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a deadline (optional)</span>}
            </Button>
          } />
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-2 border-b flex items-center justify-between gap-2 bg-muted/20">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Quick set:
              </span>
              <div className="flex items-center gap-1">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="h-6 text-[11px] px-2"
                  onClick={() => {
                    setDueDate(new Date());
                    setIsCalendarOpen(false);
                  }}
                >
                  Today
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="h-6 text-[11px] px-2"
                  onClick={() => {
                    setDueDate(addDays(new Date(), 1));
                    setIsCalendarOpen(false);
                  }}
                >
                  Tomorrow
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="h-6 text-[11px] px-2"
                  onClick={() => {
                    setDueDate(addDays(new Date(), 7));
                    setIsCalendarOpen(false);
                  }}
                >
                  Next Week
                </Button>
              </div>
            </div>
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => {
                setDueDate(date);
                setIsCalendarOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Course & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="todo-course" className="text-xs font-semibold">Course</Label>
          <Input 
            id="todo-course" 
            list="registered-courses-list"
            value={course} 
            onChange={(e) => setCourse(e.target.value)} 
            placeholder="e.g. CS101" 
          />
          {activeCourses.length > 0 && (
            <datalist id="registered-courses-list">
              {activeCourses.map((c) => (
                <option key={c.id} value={c.code ? `${c.code} - ${c.name}` : c.name}>
                  {c.name}
                </option>
              ))}
            </datalist>
          )}
        </div>
        
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold">Priority</Label>
          <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
            <SelectTrigger id="todo-priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Low
                </span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Medium
                </span>
              </SelectItem>
              <SelectItem value="high">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  High
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div className="grid gap-1.5">
        <Label htmlFor="todo-tags" className="text-xs font-semibold">Tags</Label>
        <Input 
          id="todo-tags" 
          value={tags} 
          onChange={(e) => setTags(e.target.value)} 
          placeholder="e.g. Assignment, Midterm, Lab" 
        />
        <p className="text-[11px] text-muted-foreground">Separate multiple tags with commas.</p>
      </div>

      <DialogFooter className="mt-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Save Changes' : 'Create Task'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TodoForm({ initialData, onSave, onCancel, open, setOpen }: TodoFormProps) {
  const handleClose = (val: boolean) => {
    setOpen(val);
    if (!val) {
      onCancel();
    }
  };

  const isEditing = !!initialData;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your task details and deadline below.' 
              : 'Add a new deadline, assignment, or study task to stay organized.'}
          </DialogDescription>
        </DialogHeader>
        
        {open && (
          <TodoFormFields 
            key={initialData?.id || 'new-todo-form'}
            initialData={initialData}
            onSave={onSave}
            onClose={() => handleClose(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
