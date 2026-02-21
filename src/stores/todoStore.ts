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
  generateStandupMarkdown: () => string;
  saveStandupToFile: (markdown: string) => void;
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

    generateStandupMarkdown: () => {
      const displayDate = format(new Date(), 'MMMM d, yyyy');

      const completed = todos.filter(todo => todo.completed);
      const notCompleted = todos.filter(todo => !todo.completed);

      let markdown = `_${displayDate}_\n\n`;

      // Yesterday section
      markdown += `Yesterday\n\n`;
      if (completed.length > 0) {
        completed.forEach(todo => {
          markdown += `- ${todo.text} ✅\n`;
        });
      }
      if (notCompleted.length > 0) {
        notCompleted.forEach(todo => {
          markdown += `- ${todo.text} ❌\n`;
        });
      }
      if (completed.length === 0 && notCompleted.length === 0) {
        markdown += `- No tasks\n`;
      }
      markdown += '\n';

      // Today section
      markdown += `Today\n\n`;
      if (notCompleted.length > 0) {
        notCompleted.forEach(todo => {
          markdown += `- ${todo.text}\n`;
        });
      } else {
        markdown += `- No tasks planned\n`;
      }
      markdown += '\n';

      // Blockers section
      markdown += `Blockers\n\n`;
      markdown += `- None\n\n`;

      // Backlog section
      markdown += `Backlog\n\n`;
      markdown += `- \n`;

      return markdown;
    },

    saveStandupToFile: (markdown: string) => {
      const date = format(new Date(), 'yyyy-MM-dd');
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${date}.md`;
      a.click();
      URL.revokeObjectURL(url);

      // Remove completed todos, keep incomplete for today
      const notCompleted = todos.filter(todo => !todo.completed);
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
      } else {
        // If no stored todos, try to load from latest standup markdown
        loadTodosFromLatestStandup();
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

const loadTodosFromLatestStandup = async () => {
  try {
    // Try to fetch the latest standup file
    // Get today's date and yesterday's date
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

    // Try to load today's standup first, then yesterday's
    for (const date of [today, yesterday]) {
      try {
        const response = await fetch(`/standups/${date}.md`);
        if (response.ok) {
          const markdown = await response.text();

          // Parse the "Today" section
          const todayMatch = markdown.match(/Today\n\n([\s\S]*?)(?=\n\n[A-Z]|$)/);
          if (todayMatch) {
            const todayTasks = todayMatch[1]
              .split('\n')
              .filter(line => line.trim().startsWith('-'))
              .map(line => line.replace(/^-\s*/, '').trim());

            // Convert to todos
            todos = todayTasks.map((text, index) => ({
              id: Date.now().toString() + index,
              text,
              completed: false,
              createdAt: new Date().toISOString(),
            }));

            saveTodosToStorage();
            return;
          }
        }
      } catch {
        // Continue to next date
        continue;
      }
    }
  } catch (error) {
    console.log('Could not load from standup files, starting fresh');
  }
};
