import { useEffect } from 'react';

type HotkeyCallback = (event: KeyboardEvent) => void;

interface Hotkeys {
  [key: string]: HotkeyCallback;
}

export const useHotkeys = (hotkeys: Hotkeys, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInputFocused) {
        return;
      }

      let key: string;
      
      if (event.code.startsWith('Key')) {
        key = event.code.replace('Key', '').toLowerCase();
      } else if (event.code === 'Slash') {
        key = '/';
      } else {
        key = event.key.toLowerCase();
      }

      const callback = hotkeys[key];

      if (callback) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys, enabled]);
};

