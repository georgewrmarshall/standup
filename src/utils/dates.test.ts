import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getDisplayDate, getTodayISO, getYesterdayISO } from './dates';

const FIXED_NOW = new Date('2026-04-13T12:00:00.000Z');

describe('dates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTodayISO', () => {
    it('returns today in YYYY-MM-DD format', () => {
      expect(getTodayISO()).toBe('2026-04-13');
    });
  });

  describe('getYesterdayISO', () => {
    it('returns yesterday in YYYY-MM-DD format', () => {
      expect(getYesterdayISO()).toBe('2026-04-12');
    });
  });

  describe('getDisplayDate', () => {
    it('formats today when no argument is provided', () => {
      expect(getDisplayDate()).toBe('April 13, 2026');
    });

    it('formats a provided date', () => {
      expect(getDisplayDate(new Date('2026-01-15T12:00:00.000Z'))).toBe(
        'January 15, 2026',
      );
    });
  });
});
