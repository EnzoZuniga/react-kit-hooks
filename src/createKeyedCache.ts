export interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
}

export interface KeyedCache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttlMs?: number): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}

export function createKeyedCache<T>(): KeyedCache<T> {
  const store = new Map<string, CacheEntry<T>>();

  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;

      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }

      return entry.value;
    },

    set(key: string, value: T, ttlMs?: number): void {
      const entry: CacheEntry<T> = {
        value,
        expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
      };
      store.set(key, entry);
    },

    has(key: string): boolean {
      return this.get(key) !== undefined;
    },

    delete(key: string): void {
      store.delete(key);
    },

    clear(): void {
      store.clear();
    },
  };
}
