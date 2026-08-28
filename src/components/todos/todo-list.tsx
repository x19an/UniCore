import { Todo } from './types';
import { TodoItem } from './todo-item';
import { CheckCircle2, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onAddNew?: () => void;
  filterLabel?: string;
  onResetFilter?: () => void;
}

export function TodoList({ 
  todos, 
  onToggleComplete, 
  onDelete, 
  onEdit,
  onAddNew,
  filterLabel,
  onResetFilter 
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl border-dashed border-border bg-card/40 backdrop-blur-xs">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {filterLabel ? `No ${filterLabel} tasks found` : 'No tasks found'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {filterLabel 
            ? 'Try changing your filter or search query to see other tasks.' 
            : 'You are all caught up! Create a new task to stay on top of your coursework and deadlines.'}
        </p>
        <div className="mt-5 flex items-center gap-3">
          {filterLabel && onResetFilter && (
            <Button variant="outline" size="sm" onClick={onResetFilter}>
              <ListFilter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          )}
          {onAddNew && (
            <Button size="sm" onClick={onAddNew}>
              Add Task
            </Button>
          )}
        </div>
      </div>
    );
  }

  const activeTodos = todos.filter(t => !t.isCompleted);
  const completedTodos = todos.filter(t => t.isCompleted);

  // If list contains both active and completed, show them organized
  if (activeTodos.length > 0 && completedTodos.length > 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              To Do ({activeTodos.length})
            </span>
          </div>
          <div className="space-y-2.5">
            {activeTodos.map(todo => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Completed ({completedTodos.length})
            </span>
          </div>
          <div className="space-y-2.5">
            {completedTodos.map(todo => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
