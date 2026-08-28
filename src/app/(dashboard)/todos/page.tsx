'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCheck, 
  X, 
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { TodoList } from '@/components/todos/todo-list';
import { TodoForm } from '@/components/todos/todo-form';
import { Todo, Priority } from '@/components/todos/types';
import { useGlobalStore } from '@/lib/global-store';
import { isBefore, startOfDay, isValid } from 'date-fns';

type FilterTab = 'all' | 'active' | 'overdue' | 'completed';
type SortOption = 'dueDateAsc' | 'dueDateDesc' | 'priority' | 'title';

const priorityOrder: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const emptySubscribe = () => () => {};

export default function TodosPage() {
  const { todos, addTodo, updateTodo, deleteTodo, courses, isLoaded } = useGlobalStore();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<Todo | undefined>();

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dueDateAsc');

  const handleAddOrUpdate = (todoData: Omit<Todo, 'id' | 'isCompleted'> & { id?: string }) => {
    if (todoData.id) {
      const existing = todos.find(t => t.id === todoData.id);
      if (existing) {
        updateTodo({ ...existing, ...todoData });
      }
    } else {
      addTodo({
        ...todoData,
        isCompleted: false,
      });
    }
  };

  const handleToggleComplete = (id: string) => {
    const existing = todos.find(t => t.id === id);
    if (existing) {
      const nextCompleted = !existing.isCompleted;
      updateTodo({ 
        ...existing, 
        isCompleted: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : undefined
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteTodo(id);
  };

  const handleEdit = (todo: Todo) => {
    setTodoToEdit(todo);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setTodoToEdit(undefined);
    setIsFormOpen(true);
  };

  const handleResetFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setSelectedCourse('all');
    setSelectedPriority('all');
    setSortBy('dueDateAsc');
  };

  // Base list of non-deleted todos
  const nonDeletedTodos = useMemo(() => {
    return todos.filter(t => !t.isDeleted);
  }, [todos]);

  // Distinct courses available across tasks and courses table
  const availableCourses = useMemo(() => {
    const courseSet = new Set<string>();
    courses.filter(c => !c.isDeleted).forEach(c => {
      if (c.code) courseSet.add(c.code);
      courseSet.add(c.name);
    });
    nonDeletedTodos.forEach(t => {
      if (t.course) courseSet.add(t.course);
    });
    return Array.from(courseSet).sort();
  }, [courses, nonDeletedTodos]);

  // Statistics calculation
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const total = nonDeletedTodos.length;
    const completed = nonDeletedTodos.filter(t => t.isCompleted).length;
    const active = nonDeletedTodos.filter(t => !t.isCompleted).length;
    const overdue = nonDeletedTodos.filter(t => {
      if (t.isCompleted || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      return isValid(d) && isBefore(startOfDay(d), today);
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, overdue, completionRate };
  }, [nonDeletedTodos]);

  // Filtered & Sorted todos
  const displayedTodos = useMemo(() => {
    const today = startOfDay(new Date());
    const q = searchQuery.toLowerCase().trim();

    return nonDeletedTodos.filter(t => {
      // 1. Tab filter
      if (activeTab === 'active' && t.isCompleted) return false;
      if (activeTab === 'completed' && !t.isCompleted) return false;
      if (activeTab === 'overdue') {
        if (t.isCompleted || !t.dueDate) return false;
        const d = new Date(t.dueDate);
        if (!isValid(d) || !isBefore(startOfDay(d), today)) return false;
      }

      // 2. Course filter
      if (selectedCourse !== 'all') {
        if (!t.course || t.course !== selectedCourse) return false;
      }

      // 3. Priority filter
      if (selectedPriority !== 'all') {
        if (t.priority !== selectedPriority) return false;
      }

      // 4. Search query
      if (q) {
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description ? t.description.toLowerCase().includes(q) : false;
        const matchesCourse = t.course ? t.course.toLowerCase().includes(q) : false;
        const matchesTags = t.tags ? t.tags.some(tag => tag.toLowerCase().includes(q)) : false;
        if (!matchesTitle && !matchesDesc && !matchesCourse && !matchesTags) return false;
      }

      return true;
    }).sort((a, b) => {
      // Active tasks always come before completed in "all" view
      if (activeTab === 'all') {
        if (a.isCompleted && !b.isCompleted) return 1;
        if (!a.isCompleted && b.isCompleted) return -1;
      }

      if (sortBy === 'priority') {
        const aPri = a.priority ? priorityOrder[a.priority] : 0;
        const bPri = b.priority ? priorityOrder[b.priority] : 0;
        if (bPri !== aPri) return bPri - aPri;
      }

      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === 'dueDateDesc') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }

      // Default: dueDateAsc
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [nonDeletedTodos, activeTab, selectedCourse, selectedPriority, searchQuery, sortBy]);

  const hasActiveFilters = searchQuery !== '' || selectedCourse !== 'all' || selectedPriority !== 'all' || activeTab !== 'all';

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Todos</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Organize coursework, track deadlines, and conquer your semester.
          </p>
        </div>
        <Button onClick={openAddForm} className="shadow-xs self-start sm:self-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {!mounted || !isLoaded ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Card className="bg-card/60 backdrop-blur-xs border-border shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold mt-0.5">{stats.active}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className={`backdrop-blur-xs border shadow-xs transition-colors ${stats.overdue > 0 ? 'bg-destructive/10 border-destructive/30' : 'bg-card/60 border-border'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Overdue</p>
                  <p className={`text-2xl font-bold mt-0.5 ${stats.overdue > 0 ? 'text-destructive' : ''}`}>{stats.overdue}</p>
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stats.overdue > 0 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-xs border-border shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold mt-0.5 text-emerald-500">{stats.completed}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-xs border-border shadow-xs">
              <CardContent className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Completion Rate</p>
                  <span className="text-xs font-semibold text-primary">{stats.completionRate}%</span>
                </div>
                <div className="mt-2">
                  <Progress value={stats.completionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs & Search Controls */}
          <div className="space-y-3 pt-2">
            {/* Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'all' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  All ({stats.total})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'active' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Active ({stats.active})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overdue')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'overdue' ? 'bg-background text-destructive shadow-xs' : 'text-muted-foreground hover:text-destructive'}`}
                >
                  Overdue
                  {stats.overdue > 0 && (
                    <Badge variant="destructive" className="h-4 px-1 text-[10px] leading-none">
                      {stats.overdue}
                    </Badge>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'completed' ? 'bg-background text-emerald-500 shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Completed ({stats.completed})
                </button>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> Sort:
                </span>
                <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                  <SelectTrigger className="h-8 text-xs w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="dueDateAsc">Due Date (Earliest)</SelectItem>
                    <SelectItem value="dueDateDesc">Due Date (Latest)</SelectItem>
                    <SelectItem value="priority">Priority (High to Low)</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter row: Search, Course dropdown, Priority dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Search tasks by title, course, tags, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Course filter */}
              {availableCourses.length > 0 && (
                <Select value={selectedCourse} onValueChange={(val: string | null) => setSelectedCourse(val || "all")}>
                  <SelectTrigger className="h-9 text-xs sm:w-[160px]">
                    <span className="truncate flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />
                      {selectedCourse === 'all' ? 'All Courses' : selectedCourse}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {availableCourses.map(courseName => (
                      <SelectItem key={courseName} value={courseName}>
                        {courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Priority filter */}
              <Select value={selectedPriority} onValueChange={(val: string | null) => setSelectedPriority((val || "all") as Priority | 'all')}>
                <SelectTrigger className="h-9 text-xs sm:w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="h-9 text-xs px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Todo List */}
          <div className="pt-2">
            <TodoList 
              todos={displayedTodos}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onAddNew={openAddForm}
              filterLabel={hasActiveFilters ? 'matching' : undefined}
              onResetFilter={hasActiveFilters ? handleResetFilters : undefined}
            />
          </div>
        </>
      )}

      {/* Todo Form Modal */}
      <TodoForm 
        open={isFormOpen}
        setOpen={setIsFormOpen}
        initialData={todoToEdit}
        onSave={handleAddOrUpdate}
        onCancel={() => setTodoToEdit(undefined)}
      />
    </div>
  );
}
