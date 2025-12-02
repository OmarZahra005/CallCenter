import { cn } from '../../utils/cn';

interface ShortcutItem {
  key: string;
  modifiers?: string;
  description?: string;
}

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: ShortcutItem[];
}

export const KeyboardShortcutsDialog = ({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsDialogProps) => {
  if (!isOpen) return null;

  const groupedShortcuts = {
    navigation: shortcuts.filter(s => s.description?.toLowerCase().includes('go to') || s.description?.toLowerCase().includes('navigate')),
    actions: shortcuts.filter(s => s.description?.toLowerCase().includes('create') || s.description?.toLowerCase().includes('toggle') || s.description?.toLowerCase().includes('focus')),
    other: shortcuts.filter(s => !s.description?.toLowerCase().includes('go to') && !s.description?.toLowerCase().includes('navigate') && !s.description?.toLowerCase().includes('create') && !s.description?.toLowerCase().includes('toggle') && !s.description?.toLowerCase().includes('focus')),
  };

  const renderKey = (key: string, modifiers?: string) => {
    const keys = modifiers ? [...modifiers.split('+'), key] : [key];
    return (
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
          >
            {k}
          </kbd>
        ))}
      </div>
    );
  };

  const renderSection = (title: string, items: ShortcutItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4 last:mb-0">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</h4>
        <div className="space-y-2">
          {items.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-900 dark:text-white">{shortcut.description}</span>
              {renderKey(shortcut.key, shortcut.modifiers)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
          role="dialog"
          aria-labelledby="shortcuts-title"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 id="shortcuts-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
            {renderSection('Navigation', groupedShortcuts.navigation)}
            {renderSection('Actions', groupedShortcuts.actions)}
            {renderSection('Other', groupedShortcuts.other)}
          </div>
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcutsDialog;
