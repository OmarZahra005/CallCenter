import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: ShortcutConfig[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts.map((s) => ({
    key: s.key,
    modifiers: [
      s.ctrl && 'Ctrl',
      s.shift && 'Shift',
      s.alt && 'Alt',
      s.meta && 'Cmd',
    ].filter(Boolean).join('+'),
    description: s.description,
  }));
};

// Predefined shortcuts for call center app
export const useCallCenterShortcuts = (handlers: {
  onNewTicket?: () => void;
  onSearch?: () => void;
  onToggleNotifications?: () => void;
  onNavigateDashboard?: () => void;
  onNavigateAgents?: () => void;
  onNavigateTickets?: () => void;
  onToggleTheme?: () => void;
  onHelp?: () => void;
}) => {
  const shortcuts: ShortcutConfig[] = [];

  if (handlers.onNewTicket) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      handler: handlers.onNewTicket,
      description: 'Create new ticket',
    });
  }

  if (handlers.onSearch) {
    shortcuts.push({
      key: '/',
      handler: handlers.onSearch,
      description: 'Focus search',
    });
  }

  if (handlers.onToggleNotifications) {
    shortcuts.push({
      key: 'b',
      ctrl: true,
      handler: handlers.onToggleNotifications,
      description: 'Toggle notifications',
    });
  }

  if (handlers.onNavigateDashboard) {
    shortcuts.push({
      key: 'd',
      alt: true,
      handler: handlers.onNavigateDashboard,
      description: 'Go to Dashboard',
    });
  }

  if (handlers.onNavigateAgents) {
    shortcuts.push({
      key: 'a',
      alt: true,
      handler: handlers.onNavigateAgents,
      description: 'Go to Agents',
    });
  }

  if (handlers.onNavigateTickets) {
    shortcuts.push({
      key: 't',
      alt: true,
      handler: handlers.onNavigateTickets,
      description: 'Go to Tickets',
    });
  }

  if (handlers.onToggleTheme) {
    shortcuts.push({
      key: 'l',
      ctrl: true,
      shift: true,
      handler: handlers.onToggleTheme,
      description: 'Toggle theme',
    });
  }

  if (handlers.onHelp) {
    shortcuts.push({
      key: '?',
      shift: true,
      handler: handlers.onHelp,
      description: 'Show keyboard shortcuts',
    });
  }

  return useKeyboardShortcuts(shortcuts);
};

export default useKeyboardShortcuts;
