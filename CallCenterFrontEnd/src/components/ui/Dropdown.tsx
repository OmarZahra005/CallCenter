import { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '../../utils/cn';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

const Dropdown = ({ trigger, items, align = 'right', className }: DropdownProps) => {
  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <Menu.Button as={Fragment}>{trigger}</Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            'absolute z-50 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
            align === 'left' ? 'start-0' : 'end-0'
          )}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <Menu.Item key={index} disabled={item.disabled}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    className={cn(
                      'flex w-full items-center gap-2 px-4 py-2 text-sm',
                      active && 'bg-gray-100 dark:bg-gray-700',
                      item.danger
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300',
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={item.disabled}
                  >
                    {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown;
