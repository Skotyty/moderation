import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHotkeys } from './useHotkeys';

describe('useHotkeys', () => {
  beforeEach(() => {
    // Clean up event listeners before each test
    window.removeEventListener('keydown', vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls callback when hotkey is pressed', () => {
    const callback = vi.fn();
    const hotkeys = { a: callback };

    renderHook(() => useHotkeys(hotkeys));

    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback when different key is pressed', () => {
    const callback = vi.fn();
    const hotkeys = { a: callback };

    renderHook(() => useHotkeys(hotkeys));

    const event = new KeyboardEvent('keydown', { code: 'KeyB' });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('handles multiple hotkeys', () => {
    const callbackA = vi.fn();
    const callbackB = vi.fn();
    const hotkeys = { a: callbackA, b: callbackB };

    renderHook(() => useHotkeys(hotkeys));

    const eventA = new KeyboardEvent('keydown', { code: 'KeyA' });
    const eventB = new KeyboardEvent('keydown', { code: 'KeyB' });

    window.dispatchEvent(eventA);
    expect(callbackA).toHaveBeenCalledTimes(1);
    expect(callbackB).not.toHaveBeenCalled();

    window.dispatchEvent(eventB);
    expect(callbackB).toHaveBeenCalledTimes(1);
  });

  it('handles arrow keys', () => {
    const callback = vi.fn();
    const hotkeys = { arrowright: callback };

    renderHook(() => useHotkeys(hotkeys));

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles slash key', () => {
    const callback = vi.fn();
    const hotkeys = { '/': callback };

    renderHook(() => useHotkeys(hotkeys));

    const event = new KeyboardEvent('keydown', { code: 'Slash' });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback when input is focused', () => {
    const callback = vi.fn();
    const hotkeys = { a: callback };

    renderHook(() => useHotkeys(hotkeys));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', {
      code: 'KeyA',
      bubbles: true,
    });
    input.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('does not call callback when textarea is focused', () => {
    const callback = vi.fn();
    const hotkeys = { a: callback };

    renderHook(() => useHotkeys(hotkeys));

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    Object.defineProperty(event, 'target', { value: textarea, enumerable: true });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('does not register hotkeys when disabled', () => {
    const callback = vi.fn();
    const hotkeys = { a: callback };

    renderHook(() => useHotkeys(hotkeys, false));

    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('updates when hotkeys change', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(({ hotkeys }) => useHotkeys(hotkeys), {
      initialProps: { hotkeys: { a: callback1 } },
    });

    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    window.dispatchEvent(event);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    rerender({ hotkeys: { a: callback2 } });

    window.dispatchEvent(event);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('cleans up event listener on unmount', () => {
    const callback = vi.fn();
    const hotkeys = { a: callback };

    const { unmount } = renderHook(() => useHotkeys(hotkeys));

    unmount();

    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('prevents default behavior when hotkey is matched', () => {
    const callback = vi.fn();
    const hotkeys = { a: callback };

    renderHook(() => useHotkeys(hotkeys));

    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});


