/**
 * Fetch with automatic retry logic
 * Useful for unreliable network calls or services that may be temporarily unavailable
 */

interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, onRetry, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // If successful, return immediately
      if (response.ok) {
        return response;
      }

      // For 4xx errors (client errors), don't retry
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // For 5xx errors (server errors), retry
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // Don't wait after the last attempt
    if (attempt < retries - 1) {
      // Call onRetry callback if provided
      if (onRetry && lastError) {
        onRetry(attempt + 1, lastError);
      }

      // Exponential backoff: wait longer after each retry
      const waitTime = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new Error("Request failed after retries");
}
