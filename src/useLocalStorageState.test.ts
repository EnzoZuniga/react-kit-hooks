import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorageState } from './useLocalStorageState';

describe('useLocalStorageState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when nothing in storage', () => {
    const { result } = renderHook(() => useLocalStorageState('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('persists value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorageState('persist-key', 0));

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);

    const stored = localStorage.getItem('persist-key');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.data).toBe(42);
    expect(parsed.version).toBe(1);
  });

  it('reads persisted value on mount', () => {
    localStorage.setItem('preloaded', JSON.stringify({ version: 1, data: 'cached' }));

    const { result } = renderHook(() => useLocalStorageState('preloaded', 'default'));
    expect(result.current[0]).toBe('cached');
  });

  it('falls back to default when version mismatch', () => {
    localStorage.setItem('old-version', JSON.stringify({ version: 0, data: 'stale' }));

    const { result } = renderHook(() => useLocalStorageState('old-version', 'fresh'));
    expect(result.current[0]).toBe('fresh');
  });

  it('handles functional updates', () => {
    const { result } = renderHook(() => useLocalStorageState('counter', 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
  });

  it('handles parse errors gracefully', () => {
    localStorage.setItem('corrupt', 'not-json{');

    const { result } = renderHook(() => useLocalStorageState('corrupt', 'safe'));
    expect(result.current[0]).toBe('safe');
  });
});
