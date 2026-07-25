/**
 * API Request Interceptor with timeout and error handling
 * Provides a wrapper around fetch with automatic timeout, retry, and error notifications
 */

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  originalError?: Error;
  isTimeout?: boolean;
  isNetworkError?: boolean;
}

export interface ApiRequestConfig {
  timeout?: number; // milliseconds, default 30000 (30s)
  retries?: number; // number of retries, default 1
  onError?: (error: ApiErrorResponse) => void; // error callback
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 1;

/**
 * Creates an AbortSignal with timeout
 */
function createTimeoutSignal(timeout: number): { signal: AbortSignal; timeoutId: NodeJS.Timeout } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { signal: controller.signal, timeoutId };
}

/**
 * Enhanced fetch wrapper with timeout and error handling
 */
export async function fetchWithInterceptor<T>(
  url: string,
  options: RequestInit & ApiRequestConfig = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    onError,
    ...fetchOptions
  } = options;

  let lastError: ApiErrorResponse | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { signal, timeoutId } = createTimeoutSignal(timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errorBody = await response.json();
            errorMessage = errorBody.error || errorBody.message || errorMessage;
          }
        } catch (e) {
          // ignore parse errors, use default message
        }

        lastError = {
          message: errorMessage,
          statusCode: response.status
        };

        if (attempt < retries) {
          // Retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }

        throw lastError;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }

      return (await response.text()) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        lastError = {
          message: `Request timeout after ${timeout}ms`,
          statusCode: 0,
          isTimeout: true
        };
      } else if (error instanceof TypeError) {
        lastError = {
          message: 'Network error: Unable to reach server',
          statusCode: 0,
          isNetworkError: true,
          originalError: error as Error
        };
      } else if (error instanceof Object && 'message' in error && 'statusCode' in error) {
        lastError = error as ApiErrorResponse;
      } else {
        lastError = {
          message: error instanceof Error ? error.message : 'Unknown error',
          statusCode: 0,
          originalError: error instanceof Error ? error : undefined
        };
      }

      if (attempt < retries) {
        // Retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      if (onError && lastError) {
        onError(lastError);
      }

      throw lastError;
    }
  }

  if (lastError) {
    if (onError) {
      onError(lastError);
    }
    throw lastError;
  }

  throw new Error('Request failed after retries');
}

/**
 * Creates a safer fetch wrapper for a specific API endpoint with pre-configured settings
 */
export function createApiClient(baseConfig: ApiRequestConfig = {}) {
  return {
    get: <T,>(url: string, config?: ApiRequestConfig) =>
      fetchWithInterceptor<T>(url, { method: 'GET', ...baseConfig, ...config }),

    post: <T,>(url: string, body?: unknown, config?: ApiRequestConfig) =>
      fetchWithInterceptor<T>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        ...baseConfig,
        ...config
      }),

    put: <T,>(url: string, body?: unknown, config?: ApiRequestConfig) =>
      fetchWithInterceptor<T>(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        ...baseConfig,
        ...config
      }),

    delete: <T,>(url: string, config?: ApiRequestConfig) =>
      fetchWithInterceptor<T>(url, { method: 'DELETE', ...baseConfig, ...config })
  };
}
