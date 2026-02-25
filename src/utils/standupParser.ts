export interface ParsedStandup {
  yesterday: string[];
  today: string[];
  blockers: string[];
  backlog: string[];
}

export interface StandupTask {
  id: string;
  text: string;
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
  for (const key of Object.keys(sectionLines) as Array<keyof ParsedStandup>) {
    result[key] = extractTasksFromSection(sectionLines[key], key);
  }

  return result;
}

/**
 * Extract tasks from a section's lines
 */
function extractTasksFromSection(
  lines: string[],
  sectionKey: keyof ParsedStandup
): string[] {
  const tasks: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines or non-list items
    if (!trimmed || !trimmed.match(/^[-*•]/)) continue;

    // Remove list marker
    let task = trimmed.replace(/^[-*•]\s*/, '');

    // For "yesterday" section, only include incomplete items (with ❌)
    if (sectionKey === 'yesterday') {
      if (task.includes('❌')) {
        // Remove the ❌ indicator
        task = task.replace(/❌\s*/, '').trim();
      } else {
        // Skip completed items (with ✅) or items without indicators
        continue;
      }
    }

    // Remove any remaining emoji indicators at the start
    task = task.replace(/^[✅❌]\s*/, '').trim();

    // Remove markdown links but keep the text
    task = task.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    if (task) {
      tasks.push(task);
    }
  }

  return tasks;
}

/**
 * Get all tasks from yesterday (incomplete) and today as selectable items
 */
export function getStandupTasks(parsed: ParsedStandup): StandupTask[] {
  const tasks: StandupTask[] = [];

  // Add incomplete tasks from yesterday
  parsed.yesterday.forEach((text, index) => {
    tasks.push({
      id: `yesterday-${index}`,
      text,
      source: 'yesterday',
    });
  });

  // Add all tasks from today
  parsed.today.forEach((text, index) => {
    tasks.push({
      id: `today-${index}`,
      text,
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
      const response = await fetch(`/standups/${filename}.md`);
      if (response.ok) {
        const content = await response.text();
        return { content, filename: `${filename}.md` };
      }
    } catch (error) {
      console.error(`Failed to fetch standup file ${filename}.md:`, error);
    }
  }

  return null;
}
