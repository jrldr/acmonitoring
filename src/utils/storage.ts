/**
 * Safe storage utility with in-memory fallback for sandboxed iframes
 * where window.localStorage throws a SecurityError (Access is denied).
 */

const memoryStorage = new Map<string, string>();

function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isStorageAvailable();

export function safeGetItem(key: string): string | null {
  if (storageAvailable) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // Fallback
    }
  }
  return memoryStorage.get(key) ?? null;
}

export function safeSetItem(key: string, value: string): void {
  if (storageAvailable) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      // Fallback
    }
  }
  memoryStorage.set(key, value);
}

export function safeRemoveItem(key: string): void {
  if (storageAvailable) {
    try {
      window.localStorage.removeItem(key);
      return;
    } catch {
      // Fallback
    }
  }
  memoryStorage.delete(key);
}
