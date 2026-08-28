import { Todo } from './types';
import { addDays, subDays } from 'date-fns';

export const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Finish Math Assignment',
    description: 'Complete exercises 1-10 on page 42.',
    dueDate: subDays(new Date(), 1), // Overdue
    tags: ['Homework'],
    course: 'Mathematics',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: '2',
    title: 'Read Physics Chapter 4',
    description: 'Focus on the thermodynamics section.',
    dueDate: new Date(), // Today
    tags: ['Reading'],
    course: 'Physics',
    isCompleted: false,
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Write History Essay',
    description: 'Draft the 5-page essay on the Industrial Revolution.',
    dueDate: addDays(new Date(), 3),
    tags: ['Essay', 'Draft'],
    course: 'History',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: '4',
    title: 'Buy Groceries',
    description: 'Milk, Eggs, Bread, and Coffee.',
    tags: ['Personal'],
    isCompleted: true,
    completedAt: new Date(), // Completed today, should still be visible
    priority: 'low',
  },
  {
    id: '5',
    title: 'Prepare for Chemistry Lab',
    dueDate: addDays(new Date(), 5),
    tags: ['Lab', 'Prep'],
    course: 'Chemistry',
    isCompleted: false,
    priority: 'medium',
  },
  {
    id: '6',
    title: 'Old Task',
    description: 'This was completed a long time ago and should be hidden.',
    tags: ['Misc'],
    isCompleted: true,
    completedAt: subDays(new Date(), 2), // Completed 2 days ago, should be filtered out
    priority: 'low',
  }
];
