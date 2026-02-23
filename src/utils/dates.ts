import { format } from 'date-fns';

const MS_PER_DAY = 86400000;

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export const getTodayISO = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Get yesterday's date in ISO format (YYYY-MM-DD)
 */
export const getYesterdayISO = (): string => {
  return format(new Date(Date.now() - MS_PER_DAY), 'yyyy-MM-dd');
};

/**
 * Get display-friendly date format (MMMM d, yyyy)
 */
export const getDisplayDate = (date: Date = new Date()): string => {
  return format(date, 'MMMM d, yyyy');
};
