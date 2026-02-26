export interface TaskWithStatus {
  text: string;
  completed: boolean;
}

export interface ParsedStandup {
  yesterday: TaskWithStatus[];
  today: TaskWithStatus[];
  blockers: string[];
  backlog: string[];
}

export interface StandupTask {
  id: string;
  text: string;
  completed: boolean;
  source: 'yesterday' | 'today';
}

/**
 * Parse standup markdown file into sections
 */
export function parseStandupFile(markdown: string): ParsedStandup {
  const result: ParsedStandup = {
    yesterday: [],
    today: [],
    blockers: [],
    backlog: [],
  };

  // Split by lines
  const lines = markdown.split('\n');
  let currentSection: keyof ParsedStandup | null = null;
  const sectionLines: { [key in keyof ParsedStandup]: string[] } = {
    yesterday: [],
    today: [],
    blockers: [],
    backlog: [],
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this is a section header (plain text or ## markdown)
    if (trimmed && !trimmed.startsWith('-') && !trimmed.startsWith('_')) {
      const lower = trimmed.toLowerCase().replace(/^#+\s*/, ''); // Remove markdown header markers

      if (lower.includes('yesterday') || lower.includes('completed')) {
        currentSection = 'yesterday';
        continue;
      } else if (lower === 'today' || lower.includes('working on')) {
        currentSection = 'today';
        continue;
      } else if (lower.includes('blocker')) {
        currentSection = 'blockers';
        continue;
      } else if (lower.includes('backlog')) {
        currentSection = 'backlog';
        continue;
      }
    }

    // Add line to current section
    if (currentSection && trimmed) {
      sectionLines[currentSection].push(line);
    }
  }

  // Extract tasks from each section
  result.yesterday = extractTasksWithStatus(sectionLines.yesterday);
  result.today = extractTasksWithStatus(sectionLines.today);
  result.blockers = extractSimpleTasks(sectionLines.blockers);
  result.backlog = extractSimpleTasks(sectionLines.backlog);

  return result;
}

/**
 * Extract tasks with completion status from yesterday/today sections
 */
function extractTasksWithStatus(lines: string[]): TaskWithStatus[] {
  const tasks: TaskWithStatus[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines or non-list items
    if (!trimmed || !trimmed.match(/^[-*•]/)) continue;

    // Remove list marker
    let task = trimmed.replace(/^[-*•]\s*/, '');

    // Check for completion status indicators
    let completed = false;
    if (task.includes('✅')) {
      completed = true;
      task = task.replace(/✅\s*/, '').trim();
    } else if (task.includes('❌')) {
      completed = false;
      task = task.replace(/❌\s*/, '').trim();
    }

    // Remove any remaining emoji indicators at the start
    task = task.replace(/^[✅❌]\s*/, '').trim();

    // Keep markdown links as-is so they render properly
    // No need to strip them - they'll be rendered by the MarkdownText component

    if (task) {
      tasks.push({ text: task, completed });
    }
  }

  return tasks;
}

/**
 * Extract simple tasks (without completion status) for blockers/backlog
 */
function extractSimpleTasks(lines: string[]): string[] {
  const tasks: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines or non-list items
    if (!trimmed || !trimmed.match(/^[-*•]/)) continue;

    // Remove list marker
    let task = trimmed.replace(/^[-*•]\s*/, '');

    // Remove any emoji indicators
    task = task.replace(/^[✅❌]\s*/, '').trim();

    // Keep markdown links as-is so they render properly
    // No need to strip them - they'll be rendered by the MarkdownText component

    if (task) {
      tasks.push(task);
    }
  }

  return tasks;
}

/**
 * Get all tasks from yesterday and today as selectable items with completion status
 */
export function getStandupTasks(parsed: ParsedStandup): StandupTask[] {
  const tasks: StandupTask[] = [];

  // Add all tasks from yesterday with their completion status
  parsed.yesterday.forEach((task, index) => {
    tasks.push({
      id: `yesterday-${index}`,
      text: task.text,
      completed: task.completed,
      source: 'yesterday',
    });
  });

  // Add all tasks from today with their completion status
  parsed.today.forEach((task, index) => {
    tasks.push({
      id: `today-${index}`,
      text: task.text,
      completed: task.completed,
      source: 'today',
    });
  });

  return tasks;
}

/**
 * Fetch the latest standup file (today or yesterday)
 */
export async function fetchLatestStandup(): Promise<{
  content: string;
  filename: string;
} | null> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const filenames = [formatDate(today), formatDate(yesterday)];

  // Try today's file first, then yesterday's
  for (const filename of filenames) {
    try {
      const url = `${import.meta.env.BASE_URL}standups/${filename}.md`;
      console.log('Fetching standup from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status, response.ok);
      if (response.ok) {
        const content = await response.text();
        // Check if the response is actually markdown and not HTML (Vite fallback)
        if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
          console.log('File not found (got HTML fallback), trying next...');
          continue;
        }
        console.log('Successfully loaded standup:', filename, 'length:', content.length);
        return { content, filename: `${filename}.md` };
      }
    } catch (error) {
      console.error(`Failed to fetch standup file ${filename}.md:`, error);
    }
  }

  console.warn('No standup file found');
  return null;
}
