import { useState, useCallback, useEffect } from 'react';

type SetValue<T> = T | ((prev: T) => T);

interface StorageValue<T> {
  version: number;
  data: T;
}

const STORAGE_VERSION = 1;

function isSSR(): boolean {
  return typeof window === 'undefined';
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  const [state, setState] = useState<T>(() => {
    if (isSSR()) return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item) as StorageValue<T>;
      
      // versioning permet de skip les anciennes structures incompatibles
      if (parsed.version !== STORAGE_VERSION) {
        return initialValue;
      }

      return parsed.data;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const nextValue = value instanceof Function ? value(state) : value;
        setState(nextValue);

        if (!isSSR()) {
          const payload: StorageValue<T> = {
            version: STORAGE_VERSION,
            data: nextValue,
          };
          window.localStorage.setItem(key, JSON.stringify(payload));
        }
      } catch (error) {
        console.warn(`Failed to save to localStorage key="${key}":`, error);
      }
    },
    [key, state]
  );

  // sync cross-tab changes
  useEffect(() => {
    if (isSSR()) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || !e.newValue) return;

      try {
        const parsed = JSON.parse(e.newValue) as StorageValue<T>;
        if (parsed.version === STORAGE_VERSION) {
          setState(parsed.data);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [state, setValue];
}
