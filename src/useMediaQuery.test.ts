import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  beforeEach(() => {
    // mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(min-width: 768px)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it('returns match result', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('returns false for non-matching query', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 500px)'));
    expect(result.current).toBe(false);
  });

  it('registers change listener', () => {
    const addListener = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: addListener,
      removeEventListener: vi.fn(),
    });

    renderHook(() => useMediaQuery('(orientation: portrait)'));

    expect(addListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('cleans up listener on unmount', () => {
    const removeListener = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: removeListener,
    });

    const { unmount } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));
    unmount();

    expect(removeListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
