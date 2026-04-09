# @enzozuniga/react-kit-hooks

Pragmatic React hooks collection with TypeScript support and comprehensive test coverage.

## Architecture

Built as a lightweight library using Vite in library mode. Each hook is independently tested with Vitest and follows React best practices for stability (ref-based handler caching, proper dependency arrays, SSR guards).

Core patterns:
- **Discriminated unions** for async state (`useAsyncResource`)
- **Versioned storage** to handle schema migrations gracefully (`useLocalStorageState`)
- **Stable callbacks via ref** to avoid stale closures (`useEventListener`)
- **Optional TTL-based cache** utility for resource memoization

## Stack

- **Build**: Vite 5 (ESM + CJS outputs)
- **Runtime**: React 18+
- **Language**: TypeScript 5 (strict mode)
- **Testing**: Vitest + @testing-library/react

## Installation

```bash
npm install @enzozuniga/react-kit-hooks
```

## Hooks

### `useDebouncedValue<T>(value, delayMs)`

Debounces rapid value changes. Returns the delayed value.

```ts
const query = useDebouncedValue(searchInput, 300);
```

### `useLocalStorageState<T>(key, initialValue)`

Persists state to localStorage with JSON serialization. Handles versioning, SSR, and cross-tab sync.

```ts
const [theme, setTheme] = useLocalStorageState('theme', 'light');
```

### `useAsyncResource<T>(loader)`

Manages async data loading with discriminated state union: `idle | loading | success | error`.

```ts
const { state, reload } = useAsyncResource(() => fetch('/api/data').then(r => r.json()));

if (state.status === 'success') {
  console.log(state.data);
}
```

### `useMediaQuery(query)`

Evaluates CSS media query and updates on change.

```ts
const isMobile = useMediaQuery('(max-width: 768px)');
```

### `useEventListener<K>(eventName, handler, element?)`

Attaches event listener with stable handler via ref pattern. Prevents stale closures.

```ts
useEventListener('resize', () => console.log('resized'));
```

## Utilities

### `createKeyedCache<T>()`

Creates a Map-based cache with optional TTL expiration.

```ts
const cache = createKeyedCache<User>();
cache.set('user:1', userData, 5000); // expires in 5s
```

## Running

```bash
npm install
npm test          # run tests once
npm run typecheck # verify types
npm run build     # bundle library
```

## Trade-offs

- **No React Server Components support**: hooks are client-only, SSR guards prevent hydration mismatches
- **localStorage version bump**: invalidates all cached data when `STORAGE_VERSION` changes
- **Single MediaQueryList listener**: query string changes recreate listener (acceptable for most use cases)
- **No cache eviction policy**: `createKeyedCache` expires by TTL but doesn't enforce size limits
