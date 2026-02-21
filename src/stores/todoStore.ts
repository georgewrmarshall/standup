import { format } from 'date-fns';
import React from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  generateStandup: () => Promise<void>;
  loadTodos: () => void;
  saveTodos: () => void;
}

// Simple in-memory store
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

    addTodo: (text) => {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
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

    generateStandup: async () => {
      const date = format(new Date(), 'yyyy-MM-dd');
      const displayDate = format(new Date(), 'MMMM d, yyyy');

      const completed = todos.filter(todo => todo.completed);
      const notCompleted = todos.filter(todo => !todo.completed);

      let markdown = `# Standup - ${displayDate}\n\n`;

      if (completed.length > 0) {
        markdown += `## Completed ✅\n`;
        completed.forEach(todo => {
          markdown += `- ${todo.text}\n`;
        });
        markdown += '\n';
      }

      if (notCompleted.length > 0) {
        markdown += `## Not Completed ❌\n`;
        notCompleted.forEach(todo => {
          markdown += `- ${todo.text}\n`;
        });
        markdown += '\n';
      }

      // Download the markdown file
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${date}.md`;
      a.click();
      URL.revokeObjectURL(url);

      // Remove completed todos
      todos = notCompleted;
      notify();
      saveTodosToStorage();
    },

    loadTodos: () => {
      const stored = localStorage.getItem('standup-todos');
      if (stored) {
        try {
          todos = JSON.parse(stored);
        } catch {
          todos = [];
        }
      }
      notify();
    },

    saveTodos: () => {
      saveTodosToStorage();
    },
  };
};

const saveTodosToStorage = () => {
  localStorage.setItem('standup-todos', JSON.stringify(todos));
};
