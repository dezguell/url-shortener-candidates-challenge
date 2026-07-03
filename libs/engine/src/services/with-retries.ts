export async function withRetries<T>(
  attempt: () => Promise<T>,
  shouldRetry: (error: any) => boolean,
  maxAttempts = 5,
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await attempt();
    } catch (error) {
      if (!shouldRetry(error)) throw error;
      lastError = error;
    }
  }

  throw lastError;
}
