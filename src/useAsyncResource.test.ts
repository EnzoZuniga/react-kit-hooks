import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAsyncResource } from './useAsyncResource';

describe('useAsyncResource', () => {
  it('starts in idle then loading', async () => {
    const loader = vi.fn(() => new Promise<string>(() => {}));
    const { result } = renderHook(() => useAsyncResource(loader));

    // le hook démarre en idle mais passe immédiatement à loading via useEffect
    expect(['idle', 'loading']).toContain(result.current.state.status);

    await waitFor(() => {
      expect(result.current.state.status).toBe('loading');
    });
  });

  it('resolves to success state', async () => {
    const loader = vi.fn(async () => 'data');
    const { result } = renderHook(() => useAsyncResource(loader));

    await waitFor(() => {
      expect(result.current.state.status).toBe('success');
    });

    if (result.current.state.status === 'success') {
      expect(result.current.state.data).toBe('data');
    }
  });

  it('resolves to error state on rejection', async () => {
    const loader = vi.fn(async () => {
      throw new Error('load failed');
    });
    const { result } = renderHook(() => useAsyncResource(loader));

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });

    if (result.current.state.status === 'error') {
      expect(result.current.state.error.message).toBe('load failed');
    }
  });

  it('reloads on demand', async () => {
    let callCount = 0;
    const loader = vi.fn(async () => {
      callCount++;
      return `call-${callCount}`;
    });

    const { result } = renderHook(() => useAsyncResource(loader));

    await waitFor(() => {
      expect(result.current.state.status).toBe('success');
    });

    result.current.reload();

    await waitFor(() => {
      if (result.current.state.status === 'success') {
        expect(result.current.state.data).toBe('call-2');
      }
    });

    expect(loader).toHaveBeenCalledTimes(2);
  });
});
