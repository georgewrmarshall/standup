import { format } from 'date-fns';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  linkedPR?: string;
  linkedTicket?: string;
  createdAt: string;
  completedAt?: string;
}

interface TodoStore {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'completed' | 'createdAt'>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  loadTodos: () => void;
  saveTodos: () => void;
  exportToMarkdown: () => string;
}

// Simple in-memory store (in a real app, this would use Zustand or similar)
let todos: Todo[] = [];
let listeners: (() => void)[] = [];

const notify = () => {
  listeners.forEach(listener => listener());
};

export const useTodoStore = (): TodoStore => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    listeners.push(forceUpdate);
    return () => {
      listeners = listeners.filter(l => l !== forceUpdate);
    };
  }, []);

  return {
    todos,

    addTodo: (todoData) => {
      const newTodo: Todo = {
        ...todoData,
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      todos = [...todos, newTodo];
      notify();
      saveTodosToStorage();
    },

    toggleTodo: (id) => {
      todos = todos.map(todo => {
        if (todo.id === id) {
          return {
            ...todo,
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date().toISOString() : undefined,
          };
        }
        return todo;
      });
      notify();
      saveTodosToStorage();
    },

    deleteTodo: (id) => {
      todos = todos.filter(todo => todo.id !== id);
      notify();
      saveTodosToStorage();
    },

    updateTodo: (id, updates) => {
      todos = todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, ...updates };
        }
        return todo;
      });
      notify();
      saveTodosToStorage();
    },

    loadTodos: () => {
      const stored = localStorage.getItem('standup-todos');
      if (stored) {
        try {
          todos = JSON.parse(stored);
        } catch {
          todos = getDefaultTodos();
        }
      } else {
        todos = getDefaultTodos();
      }
      notify();
    },

    saveTodos: () => {
      saveTodosToStorage();
    },

    exportToMarkdown: () => {
      const date = format(new Date(), 'yyyy-MM-dd');
      const grouped = todos.reduce((acc, todo) => {
        if (!acc[todo.priority]) acc[todo.priority] = [];
        acc[todo.priority].push(todo);
        return acc;
      }, {} as Record<string, Todo[]>);

      let markdown = `# Daily Todos - ${date}\n\n`;

      const priorityLabels = {
        P0: 'Urgent/Blockers',
        P1: "Today's Goals",
        P2: 'This Week',
        P3: 'Backlog',
      };

      (['P0', 'P1', 'P2', 'P3'] as const).forEach(priority => {
        const todosInGroup = grouped[priority] || [];
        if (todosInGroup.length > 0) {
          markdown += `## ${priority} - ${priorityLabels[priority]}\n`;
          todosInGroup.forEach(todo => {
            const checkbox = todo.completed ? '[x]' : '[ ]';
            let line = `- ${checkbox} ${todo.text}`;
            if (todo.linkedPR) line += ` [PR: ${todo.linkedPR}]`;
            if (todo.linkedTicket) line += ` [${todo.linkedTicket}]`;
            markdown += line + '\n';
          });
          markdown += '\n';
        }
      });

      return markdown;
    },
  };
};

const saveTodosToStorage = () => {
  localStorage.setItem('standup-todos', JSON.stringify(todos));
};

const getDefaultTodos = (): Todo[] => {
  const now = new Date().toISOString();
  return [
    // Yesterday's completed items
    {
      id: '1',
      text: 'PR reviews',
      completed: true,
      priority: 'P1',
      createdAt: now,
      completedAt: now,
    },
    {
      id: '2',
      text: 'Initial migration doc to go over on Monday',
      completed: true,
      priority: 'P1',
      linkedPR: '#924',
      createdAt: now,
      completedAt: now,
    },
    {
      id: '3',
      text: 'Bug: Reverted fix for Mobile TextField placeholder alignment bug',
      completed: true,
      priority: 'P0',
      createdAt: now,
      completedAt: now,
    },
    {
      id: '4',
      text: 'Design system release',
      completed: true,
      priority: 'P0',
      linkedPR: '#921',
      createdAt: now,
      completedAt: now,
    },
    // Today's tasks
    {
      id: '5',
      text: 'PR reviews',
      completed: false,
      priority: 'P1',
      createdAt: now,
    },
    {
      id: '6',
      text: 'Header alignment sync with Brian',
      completed: false,
      priority: 'P1',
      createdAt: now,
    },
    {
      id: '7',
      text: 'Bug: Extension MM Poly font rendering',
      completed: false,
      priority: 'P0',
      createdAt: now,
    },
    {
      id: '8',
      text: 'Bug: Mobile Intermittent TextField placeholder alignment issue',
      completed: false,
      priority: 'P0',
      createdAt: now,
    },
    {
      id: '9',
      text: 'Bug: Mobile Header layout flickering',
      completed: false,
      priority: 'P0',
      createdAt: now,
    },
    {
      id: '10',
      text: 'Storybook remove stories failing CI test',
      completed: false,
      priority: 'P1',
      createdAt: now,
    },
    {
      id: '11',
      text: 'Component metrics',
      completed: false,
      priority: 'P2',
      createdAt: now,
    },
    {
      id: '12',
      text: 'Update mobile with new MMDS version',
      completed: false,
      priority: 'P1',
      createdAt: now,
    },
    {
      id: '13',
      text: 'Update extension with new MMDS version',
      completed: false,
      priority: 'P1',
      createdAt: now,
    },
    // Blockers
    {
      id: '14',
      text: 'ADRs for enum migration need final review',
      completed: false,
      priority: 'P0',
      linkedPR: 'decisions#127',
      createdAt: now,
    },
    {
      id: '15',
      text: 'ADRs for central types need final review',
      completed: false,
      priority: 'P0',
      linkedPR: 'decisions#128',
      createdAt: now,
    },
    // Backlog
    {
      id: '16',
      text: 'More storybook clean up',
      completed: false,
      priority: 'P3',
      createdAt: now,
    },
  ];
};

// Add React import for hooks
import React from 'react';