export const DEFAULT_FETCH_TIMEOUT_MS = 15000;

export class HttpError extends Error {
  constructor(
    readonly status: number,
    url: string,
  ) {
    super(`HTTP ${status} for ${url}`);
    this.name = 'HttpError';
  }
}

/** Caps how many requests run at once against one host. */
export function createRequestLimiter(maxConcurrent: number) {
  let active = 0;
  const queue: (() => void)[] = [];

  const release = () => {
    active -= 1;
    queue.shift()?.();
  };

  return async function run<T>(task: () => Promise<T>): Promise<T> {
    if (active >= maxConcurrent) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    active += 1;
    try {
      return await task();
    } finally {
      release();
    }
  };
}

/**
 * GET + JSON parse with a hard timeout. React Native's Android client has no default
 * timeout, so a stalled connection would otherwise hang the caller indefinitely.
 */
export async function fetchJson(
  url: string,
  options?: { timeoutMs?: number; headers?: Record<string, string> },
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', ...options?.headers },
    });
    if (!response.ok) throw new HttpError(response.status, url);
    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timeout);
  }
}
