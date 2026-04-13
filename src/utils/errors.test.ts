import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logError } from './errors';

describe('logError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the context, message, and stack trace for Error instances', () => {
    const error = new Error('something went wrong');

    logError('MyContext', error);

    expect(console.error).toHaveBeenCalledWith('[MyContext]', 'something went wrong');
    expect(console.error).toHaveBeenCalledWith('Stack trace:', error.stack);
  });

  it('logs the context and stringified message for non-Error values', () => {
    logError('MyContext', 'plain string');

    expect(console.error).toHaveBeenCalledWith('[MyContext]', 'plain string');
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('stringifies non-string primitive errors', () => {
    logError('MyContext', 42);

    expect(console.error).toHaveBeenCalledWith('[MyContext]', '42');
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
