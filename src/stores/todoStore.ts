import { create } from 'zustand';
import { getTodayISO, getYesterdayISO, getDisplayDate } from '../utils/dates';
import { logError } from '../utils/errors';
import { parseGitHubUrl } from '../utils/urlParser';

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
  reorderTodos: (activeId: string, overId: string) => void;
  generateStandupMarkdown: () => string;
  saveStandupToFile: (markdown: string) => void;
  loadTodos: () => void;
  saveTodos: () => void;
  // Selectors
  getCompleted: () => Todo[];
  getIncomplete: () => Todo[];
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],

  // Selectors
  getCompleted: () => get().todos.filter(todo => todo.completed),
  getIncomplete: () => get().todos.filter(todo => !todo.completed),

  addTodo: (text) => {
    // Parse GitHub URLs and convert to markdown links
    const processedText = parseGitHubUrl(text);

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: processedText,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ todos: [...state.todos, newTodo] }));
    saveTodosToStorage(get().todos);
  },

  toggleTodo: (id) => {
    const updatedTodos = get().todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? new Date().toISOString() : undefined,
        };
      }
      return todo;
    });

    // Sort: incomplete items first, then completed items
    const sorted = [
      ...updatedTodos.filter(todo => !todo.completed),
      ...updatedTodos.filter(todo => todo.completed),
    ];

    set({ todos: sorted });
    saveTodosToStorage(sorted);
  },

  deleteTodo: (id) => {
    set((state) => ({ todos: state.todos.filter(todo => todo.id !== id) }));
    saveTodosToStorage(get().todos);
  },

  reorderTodos: (activeId, overId) => {
    const todos = get().todos;
    const oldIndex = todos.findIndex(todo => todo.id === activeId);
    const newIndex = todos.findIndex(todo => todo.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTodos = [...todos];
      const [removed] = newTodos.splice(oldIndex, 1);
      newTodos.splice(newIndex, 0, removed);
      set({ todos: newTodos });
      saveTodosToStorage(newTodos);
    }
  },

  generateStandupMarkdown: () => {
    const todos = get().todos;
    const displayDate = getDisplayDate();

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
    const date = getTodayISO();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${date}.md`;
    a.click();
    URL.revokeObjectURL(url);

    // Remove completed todos, keep incomplete for today
    const notCompleted = get().todos.filter(todo => !todo.completed);
    set({ todos: notCompleted });
    saveTodosToStorage(notCompleted);
  },

  loadTodos: () => {
    const stored = localStorage.getItem('standup-todos');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        set({ todos: parsed });
      } catch (error) {
        logError('loadTodos: Failed to parse localStorage data', error);
        set({ todos: [] });
      }
    } else {
      // If no stored todos, try to load from latest standup markdown
      loadTodosFromLatestStandup(set);
    }
  },

  saveTodos: () => {
    saveTodosToStorage(get().todos);
  },
}));

const saveTodosToStorage = (todos: Todo[]) => {
  localStorage.setItem('standup-todos', JSON.stringify(todos));
};

const loadTodosFromLatestStandup = async (set: (partial: Partial<TodoStore>) => void) => {
  try {
    // Try to fetch the latest standup file
    // Get today's date and yesterday's date
    const today = getTodayISO();
    const yesterday = getYesterdayISO();

    // Try to load today's standup first, then yesterday's
    for (const date of [today, yesterday]) {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}standups/${date}.md`);
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
            const todos: Todo[] = todayTasks.map((text) => ({
              id: crypto.randomUUID(),
              text,
              completed: false,
              createdAt: new Date().toISOString(),
            }));

            set({ todos });
            saveTodosToStorage(todos);
            return;
          }
        }
      } catch (error) {
        // Continue to next date - individual fetch failures are expected
        logError(`loadTodosFromLatestStandup: Failed to fetch/parse standup for ${date}`, error);
        continue;
      }
    }
  } catch (error) {
    logError('loadTodosFromLatestStandup: Unexpected error loading from standup files', error);
  }
};
