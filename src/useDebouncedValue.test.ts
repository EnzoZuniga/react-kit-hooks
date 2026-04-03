import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('debounces value updates', async () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebouncedValue(val, delay),
      { initialProps: { val: 'first', delay: 200 } }
    );

    expect(result.current).toBe('first');

    rerender({ val: 'second', delay: 200 });
    expect(result.current).toBe('first');

    await waitFor(() => expect(result.current).toBe('second'), { timeout: 300 });
  });

  it('cancels pending update on unmount', () => {
    const { unmount } = renderHook(() => useDebouncedValue('value', 500));
    unmount();
  });

  it('resets timer when value changes rapidly', async () => {
    const { result, rerender } = renderHook(
      ({ val }) => useDebouncedValue(val, 150),
      { initialProps: { val: 0 } }
    );

    rerender({ val: 1 });
    await new Promise(r => setTimeout(r, 80));
    rerender({ val: 2 });
    await new Promise(r => setTimeout(r, 80));
    
    // encore à 0 car le timer a été réinitialisé
    expect(result.current).toBe(0);

    await waitFor(() => expect(result.current).toBe(2), { timeout: 250 });
  });
});
