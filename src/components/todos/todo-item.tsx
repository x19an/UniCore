import { Todo, Priority } from './types';
import { format, isBefore, isToday, startOfDay, isValid } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Calendar, Tag, Book, Trash2, Edit } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  medium: {
    label: 'Medium',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  high: {
    label: 'High',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
};

export function TodoItem({ todo, onToggleComplete, onDelete, onEdit }: TodoItemProps) {
  const rawDate = todo.dueDate ? new Date(todo.dueDate) : undefined;
  const isDateValid = rawDate ? isValid(rawDate) : false;
  const dueDate = isDateValid ? rawDate : undefined;

  const today = startOfDay(new Date());
  const isOverdue = dueDate && !todo.isCompleted && isBefore(startOfDay(dueDate), today);
  const isDueToday = dueDate && !todo.isCompleted && isToday(dueDate);

  const priorityInfo = todo.priority ? priorityConfig[todo.priority] : undefined;

  return (
    <div className={cn(
      "group flex items-start gap-3 rounded-lg border p-4 transition-all hover:shadow-md",
      todo.isCompleted ? "bg-muted/40 opacity-75 border-border/50" : "bg-card border-border",
      isOverdue && !todo.isCompleted ? "border-destructive/60 bg-destructive/5 shadow-xs" : ""
    )}>
      <div className="pt-0.5">
        <Checkbox 
          checked={todo.isCompleted} 
          onCheckedChange={() => onToggleComplete(todo.id)}
          aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
        />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1.5 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn(
            "font-medium text-sm sm:text-base truncate transition-colors",
            todo.isCompleted && "line-through text-muted-foreground"
          )}>
            {todo.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {isOverdue && (
              <Badge variant="destructive" className="text-[11px] font-semibold px-2 py-0.5">
                Overdue
              </Badge>
            )}
            {isDueToday && (
              <Badge variant="secondary" className="text-[11px] bg-primary/10 text-primary border-primary/20 px-2 py-0.5">
                Due Today
              </Badge>
            )}
            {priorityInfo && (
              <Badge variant="outline" className={cn("text-[11px] font-medium px-2 py-0.5", priorityInfo.className)}>
                {priorityInfo.label}
              </Badge>
            )}
          </div>
        </div>
        
        {todo.description && (
          <p className={cn(
            "text-xs sm:text-sm text-muted-foreground line-clamp-2",
            todo.isCompleted && "line-through opacity-70"
          )}>
            {todo.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
          {dueDate && (
            <div className={cn(
              "flex items-center gap-1", 
              isOverdue ? "text-destructive font-medium" : isDueToday ? "text-primary font-medium" : ""
            )}>
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(dueDate, 'MMM d, yyyy')}</span>
            </div>
          )}
          
          {todo.course && (
            <div className="flex items-center gap-1 text-foreground/80 font-medium">
              <Book className="h-3.5 w-3.5 text-primary/70" />
              <span className="truncate max-w-[160px]">{todo.course}</span>
            </div>
          )}
          
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="h-3.5 w-3.5 opacity-60" />
              <div className="flex flex-wrap gap-1">
                {todo.tags.map(tag => (
                  <span key={tag} className="bg-secondary/70 text-secondary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-sm border border-border/50">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              aria-label="Actions"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          } />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(todo)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(todo.id)} 
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
