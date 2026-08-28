"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Goal } from "@/components/goals/types";
import { Todo } from "@/components/todos/types";
import { Activity } from "@/components/streaks/mock-data";
import { Note, Course, Session } from "@/lib/types";
import { MOCK_GOALS } from "@/components/goals/mock-goals";
import { MOCK_COURSES, MOCK_NOTES } from "@/lib/mock-notes";
import { createClient } from "@/utils/supabase/client";

type GlobalStoreContextType = {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id'>) => Promise<void>;
  updateTodo: (todo: Todo) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;

  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;
  updateActivity: (activity: Activity) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  batchUpdateActivities: (activities: Activity[]) => Promise<void>;

  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | undefined>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => Promise<Course | undefined>;
  updateCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  sessions: Session[];
  addSession: (session: Omit<Session, 'id'>) => Promise<void>;
  updateSession: (session: Session) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  deleteAllSessions: () => Promise<void>;
  batchAddSessions: (sessions: Omit<Session, 'id'>[]) => Promise<void>;

  restoreItem: (type: 'goal' | 'todo' | 'activity' | 'note' | 'course' | 'session', id: string) => Promise<void>;
  permanentlyDeleteItem: (type: 'goal' | 'todo' | 'activity' | 'note' | 'course' | 'session', id: string) => Promise<void>;
  isLoaded: boolean;
};

export const GlobalStoreContext = createContext<GlobalStoreContextType | null>(null);

export const useGlobalStore = () => {
  const ctx = useContext(GlobalStoreContext);
  if (!ctx) throw new Error("useGlobalStore must be used within GlobalStoreProvider");
  return ctx;
};

export const GlobalStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user || userError) {
          if (isSubscribed) setIsLoaded(true);
          return;
        }

        const [
          { data: todosData },
          { data: goalsData },
          { data: activitiesData },
          { data: notesData },
          { data: coursesData },
          { data: sessionsData },
        ] = await Promise.all([
          supabase.from('todos').select('*').eq('user_id', user.id),
          supabase.from('goals').select('*').eq('user_id', user.id),
          supabase.from('activities').select('*').eq('user_id', user.id),
          supabase.from('notes').select('*').eq('user_id', user.id),
          supabase.from('courses').select('*').eq('user_id', user.id),
          supabase.from('sessions').select('*').eq('user_id', user.id),
        ]);

        if (isSubscribed) {
          if (todosData && todosData.length > 0) setTodos(todosData);
          if (goalsData && goalsData.length > 0) setGoals(goalsData);
          if (activitiesData && activitiesData.length > 0) setActivities(activitiesData);
          if (notesData && notesData.length > 0) {
            // Sanitize tags to always be array
            const sanitizedNotes = notesData.map((n: Note) => ({
              ...n,
              tags: Array.isArray(n.tags) ? n.tags : [],
            }));
            setNotes(sanitizedNotes);
          }
          if (coursesData && coursesData.length > 0) setCourses(coursesData);
          if (sessionsData && sessionsData.length > 0) {
            setSessions(sessionsData.map((s: Session) => ({ 
              ...s, 
              date: s.date.includes('T') ? s.date.split('T')[0] : s.date 
            })));
          }
        }
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
      } finally {
        if (isSubscribed) setIsLoaded(true);
      }
    };

    fetchData();
    return () => {
      isSubscribed = false;
    };
  }, [supabase]);

  // Goals
  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    const tempId = crypto.randomUUID();
    const optimisticGoal: Goal = { ...goal, id: tempId };
    setGoals(prev => [...prev, optimisticGoal]);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('goals').insert({ ...goal, user_id: user.id }).select().single();
      if (data) {
        setGoals(prev => prev.map(g => g.id === tempId ? data : g));
      }
    } catch (err) {
      console.error("Error inserting goal:", err);
    }
  };

  const updateGoal = async (goal: Goal) => {
    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const dbPayload = {
        title: goal.title,
        description: goal.description || null,
        targetDate: goal.targetDate || null,
        status: goal.status,
        type: goal.type,
        checkIns: goal.checkIns || [],
        isDeleted: goal.isDeleted ?? false,
        deletedAt: goal.deletedAt || null,
      };
      await supabase.from('goals').update(dbPayload).eq('id', goal.id);
    } catch (err) {
      console.error("Error updating goal:", err);
    }
  };

  const deleteGoal = async (id: string) => {
    const deletedAt = new Date().toISOString();
    setGoals(prev => prev.map(g => g.id === id ? { ...g, isDeleted: true, deletedAt } : g));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('goals').update({ isDeleted: true, deletedAt }).eq('id', id);
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  // Todos
  const addTodo = async (todo: Omit<Todo, 'id'>) => {
    const tempId = crypto.randomUUID();
    const optimisticTodo: Todo = { ...todo, id: tempId };
    setTodos(prev => [optimisticTodo, ...prev]);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const dbPayload = {
        title: todo.title,
        description: todo.description || null,
        dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString() : null,
        tags: todo.tags || [],
        course: todo.course || null,
        isCompleted: todo.isCompleted ?? false,
        completedAt: todo.completedAt ? new Date(todo.completedAt).toISOString() : null,
        priority: todo.priority || 'medium',
        isDeleted: false,
        deletedAt: null,
        user_id: user.id,
      };
      const { data, error } = await supabase.from('todos').insert(dbPayload).select().single();
      if (error) {
        console.error("Error inserting todo to Supabase:", error);
      } else if (data) {
        setTodos(prev => prev.map(t => t.id === tempId ? data : t));
      }
    } catch (err) {
      console.error("Error inserting todo:", err);
    }
  };

  const updateTodo = async (todo: Todo) => {
    setTodos(prev => prev.map(t => t.id === todo.id ? todo : t));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const dbPayload = {
        title: todo.title,
        description: todo.description || null,
        dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString() : null,
        tags: todo.tags || [],
        course: todo.course || null,
        isCompleted: todo.isCompleted ?? false,
        completedAt: todo.completedAt ? new Date(todo.completedAt).toISOString() : null,
        priority: todo.priority || 'medium',
        isDeleted: todo.isDeleted ?? false,
        deletedAt: todo.deletedAt ? new Date(todo.deletedAt).toISOString() : null,
      };
      const { error } = await supabase.from('todos').update(dbPayload).eq('id', todo.id);
      if (error) {
        console.error("Error updating todo in Supabase:", error);
      }
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  const deleteTodo = async (id: string) => {
    const deletedAt = new Date().toISOString();
    setTodos(prev => prev.map(t => t.id === id ? { ...t, isDeleted: true, deletedAt } : t));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('todos').update({ isDeleted: true, deletedAt }).eq('id', id);
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  // Activities
  const addActivity = async (activity: Omit<Activity, 'id'>) => {
    const tempId = crypto.randomUUID();
    const optimisticActivity: Activity = { ...activity, id: tempId };
    setActivities(prev => [...prev, optimisticActivity]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('activities').insert({ ...activity, user_id: user.id }).select().single();
      if (data) {
        setActivities(prev => prev.map(a => a.id === tempId ? data : a));
      }
    } catch (err) {
      console.error("Error inserting activity:", err);
    }
  };

  const updateActivity = async (activity: Activity) => {
    setActivities(prev => prev.map(a => a.id === activity.id ? activity : a));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('activities').update(activity).eq('id', activity.id);
    } catch (err) {
      console.error("Error updating activity:", err);
    }
  };

  const deleteActivity = async (id: string) => {
    const deletedAt = new Date().toISOString();
    setActivities(prev => prev.map(a => a.id === id ? { ...a, isDeleted: true, deletedAt } : a));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('activities').update({ isDeleted: true, deletedAt }).eq('id', id);
    } catch (err) {
      console.error("Error deleting activity:", err);
    }
  };

  const batchUpdateActivities = async (updates: Activity[]) => {
    setActivities(prev => {
      const map = new Map(updates.map(u => [u.id, u]));
      return prev.map(a => map.has(a.id) ? map.get(a.id)! : a);
    });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await Promise.all(updates.map(act => supabase.from('activities').update(act).eq('id', act.id)));
    } catch (err) {
      console.error("Error batch updating activities:", err);
    }
  };

  // Notes
  const addNote = async (note: Omit<Note, 'id'>): Promise<Note | undefined> => {
    const tempId = crypto.randomUUID();
    const newNote: Note = {
      ...note,
      id: tempId,
      tags: Array.isArray(note.tags) ? note.tags : [],
    };
    setNotes(prev => [newNote, ...prev]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('notes')
          .insert({
            id: tempId,
            courseId: note.courseId,
            courseName: note.courseName,
            title: note.title,
            date: note.date,
            lectureNumber: note.lectureNumber,
            content: note.content,
            tags: Array.isArray(note.tags) ? note.tags : [],
            user_id: user.id
          })
          .select()
          .single();

        if (data && !error) {
          const formatted: Note = {
            ...data,
            tags: Array.isArray(data.tags) ? data.tags : [],
          };
          setNotes(prev => prev.map(n => n.id === tempId ? formatted : n));
          return formatted;
        }
      }
    } catch (err) {
      console.error("Error adding note to Supabase (using local state):", err);
    }
    return newNote;
  };

  const updateNote = async (note: Note) => {
    const sanitizedNote: Note = {
      ...note,
      tags: Array.isArray(note.tags) ? note.tags : [],
    };
    setNotes(prev => prev.map(n => n.id === note.id ? sanitizedNote : n));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('notes')
          .update({
            courseId: note.courseId,
            courseName: note.courseName,
            title: note.title,
            date: note.date,
            lectureNumber: note.lectureNumber,
            content: note.content,
            tags: sanitizedNote.tags,
            isDeleted: note.isDeleted ?? false,
            deletedAt: note.deletedAt ?? null,
          })
          .eq('id', note.id);
      }
    } catch (err) {
      console.error("Error updating note in Supabase:", err);
    }
  };

  const deleteNote = async (id: string) => {
    const deletedAt = new Date().toISOString();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isDeleted: true, deletedAt } : n));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('notes').update({ isDeleted: true, deletedAt }).eq('id', id);
      }
    } catch (err) {
      console.error("Error deleting note in Supabase:", err);
    }
  };

  // Courses
  const addCourse = async (course: Omit<Course, 'id'>): Promise<Course | undefined> => {
    const tempId = crypto.randomUUID();
    const newCourse: Course = {
      ...course,
      id: tempId,
    };
    setCourses(prev => [...prev, newCourse]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('courses')
          .insert({
            id: tempId,
            name: course.name,
            code: course.code || null,
            days: course.days || [],
            creditHours: course.creditHours ?? 3,
            requiredAttendance: course.requiredAttendance ?? 75,
            isDeleted: false,
            deletedAt: null,
            user_id: user.id
          })
          .select()
          .single();
        if (data && !error) {
          setCourses(prev => prev.map(c => c.id === tempId ? data : c));
          return data;
        }
      }
    } catch (err) {
      console.error("Error adding course to Supabase:", err);
    }
    return newCourse;
  };

  const updateCourse = async (course: Course) => {
    setCourses(prev => prev.map(c => c.id === course.id ? course : c));
    setNotes(prev => prev.map(n => n.courseId === course.id ? { ...n, courseName: course.name } : n));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('courses')
          .update({
            name: course.name,
            code: course.code || null,
            days: course.days || [],
            creditHours: course.creditHours ?? 3,
            requiredAttendance: course.requiredAttendance ?? 75,
            isDeleted: course.isDeleted ?? false,
            deletedAt: course.deletedAt ?? null,
          })
          .eq('id', course.id);
        await supabase.from('notes').update({ courseName: course.name }).eq('courseId', course.id);
      }
    } catch (err) {
      console.error("Error updating course in Supabase:", err);
    }
  };

  const deleteCourse = async (id: string) => {
    const deletedAt = new Date().toISOString();
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isDeleted: true, deletedAt } : c));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('courses').update({ isDeleted: true, deletedAt }).eq('id', id);
      }
    } catch (err) {
      console.error("Error deleting course in Supabase:", err);
    }
  };

  // Sessions
  const addSession = async (session: Omit<Session, 'id'>) => {
    const tempId = crypto.randomUUID();
    const optimisticSession: Session = { ...session, id: tempId };
    setSessions(prev => [optimisticSession, ...prev]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('sessions').insert({ ...session, user_id: user.id }).select().single();
      if (data) {
        setSessions(prev => prev.map(s => s.id === tempId ? { 
          ...data, 
          date: data.date.includes('T') ? data.date.split('T')[0] : data.date 
        } : s));
      }
    } catch (err) {
      console.error("Error adding session:", err);
    }
  };

  const updateSession = async (session: Session) => {
    setSessions(prev => prev.map(s => s.id === session.id ? session : s));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('sessions').update(session).eq('id', session.id);
    } catch (err) {
      console.error("Error updating session:", err);
    }
  };

  const deleteSession = async (id: string) => {
    const deletedAt = new Date().toISOString();
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isDeleted: true, deletedAt } : s));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('sessions').update({ isDeleted: true, deletedAt }).eq('id', id);
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const deleteAllSessions = async () => {
    const deletedAt = new Date().toISOString();
    setSessions(prev => prev.map(s => ({ ...s, isDeleted: true, deletedAt })));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('sessions').update({ isDeleted: true, deletedAt }).eq('user_id', user.id).is('isDeleted', null);
      await supabase.from('sessions').update({ isDeleted: true, deletedAt }).eq('user_id', user.id).eq('isDeleted', false);
    } catch (err) {
      console.error("Error deleting all sessions:", err);
    }
  };

  const batchAddSessions = async (newSessions: Omit<Session, 'id'>[]) => {
    if (newSessions.length === 0) return;
    const optimistic = newSessions.map(s => ({ ...s, id: crypto.randomUUID() }));
    setSessions(prev => [...prev, ...optimistic]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const withUser = newSessions.map(s => ({ ...s, user_id: user.id }));
      const { data } = await supabase.from('sessions').insert(withUser).select();
      if (data) {
        setSessions(prev => {
          const nonOptimistic = prev.filter(s => !optimistic.some(o => o.id === s.id));
          return [...nonOptimistic, ...data.map((d: any) => ({
            ...d,
            date: d.date.includes('T') ? d.date.split('T')[0] : d.date
          }))];
        });
      }
    } catch (err) {
      console.error("Error batch adding sessions:", err);
    }
  };

  // Recycle bin
  const restoreItem = async (type: 'goal' | 'todo' | 'activity' | 'note' | 'course' | 'session', id: string) => {
    if (type === 'goal') {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, isDeleted: false, deletedAt: undefined } : g));
    } else if (type === 'todo') {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, isDeleted: false, deletedAt: undefined } : t));
    } else if (type === 'activity') {
      setActivities(prev => prev.map(a => a.id === id ? { ...a, isDeleted: false, deletedAt: undefined } : a));
    } else if (type === 'note') {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, isDeleted: false, deletedAt: undefined } : n));
    } else if (type === 'course') {
      setCourses(prev => prev.map(c => c.id === id ? { ...c, isDeleted: false, deletedAt: undefined } : c));
    } else if (type === 'session') {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, isDeleted: false, deletedAt: undefined } : s));
    }

    try {
      const table = type === 'activity' ? 'activities' : `${type}s`;
      await supabase.from(table).update({ isDeleted: false, deletedAt: null }).eq('id', id);
    } catch (err) {
      console.error("Error restoring item in Supabase:", err);
    }
  };

  const permanentlyDeleteItem = async (type: 'goal' | 'todo' | 'activity' | 'note' | 'course' | 'session', id: string) => {
    if (type === 'goal') {
      setGoals(prev => prev.filter(g => g.id !== id));
    } else if (type === 'todo') {
      setTodos(prev => prev.filter(t => t.id !== id));
    } else if (type === 'activity') {
      setActivities(prev => prev.filter(a => a.id !== id));
    } else if (type === 'note') {
      setNotes(prev => prev.filter(n => n.id !== id));
    } else if (type === 'course') {
      setCourses(prev => prev.filter(c => c.id !== id));
    } else if (type === 'session') {
      setSessions(prev => prev.filter(s => s.id !== id));
    }

    try {
      const table = type === 'activity' ? 'activities' : `${type}s`;
      await supabase.from(table).delete().eq('id', id);
    } catch (err) {
      console.error("Error permanently deleting item in Supabase:", err);
    }
  };

  return (
    <GlobalStoreContext.Provider value={{
      goals, addGoal, updateGoal, deleteGoal,
      todos, addTodo, updateTodo, deleteTodo,
      activities, addActivity, updateActivity, deleteActivity, batchUpdateActivities,
      notes, addNote, updateNote, deleteNote,
      courses, addCourse, updateCourse, deleteCourse,
      sessions, addSession, updateSession, deleteSession, deleteAllSessions, batchAddSessions,
      restoreItem, permanentlyDeleteItem, isLoaded
    }}>
      {children}
    </GlobalStoreContext.Provider>
  );
};

