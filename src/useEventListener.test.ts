import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEventListener } from './useEventListener';

describe('useEventListener', () => {
  it('attaches event listener', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('click', handler));

    const event = new MouseEvent('click', { bubbles: true });
    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it('removes listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEventListener('resize', handler));

    unmount();

    window.dispatchEvent(new Event('resize'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('updates handler without re-registering', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { rerender } = renderHook(
      ({ h }) => useEventListener('keydown', h),
      { initialProps: { h: handler1 } }
    );

    rerender({ h: handler2 });

    const event = new KeyboardEvent('keydown');
    window.dispatchEvent(event);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith(event);
  });

  it('works with custom elements', () => {
    const element = document.createElement('div');
    const handler = vi.fn();

    renderHook(() => useEventListener('click', handler, element));

    const event = new MouseEvent('click', { bubbles: true });
    element.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
  });
});
