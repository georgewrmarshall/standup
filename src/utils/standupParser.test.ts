import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchLatestStandup,
  getStandupTasks,
  parseStandupFile,
} from './standupParser';

// ---------------------------------------------------------------------------
// parseStandupFile
// ---------------------------------------------------------------------------

describe('parseStandupFile', () => {
  describe('section detection', () => {
    it('parses all four standard sections', () => {
      const markdown = `
Yesterday

- task one ✅
- task two ❌

Today

- task three

Blockers

- a blocker

Backlog

- backlog item
`.trim();

      const result = parseStandupFile(markdown);

      expect(result.yesterday).toEqual([
        { text: 'task one', completed: true },
        { text: 'task two', completed: false },
      ]);
      expect(result.today).toEqual([{ text: 'task three', completed: false }]);
      expect(result.blockers).toEqual(['a blocker']);
      expect(result.backlog).toEqual(['backlog item']);
    });

    it('recognises "Completed" as the yesterday section', () => {
      const result = parseStandupFile('Completed\n\n- done ✅');

      expect(result.yesterday).toEqual([{ text: 'done', completed: true }]);
    });

    it('recognises "Working On" as the today section', () => {
      const result = parseStandupFile('Working On\n\n- in progress');

      expect(result.today).toEqual([{ text: 'in progress', completed: false }]);
    });

    it('ignores lines beginning with an underscore (e.g. date headers)', () => {
      const result = parseStandupFile(
        '_April 9, 2026_\n\nYesterday\n\n- a task ✅',
      );

      expect(result.yesterday).toEqual([{ text: 'a task', completed: true }]);
    });

    it('strips ## markdown-style header prefixes from section names', () => {
      const result = parseStandupFile('## Yesterday\n\n- item');

      expect(result.yesterday).toEqual([{ text: 'item', completed: false }]);
    });

    it('ignores unrecognised headers and content that precedes the first section', () => {
      const result = parseStandupFile(
        'Random Header\n\n- orphan\n\nYesterday\n\n- task',
      );

      expect(result.yesterday).toEqual([{ text: 'task', completed: false }]);
    });
  });

  describe('task completion status (yesterday / today)', () => {
    it('marks tasks with ✅ as completed and strips the emoji', () => {
      const result = parseStandupFile('Today\n\n- done task ✅');

      expect(result.today).toEqual([{ text: 'done task', completed: true }]);
    });

    it('marks tasks with ❌ as not completed and strips the emoji', () => {
      const result = parseStandupFile('Today\n\n- missed task ❌');

      expect(result.today).toEqual([
        { text: 'missed task', completed: false },
      ]);
    });

    it('marks tasks without an emoji as not completed', () => {
      const result = parseStandupFile('Today\n\n- plain task');

      expect(result.today).toEqual([{ text: 'plain task', completed: false }]);
    });

    it('omits list items that are empty after emoji stripping', () => {
      const result = parseStandupFile('Today\n\n- ✅\n\n- real task');

      expect(result.today).toEqual([{ text: 'real task', completed: false }]);
    });

    it('skips non-list lines within a section', () => {
      const result = parseStandupFile(
        'Today\n\nnot a list item\n\n- list item',
      );

      expect(result.today).toEqual([{ text: 'list item', completed: false }]);
    });
  });

  describe('simple tasks (blockers / backlog)', () => {
    it('omits items that are empty after emoji stripping', () => {
      const result = parseStandupFile('Blockers\n\n- ✅\n\n- real blocker');

      expect(result.blockers).toEqual(['real blocker']);
    });

    it('skips non-list lines within the section', () => {
      const result = parseStandupFile(
        'Backlog\n\nnot a list item\n\n- list item',
      );

      expect(result.backlog).toEqual(['list item']);
    });
  });
});

// ---------------------------------------------------------------------------
// getStandupTasks
// ---------------------------------------------------------------------------

describe('getStandupTasks', () => {
  it('combines yesterday and today tasks with correct source labels', () => {
    const parsed = {
      yesterday: [{ text: 'old task', completed: true }],
      today: [{ text: 'new task', completed: false }],
      blockers: [],
      backlog: [],
    };

    const tasks = getStandupTasks(parsed);

    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toMatchObject({
      text: 'old task',
      completed: true,
      source: 'yesterday',
    });
    expect(tasks[1]).toMatchObject({
      text: 'new task',
      completed: false,
      source: 'today',
    });
  });

  it('returns an empty array when there are no tasks', () => {
    const parsed = { yesterday: [], today: [], blockers: [], backlog: [] };

    expect(getStandupTasks(parsed)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// fetchLatestStandup
// ---------------------------------------------------------------------------

describe('fetchLatestStandup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13T12:00:00.000Z'));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns today's content and filename when the file is available", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'Yesterday\n\n- task ✅',
      }),
    );

    const result = await fetchLatestStandup();

    expect(result).toEqual({
      content: 'Yesterday\n\n- task ✅',
      filename: '2026-04-13.md',
    });
  });

  it("falls back to yesterday when today's response contains <!DOCTYPE HTML", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '<!DOCTYPE html><html></html>',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '- yesterday task',
        }),
    );

    const result = await fetchLatestStandup();

    expect(result).toEqual({
      content: '- yesterday task',
      filename: '2026-04-12.md',
    });
  });

  it("falls back to yesterday when today's response contains <html content", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '<html><body></body></html>',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '- yesterday task',
        }),
    );

    const result = await fetchLatestStandup();

    expect(result).toEqual({
      content: '- yesterday task',
      filename: '2026-04-12.md',
    });
  });

  it("falls back to yesterday when today's response is not ok", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 404 })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '- yesterday task',
        }),
    );

    const result = await fetchLatestStandup();

    expect(result).toEqual({
      content: '- yesterday task',
      filename: '2026-04-12.md',
    });
  });

  it('catches a fetch error and tries the next file', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '- yesterday task',
        }),
    );

    const result = await fetchLatestStandup();

    expect(result).toEqual({
      content: '- yesterday task',
      filename: '2026-04-12.md',
    });
  });

  it('returns null when no standup file is found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );

    const result = await fetchLatestStandup();

    expect(result).toBeNull();
  });
});
