import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createKeyedCache } from './createKeyedCache';

describe('createKeyedCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores and retrieves values', () => {
    const cache = createKeyedCache<string>();
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('returns undefined for missing keys', () => {
    const cache = createKeyedCache<number>();
    expect(cache.get('missing')).toBeUndefined();
  });

  it('checks key existence', () => {
    const cache = createKeyedCache<boolean>();
    cache.set('exists', true);
    expect(cache.has('exists')).toBe(true);
    expect(cache.has('nope')).toBe(false);
  });

  it('deletes keys', () => {
    const cache = createKeyedCache<number>();
    cache.set('temp', 123);
    cache.delete('temp');
    expect(cache.get('temp')).toBeUndefined();
  });

  it('clears all entries', () => {
    const cache = createKeyedCache<string>();
    cache.set('a', 'A');
    cache.set('b', 'B');
    cache.clear();
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(false);
  });

  it('expires entries after TTL', () => {
    const cache = createKeyedCache<string>();
    cache.set('ephemeral', 'data', 1000);

    expect(cache.get('ephemeral')).toBe('data');

    vi.advanceTimersByTime(1001);

    expect(cache.get('ephemeral')).toBeUndefined();
  });

  it('does not expire without TTL', () => {
    const cache = createKeyedCache<string>();
    cache.set('permanent', 'forever');

    vi.advanceTimersByTime(999999);

    expect(cache.get('permanent')).toBe('forever');
  });
});
