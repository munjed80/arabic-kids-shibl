type Attempt = {
  count: number;
  first: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, Attempt>();

function cleanup(key: string, now: number) {
  const entry = attempts.get(key);
  if (entry && now - entry.first > WINDOW_MS) {
    attempts.delete(key);
  }
}

export function allowAttempt(key: string): boolean {
  const now = Date.now();
  cleanup(key, now);
  const entry = attempts.get(key);

  if (!entry) {
    attempts.set(key, { count: 1, first: now });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  attempts.set(key, { ...entry, count: entry.count + 1 });
  return true;
}

export function resetAttempts(key: string) {
  attempts.delete(key);
}

export function getAttemptCount(key: string) {
  cleanup(key, Date.now());
  return attempts.get(key)?.count ?? 0;
}
