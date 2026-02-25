import { create } from 'zustand';
import { getTodayISO, getYesterdayISO, getDisplayDate } from '../utils/dates';
import { logError } from '../utils/errors';
import { parseGitHubUrl } from '../utils/urlParser';
import { fetchLatestStandup, parseStandupFile, type ParsedStandup } from '../utils/standupParser';

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
  updateTodo: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (activeId: string, overId: string) => void;
  generateStandupMarkdown: () => string;
  saveStandupToFile: (markdown: string) => void;
  loadTodos: () => void;
  reloadFromMarkdown: () => void;
  saveTodos: () => void;
  importFromStandup: (selectedSections: Array<keyof ParsedStandup>) => Promise<void>;
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

    // Insert at the end of incomplete items (before completed items)
    const currentTodos = get().todos;
    const incomplete = currentTodos.filter(todo => !todo.completed);
    const completed = currentTodos.filter(todo => todo.completed);
    const updatedTodos = [...incomplete, newTodo, ...completed];

    set({ todos: updatedTodos });
    saveTodosToStorage(updatedTodos);
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

  updateTodo: (id, text) => {
    // Parse GitHub URLs and convert to markdown links
    const processedText = parseGitHubUrl(text);

    set((state) => ({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, text: processedText } : todo
      ),
    }));
    saveTodosToStorage(get().todos);
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
      if (removed) {
        newTodos.splice(newIndex, 0, removed);
        set({ todos: newTodos });
        saveTodosToStorage(newTodos);
      }
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

    // Note: The user needs to save the file to public/standups/ directory
    // After they save it, they should reload the page to sync with the markdown file
    // We'll keep the current todos state until they reload
  },

  loadTodos: () => {
    // Always load from the latest standup markdown file (markdown is source of truth)
    loadTodosFromLatestStandup(set);
  },

  reloadFromMarkdown: () => {
    // Force reload from markdown files
    loadTodosFromLatestStandup(set);
  },

  saveTodos: () => {
    saveTodosToStorage(get().todos);
  },

  importFromStandup: async (selectedSections) => {
    try {
      // Fetch the latest standup file
      const standupData = await fetchLatestStandup();
      if (!standupData) {
        throw new Error('No standup file found');
      }

      // Parse the standup file
      const parsed = parseStandupFile(standupData.content);

      // Collect tasks from selected sections
      const importedTasks: { text: string; completed: boolean }[] = [];
      for (const section of selectedSections) {
        const sectionData = parsed[section];

        // Handle TaskWithStatus[] for yesterday/today or string[] for blockers/backlog
        if (Array.isArray(sectionData)) {
          if (sectionData.length > 0) {
            if (typeof sectionData[0] === 'string') {
              // blockers or backlog (string[])
              (sectionData as string[]).forEach(text => {
                importedTasks.push({ text, completed: false });
              });
            } else {
              // yesterday or today (TaskWithStatus[])
              importedTasks.push(...(sectionData as Array<{ text: string; completed: boolean }>));
            }
          }
        }
      }

      if (importedTasks.length === 0) {
        return; // Nothing to import
      }

      // Get existing todos
      const existingTodos = get().todos;
      const existingTexts = new Set(
        existingTodos.map(todo => todo.text.toLowerCase().trim())
      );

      // Filter out duplicates and create new Todo objects with their completion status
      const newTodos: Todo[] = importedTasks
        .filter(task => !existingTexts.has(task.text.toLowerCase().trim()))
        .map(task => ({
          id: crypto.randomUUID(),
          text: task.text,
          completed: task.completed,
          createdAt: new Date().toISOString(),
          ...(task.completed ? { completedAt: new Date().toISOString() } : {}),
        }));

      if (newTodos.length === 0) {
        return; // All tasks were duplicates
      }

      // Merge: separate incomplete and completed
      const existingIncomplete = existingTodos.filter(todo => !todo.completed);
      const existingCompleted = existingTodos.filter(todo => todo.completed);
      const newIncomplete = newTodos.filter(todo => !todo.completed);
      const newCompleted = newTodos.filter(todo => todo.completed);

      // Combine: incomplete first, then completed
      const merged = [...existingIncomplete, ...newIncomplete, ...existingCompleted, ...newCompleted];

      set({ todos: merged });
      saveTodosToStorage(merged);
    } catch (error) {
      logError('importFromStandup: Failed to import from standup', error);
      throw error;
    }
  },
}));

const saveTodosToStorage = (todos: Todo[]) => {
  localStorage.setItem('standup-todos', JSON.stringify(todos));
};

const loadTodosFromLatestStandup = async (set: (partial: Partial<TodoStore>) => void) => {
  try {
    // Fetch the latest standup file using the parser utility
    const standupData = await fetchLatestStandup();

    if (!standupData) {
      // No standup file found, start with empty todos
      set({ todos: [] });
      return;
    }

    // Parse the standup file with the new parser
    const parsed = parseStandupFile(standupData.content);

    // Combine yesterday and today tasks with their completion status
    const todos: Todo[] = [];

    // Add yesterday's tasks
    parsed.yesterday.forEach(task => {
      todos.push({
        id: crypto.randomUUID(),
        text: task.text,
        completed: task.completed,
        createdAt: new Date().toISOString(),
        ...(task.completed ? { completedAt: new Date().toISOString() } : {}),
      });
    });

    // Add today's tasks
    parsed.today.forEach(task => {
      todos.push({
        id: crypto.randomUUID(),
        text: task.text,
        completed: task.completed,
        createdAt: new Date().toISOString(),
        ...(task.completed ? { completedAt: new Date().toISOString() } : {}),
      });
    });

    // Sort: incomplete first, then completed
    const sorted = [
      ...todos.filter(todo => !todo.completed),
      ...todos.filter(todo => todo.completed),
    ];

    set({ todos: sorted });
    saveTodosToStorage(sorted);
  } catch (error) {
    logError('loadTodosFromLatestStandup: Failed to load from standup files', error);
    set({ todos: [] });
  }
};
