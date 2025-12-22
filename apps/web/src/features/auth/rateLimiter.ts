const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

type LoginBucket = {
  attempts: number;
  firstAttempt: number;
};

const buckets = new Map<string, LoginBucket>();

function currentBucket(key: string): LoginBucket {
  const existing = buckets.get(key);
  if (!existing) {
    const fresh = { attempts: 0, firstAttempt: Date.now() };
    buckets.set(key, fresh);
    return fresh;
  }

  if (Date.now() - existing.firstAttempt > WINDOW_MS) {
    const fresh = { attempts: 0, firstAttempt: Date.now() };
    buckets.set(key, fresh);
    return fresh;
  }

  return existing;
}

export function canAttemptLogin(key: string) {
  const bucket = currentBucket(key);
  return bucket.attempts < MAX_ATTEMPTS;
}

export function recordFailedLogin(key: string) {
  const bucket = currentBucket(key);
  bucket.attempts += 1;
  buckets.set(key, bucket);
}

export function resetLoginAttempts(key: string) {
  buckets.delete(key);
}

export function resetAllLoginBuckets() {
  buckets.clear();
}
