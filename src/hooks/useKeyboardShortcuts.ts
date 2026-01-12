'use client';

/**
 * Keyboard Shortcuts Hook
 * Manages keyboard shortcuts for dashboards
 */

import { useEffect } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: Shortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const keys = shortcut.keys;
        const key = e.key.toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt = e.altKey;

        // Check if this shortcut matches
        return keys.some((shortcutKey) => {
          const normalized = shortcutKey.toLowerCase();
          if (normalized === key) {
            // Check modifiers
            if (normalized.includes('ctrl') || normalized.includes('cmd')) {
              return ctrl && !shift && !alt;
            }
            if (normalized.includes('shift')) {
              return shift && !ctrl && !alt;
            }
            if (normalized.includes('alt')) {
              return alt && !ctrl && !shift;
            }
            return !ctrl && !shift && !alt;
          }
          return false;
        });
      });

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts, enabled]);
}
