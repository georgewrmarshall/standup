import { create } from 'zustand';
import { getTodayISO, getDisplayDate } from '../utils/dates';
import { logError } from '../utils/errors';
import { parseGitHubUrl } from '../utils/urlParser';
import {
  fetchLatestStandup,
  parseStandupFile,
  type ParsedStandup,
} from '../utils/standupParser';

export type TodoSection = 'today' | 'backlog';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  section: TodoSection;
  createdAt: string;
  completedAt?: string;
}

interface TodoStore {
  todos: Todo[];
  loadedFrom: { filename: string; isToday: boolean } | null;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
  moveTodo: (
    activeId: string,
    targetSection: TodoSection,
    overId?: string | null,
  ) => void;
  generateStandupMarkdown: () => string;
  saveStandupToFile: (markdown: string) => void;
  loadTodos: () => void;
  reloadFromMarkdown: () => Promise<void>;
  saveTodos: () => void;
  importFromStandup: (selectedSections: Array<keyof ParsedStandup>) => Promise<void>;
  getCompleted: () => Todo[];
  getIncomplete: () => Todo[];
  getBacklog: () => Todo[];
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  loadedFrom: null,

  getCompleted: () =>
    get().todos.filter((todo) => todo.section === 'today' && todo.completed),
  getIncomplete: () =>
    get().todos.filter((todo) => todo.section === 'today' && !todo.completed),
  getBacklog: () =>
    get().todos.filter((todo) => todo.section === 'backlog'),

  addTodo: (text) => {
    const processedText = parseGitHubUrl(text);
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: processedText,
      completed: false,
      section: 'today',
      createdAt: new Date().toISOString(),
    };

    const updatedTodos = normalizeTodoOrder([...get().todos, newTodo]);

    set({ todos: updatedTodos });
    saveTodosToStorage(updatedTodos);
  },

  toggleTodo: (id) => {
    const updatedTodos = get().todos.map((todo) => {
      if (todo.id !== id || todo.section === 'backlog') {
        return todo;
      }

      return {
        ...todo,
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date().toISOString() : undefined,
      };
    });

    const normalizedTodos = normalizeTodoOrder(updatedTodos);
    set({ todos: normalizedTodos });
    saveTodosToStorage(normalizedTodos);
  },

  updateTodo: (id, text) => {
    const processedText = parseGitHubUrl(text);

    const updatedTodos = normalizeTodoOrder(
      get().todos.map((todo) =>
        todo.id === id ? { ...todo, text: processedText } : todo,
      ),
    );

    set({ todos: updatedTodos });
    saveTodosToStorage(updatedTodos);
  },

  deleteTodo: (id) => {
    set((state) => ({ todos: state.todos.filter((todo) => todo.id !== id) }));
    saveTodosToStorage(get().todos);
  },

  moveTodo: (activeId, targetSection, overId = null) => {
    const todos = get().todos;
    const activeIndex = todos.findIndex((todo) => todo.id === activeId);

    if (activeIndex === -1) {
      return;
    }

    const reorderedTodos = [...todos];
    const [activeTodo] = reorderedTodos.splice(activeIndex, 1);

    if (!activeTodo) {
      return;
    }

    const movedTodo: Todo = {
      ...activeTodo,
      section: targetSection,
      completed: targetSection === 'backlog' ? false : activeTodo.completed,
      completedAt:
        targetSection === 'backlog' ? undefined : activeTodo.completedAt,
    };

    const overIndex = overId
      ? reorderedTodos.findIndex((todo) => todo.id === overId)
      : -1;

    if (overIndex !== -1) {
      reorderedTodos.splice(overIndex, 0, movedTodo);
    } else if (targetSection === 'today') {
      const firstBacklogIndex = reorderedTodos.findIndex(
        (todo) => todo.section === 'backlog',
      );

      if (firstBacklogIndex === -1) {
        reorderedTodos.push(movedTodo);
      } else {
        reorderedTodos.splice(firstBacklogIndex, 0, movedTodo);
      }
    } else {
      reorderedTodos.push(movedTodo);
    }

    const normalizedTodos = normalizeTodoOrder(reorderedTodos);
    set({ todos: normalizedTodos });
    saveTodosToStorage(normalizedTodos);
  },

  generateStandupMarkdown: () => {
    const todos = get().todos;
    const displayDate = getDisplayDate();
    const todayTodos = todos.filter((todo) => todo.section === 'today');
    const completed = todayTodos.filter((todo) => todo.completed);
    const notCompleted = todayTodos.filter((todo) => !todo.completed);
    const backlog = todos.filter((todo) => todo.section === 'backlog');

    let markdown = `_${displayDate}_\n\n`;

    markdown += `Yesterday\n\n`;
    if (completed.length > 0) {
      completed.forEach((todo) => {
        markdown += `- ${todo.text} ✅\n`;
      });
    }
    if (notCompleted.length > 0) {
      notCompleted.forEach((todo) => {
        markdown += `- ${todo.text} ❌\n`;
      });
    }
    if (completed.length === 0 && notCompleted.length === 0) {
      markdown += `- No tasks\n`;
    }
    markdown += '\n';

    markdown += `Today\n\n`;
    if (notCompleted.length > 0) {
      notCompleted.forEach((todo) => {
        markdown += `- ${todo.text}\n`;
      });
    } else {
      markdown += `- No tasks planned\n`;
    }
    markdown += '\n';

    markdown += `Blockers\n\n`;
    markdown += `- None\n\n`;

    markdown += `Backlog\n\n`;
    if (backlog.length > 0) {
      backlog.forEach((todo) => {
        markdown += `- ${todo.text}\n`;
      });
    } else {
      markdown += `- None\n`;
    }

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
  },

  loadTodos: () => {
    const stored = localStorage.getItem('standup-todos');
    const storedLoadedFrom = localStorage.getItem('standup-loaded-from');

    if (stored) {
      try {
        const todos = normalizeTodoOrder(migrateStoredTodos(JSON.parse(stored)));
        const loadedFrom = storedLoadedFrom
          ? JSON.parse(storedLoadedFrom)
          : null;
        set({ todos, loadedFrom });
        return;
      } catch (error) {
        logError('loadTodos: Failed to parse localStorage', error);
      }
    }

    loadTodosFromLatestStandup(set);
  },

  reloadFromMarkdown: async () => {
    await loadTodosFromLatestStandup(set);
  },

  saveTodos: () => {
    saveTodosToStorage(get().todos);
  },

  importFromStandup: async (selectedSections) => {
    try {
      const standupData = await fetchLatestStandup();
      if (!standupData) {
        throw new Error('No standup file found');
      }

      const parsed = parseStandupFile(standupData.content);
      const importedTasks: Array<{
        text: string;
        completed: boolean;
        section: TodoSection;
      }> = [];

      for (const section of selectedSections) {
        const sectionData = parsed[section];

        if (!Array.isArray(sectionData) || sectionData.length === 0) {
          continue;
        }

        if (typeof sectionData[0] === 'string') {
          (sectionData as string[]).forEach((text) => {
            importedTasks.push({
              text,
              completed: false,
              section: section === 'backlog' ? 'backlog' : 'today',
            });
          });
        } else {
          importedTasks.push(
            ...(sectionData as Array<{ text: string; completed: boolean }>).map(
              (task) => ({
                ...task,
                section: 'today' as const,
              }),
            ),
          );
        }
      }

      if (importedTasks.length === 0) {
        return;
      }

      const existingTodos = get().todos;
      const existingTexts = new Set(
        existingTodos.map((todo) => todo.text.toLowerCase().trim()),
      );

      const newTodos: Todo[] = importedTasks
        .filter((task) => !existingTexts.has(task.text.toLowerCase().trim()))
        .map((task) => ({
          id: crypto.randomUUID(),
          text: task.text,
          completed: task.completed,
          section: task.section,
          createdAt: new Date().toISOString(),
          ...(task.completed ? { completedAt: new Date().toISOString() } : {}),
        }));

      if (newTodos.length === 0) {
        return;
      }

      const merged = normalizeTodoOrder([...existingTodos, ...newTodos]);
      set({ todos: merged });
      saveTodosToStorage(merged);
    } catch (error) {
      logError('importFromStandup: Failed to import from standup', error);
      throw error;
    }
  },
}));

const saveTodosToStorage = (
  todos: Todo[],
  loadedFrom?: { filename: string; isToday: boolean } | null,
) => {
  localStorage.setItem('standup-todos', JSON.stringify(todos));
  if (loadedFrom !== undefined) {
    localStorage.setItem('standup-loaded-from', JSON.stringify(loadedFrom));
  }
};

const normalizeTodoText = (text: string): string =>
  text.toLowerCase().trim().replace(/\s+/g, ' ');

const migrateStoredTodos = (todos: unknown): Todo[] => {
  if (!Array.isArray(todos)) {
    return [];
  }

  return todos.flatMap((todo) => {
    if (!todo || typeof todo !== 'object') {
      return [];
    }

    const storedTodo = todo as Partial<Todo>;
    if (typeof storedTodo.id !== 'string' || typeof storedTodo.text !== 'string') {
      return [];
    }

    return [
      {
        id: storedTodo.id,
        text: storedTodo.text,
        completed: Boolean(storedTodo.completed),
        section: storedTodo.section === 'backlog' ? 'backlog' : 'today',
        createdAt: storedTodo.createdAt ?? new Date().toISOString(),
        completedAt: storedTodo.completedAt,
      },
    ];
  });
};

const normalizeTodoOrder = (todos: Todo[]): Todo[] => {
  const orderedTodos = [
    ...todos.filter((todo) => todo.section === 'today' && !todo.completed),
    ...todos.filter((todo) => todo.section === 'today' && todo.completed),
    ...todos.filter((todo) => todo.section === 'backlog'),
  ];
  const seen = new Set<string>();

  return orderedTodos.filter((todo) => {
    const normalizedText = normalizeTodoText(todo.text);

    if (!normalizedText || seen.has(normalizedText)) {
      return false;
    }

    seen.add(normalizedText);
    return true;
  });
};

const loadTodosFromLatestStandup = async (
  set: (partial: Partial<TodoStore>) => void,
) => {
  try {
    const standupData = await fetchLatestStandup();

    if (!standupData) {
      set({ todos: [] });
      return;
    }

    const parsed = parseStandupFile(standupData.content);
    const today = getTodayISO();
    const isToday = standupData.filename === `${today}.md`;
    if (isToday) {
      const taskMap = new Map<string, Todo>();

      parsed.yesterday.forEach((task) => {
        taskMap.set(normalizeTodoText(task.text), {
          id: crypto.randomUUID(),
          text: task.text,
          completed: task.completed,
          section: 'today',
          createdAt: new Date().toISOString(),
          ...(task.completed ? { completedAt: new Date().toISOString() } : {}),
        });
      });

      parsed.today.forEach((task) => {
        const normalized = normalizeTodoText(task.text);
        if (!taskMap.has(normalized)) {
          taskMap.set(normalized, {
            id: crypto.randomUUID(),
            text: task.text,
            completed: task.completed,
            section: 'today',
            createdAt: new Date().toISOString(),
            ...(task.completed ? { completedAt: new Date().toISOString() } : {}),
          });
        }
      });

      parsed.backlog.forEach((text) => {
        const normalized = normalizeTodoText(text);
        if (!taskMap.has(normalized)) {
          taskMap.set(normalized, {
            id: crypto.randomUUID(),
            text,
            completed: false,
            section: 'backlog',
            createdAt: new Date().toISOString(),
          });
        }
      });

      const sorted = normalizeTodoOrder(Array.from(taskMap.values()));
      const loadedFromData = { filename: standupData.filename, isToday: true };
      set({ todos: sorted, loadedFrom: loadedFromData });
      saveTodosToStorage(sorted, loadedFromData);
      return;
    }

    const todos: Todo[] = [];

    parsed.yesterday.forEach((task) => {
      todos.push({
        id: crypto.randomUUID(),
        text: task.text,
        completed: task.completed,
        section: 'today',
        createdAt: new Date().toISOString(),
        ...(task.completed ? { completedAt: new Date().toISOString() } : {}),
      });
    });

    parsed.today.forEach((task) => {
      todos.push({
        id: crypto.randomUUID(),
        text: task.text,
        completed: task.completed,
        section: 'today',
        createdAt: new Date().toISOString(),
        ...(task.completed ? { completedAt: new Date().toISOString() } : {}),
      });
    });

    parsed.backlog.forEach((text) => {
      todos.push({
        id: crypto.randomUUID(),
        text,
        completed: false,
        section: 'backlog',
        createdAt: new Date().toISOString(),
      });
    });

    const sorted = normalizeTodoOrder(todos);
    const loadedFromData = { filename: standupData.filename, isToday: false };
    set({ todos: sorted, loadedFrom: loadedFromData });
    saveTodosToStorage(sorted, loadedFromData);
  } catch (error) {
    logError('loadTodosFromLatestStandup: Failed to load from standup files', error);
    set({ todos: [], loadedFrom: null });
  }
};
