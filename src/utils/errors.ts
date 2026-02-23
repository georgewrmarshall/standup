/**
 * Log an error with context information
 * @param context - Description of where/why the error occurred
 * @param error - The error object or message
 */
export const logError = (context: string, error: unknown): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[${context}]`, errorMessage);
  if (errorStack) {
    console.error('Stack trace:', errorStack);
  }
};
