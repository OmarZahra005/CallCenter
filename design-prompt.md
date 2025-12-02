# TaskMan Design System - Modern Component Guidelines

## Overview

You are building components for TaskMan, a modern task management application. Follow these established design patterns for consistency across all components.

## Visual Design Language

### Glass-morphism & Modern Aesthetics

- **Primary containers**: `bg-white/80 backdrop-blur-md` or `bg-white/80 backdrop-blur-sm`
- **Border style**: `border border-gray-200/50` for subtle, translucent borders
- **Shadow system**: `shadow-sm` for cards, `shadow-lg` for dropdowns, `shadow-xl` for modals
- **Modern radius**: `rounded-xl` (12px) for main containers, `rounded-lg` (8px) for nested elements

### Color System

- **Primary gradient**: `from-blue-600 to-purple-600` (brand colors)
- **Action colors**:
  - Blue: `from-blue-500 to-blue-600` (primary actions)
  - Emerald: `from-emerald-500 to-emerald-600` (success/create)
  - Purple: `from-purple-500 to-purple-600` (secondary)
  - Amber: `from-amber-500 to-amber-600` (warning)
  - Red: `from-red-500 to-red-600` (danger/high priority)
- **Neutral backgrounds**: `bg-gray-50/50` for cards, `bg-gray-100/70` for hover states

### Typography Hierarchy

- **Headings**: `text-lg font-semibold text-gray-900` for component titles
- **Subheadings**: `text-sm text-gray-500` for descriptions
- **Body text**: `text-sm font-medium text-gray-700` for content
- **Meta text**: `text-xs text-gray-400` for timestamps and secondary info

## Spacing & Layout

### Spacing Scale (4px base unit)

- **Container padding**: `p-6` (24px) for main areas, `p-4` (16px) for nested
- **Element spacing**: `space-x-3` or `space-y-3` (12px) for related items
- **Tight spacing**: `space-x-2` or `space-y-2` (8px) for closely related items
- **Section spacing**: `space-y-4` (16px) between major sections

### Layout Patterns

- **Full height containers**: `flex flex-col h-full` for cards in grids
- **Flexible content**: `flex-1` for main content areas to push footers down
- **Footer positioning**: `mt-auto` to stick footers to bottom of containers

## Component Patterns

### Card Structure

```tsx
<div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 flex flex-col h-full">
  {/* Header */}
  <div className="p-6 border-b border-gray-200/50">
    <h3 className="text-lg font-semibold text-gray-900">Title</h3>
    <p className="text-sm text-gray-500 mt-1">Description</p>
  </div>

  {/* Content */}
  <div className="p-6 flex-1">{/* Main content */}</div>

  {/* Footer */}
  <div className="mt-auto px-6 py-4 border-t border-gray-200/50 bg-gray-50/30">
    {/* Footer content */}
  </div>
</div>
```

### Interactive Elements

- **Buttons**: `rounded-xl` with `transition-all duration-200`
- **Hover states**: `hover:bg-gray-100/70` for cards, `hover:scale-1.02` for buttons
- **Active states**: `bg-blue-50/50 border-blue-200/50` for selected items
- **Focus states**: `focus:ring-2 focus:ring-blue-500/20` for accessibility

### Animation Guidelines

- **Standard timing**: `transition-all duration-200` for most interactions
- **Easing**: `ease-in-out` for natural feel
- **Hover animations**: Subtle scale (`scale-1.02`) and translate effects
- **Stagger animations**: `delay: index * 0.05` for list items

## Icon & Visual Elements

### Icon Styling

- **Standard size**: `h-5 w-5` for navigation, `h-4 w-4` for inline icons
- **Color-coded icons**: Each category has its own brand color
- **Hover effects**: `group-hover:scale-110` or `group-hover:rotate-12`

### Priority Indicators

- **High**: Red (`bg-red-500`, `text-red-600`)
- **Medium**: Amber (`bg-amber-500`, `text-amber-600`)
- **Low**: Blue (`bg-blue-500`, `text-blue-600`)
- **Visual style**: Small dots with `ring-2 ring-white shadow-sm`

### Status Badges

```tsx
<span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm">
  Status
</span>
```

## Micro-interactions

### Hover Effects

- **Cards**: `hover:shadow-sm hover:border-gray-300/50`
- **Buttons**: `hover:scale-1.05 whileTap={{ scale: 0.95 }}`
- **Icons**: Rotate, scale, or color transitions

### Loading States

- **Skeleton loading**: `animate-pulse` with `bg-gray-200` placeholders
- **Realistic structure**: Match final component layout
- **Stagger timing**: Different delays for multiple skeleton items

### Empty States

- **Centered layout**: Icon, heading, description pattern
- **Icon styling**: Large (`h-16 w-16`) in circular background
- **Encouraging copy**: Actionable messaging that guides users

## Accessibility

### Focus Management

- **Keyboard navigation**: Proper focus rings and tab order
- **Screen readers**: Semantic HTML and ARIA labels
- **Color contrast**: Maintain AA compliance for all text

### Interactive Feedback

- **Loading states**: Clear indication of async operations
- **Error handling**: Helpful error messages with recovery actions
- **Success feedback**: Toast notifications for completed actions

## Responsive Design

### Breakpoint Strategy

- **Mobile-first**: Start with mobile layouts
- **Grid adaptation**: `grid-cols-2 lg:grid-cols-5` pattern
- **Text scaling**: `text-sm sm:text-base` for better mobile readability
- **Spacing adjustments**: Reduced padding on mobile

### Mobile Considerations

- **Touch targets**: Minimum 44px for interactive elements
- **Simplified layouts**: Hide secondary information on small screens
- **Gesture support**: Swipe actions where appropriate

## Implementation Notes

### Required Dependencies

- **Styling**: `clsx` for conditional classes, `tailwind-merge` if needed
- **Animation**: `framer-motion` for all animations
- **Icons**: `lucide-react` with consistent sizing

### Code Patterns

- **Conditional styling**: Always use `clsx()` for dynamic classes
- **Animation variants**: Define reusable motion variants
- **Event handlers**: Include proper TypeScript types and error handling
- **Props interface**: Include `className?` for style overrides

### Input Components Policy

- **NEVER use regular HTML inputs**: Always use our custom input components from `../ui/inputs`
- **Available components**: `InputField`, `Textarea`, `Select`, `Checkbox`, `RadioButton`, `Switch`, `DatePicker`, `FileUpload`, `NumberInput`
- **Consistent imports**: `import { InputField, Select, Checkbox } from '../ui/inputs'`
- **Type safety**: Handle onChange callbacks properly for multi-value components like Select
- **Example**:

  ```tsx
  // ❌ Don't do this
  <input type="text" />
  <select><option /></select>
  <textarea />

  // ✅ Do this instead
  <InputField type="text" />
  <Select options={options} />
  <Textarea />
  ```

### Performance

- **Lazy loading**: For heavy components or data
- **Memoization**: For expensive calculations or renders
- **Animation optimization**: Use `transform` properties for smooth animations

## Advanced Patterns

### Enhanced Dropdown Menus

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95, y: -10 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: -10 }}
  className="absolute right-0 top-full mt-3 w-64 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 z-50"
>
  {/* Dropdown content */}
</motion.div>
```

### Search Bar with Enhanced States

```tsx
import { InputField } from '../ui/inputs';

// Always use our custom InputField component instead of regular HTML inputs
<InputField
  type="text"
  placeholder="Search..."
  value={searchQuery}
  onChange={setSearchQuery}
  onFocus={() => setSearchFocused(true)}
  onBlur={() => setSearchFocused(false)}
  leftIcon={<Search className="h-5 w-5" />}
  rightIcon={clearButton}
  variant="default"
  size="md"
/>;
```

### Notification System

- **Unread indicators**: Gradient backgrounds with animation
- **Priority colors**: Color-coded based on importance
- **Stagger animations**: Sequential entrance effects
- **Rich content**: Avatars, timestamps, and action buttons

### Progress Indicators

- **Health scores**: Color-coded project health (excellent/good/warning/poor)
- **Animated progress bars**: Smooth fill animations with gradients
- **Completion percentages**: Large, prominent display

## Quality Standards

### Design Consistency

- All components follow the same visual language
- Consistent spacing, colors, and typography throughout
- Unified animation timing and easing curves

### User Experience

- Clear visual hierarchy and information architecture
- Intuitive interactions with proper feedback
- Accessible design that works for all users

### Performance

- Smooth 60fps animations
- Efficient re-renders and state management
- Optimized for both desktop and mobile devices

This design system ensures consistency, accessibility, and a premium user experience across all TaskMan components.

# TaskMan Input Components

## InputField

Text input with validation, icons, and character counting.

```typescript
interface InputFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  hint?: string;
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
}
```

## Textarea

Multi-line text input with auto-resize and expandable mode.

```typescript
interface TextareaProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  hint?: string;
  maxLength?: number;
  autoFocus?: boolean;
  readOnly?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoResize?: boolean;
  expandable?: boolean;
}
```

## Select

Dropdown with search, multi-select, and grouping capabilities.

```typescript
interface SelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  hint?: string;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  loading?: boolean;
  maxHeight?: string;
  emptyMessage?: string;
  groupedOptions?: boolean;
  closeOnSelect?: boolean;
}
```

## Checkbox / CheckboxGroup

Single and multi-selection checkboxes with various layouts.

```typescript
interface CheckboxProps {
  id?: string;
  label?: string;
  description?: string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'card';
  error?: string;
  hint?: string;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'red';
  icon?: React.ReactNode;
}

interface CheckboxGroupProps {
  id?: string;
  label?: string;
  value?: string[];
  onChange?: (values: string[]) => void;
  options: CheckboxOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'card';
  hint?: string;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'red';
  direction?: 'vertical' | 'horizontal';
  showSelectAll?: boolean;
  maxSelections?: number;
}
```

## RadioButton / RadioGroup

Single selection radio buttons with card layouts and badges.

```typescript
interface RadioProps {
  id?: string;
  name: string;
  value: string;
  label?: string;
  description?: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'card';
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'red';
  icon?: React.ReactNode;
  badge?: string;
  recommended?: boolean;
}

interface RadioGroupProps {
  id?: string;
  name: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'card';
  hint?: string;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'red';
  direction?: 'vertical' | 'horizontal';
  columns?: number;
}
```

## Switch / SwitchGroup

Toggle switches with loading states and icons.

```typescript
interface SwitchProps {
  id?: string;
  label?: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'card';
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'red';
  error?: string;
  hint?: string;
  showIcons?: boolean;
  labelPosition?: 'left' | 'right';
  required?: boolean;
}

interface SwitchGroupProps {
  id?: string;
  label?: string;
  value?: string[];
  onChange?: (values: string[]) => void;
  options: SwitchOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'card';
  hint?: string;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'red';
  direction?: 'vertical' | 'horizontal';
  showIcons?: boolean;
  maxSelections?: number;
}
```

## DatePicker

Date and time selection with calendar interface and shortcuts.

```typescript
interface DatePickerProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  hint?: string;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  format?: 'date' | 'datetime' | 'time';
  clearable?: boolean;
  shortcuts?: Array<{ label: string; value: Date; icon?: React.ReactNode }>;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
```

## FileUpload

File upload with drag & drop, preview, and progress tracking.

```typescript
interface FileUploadProps {
  id?: string;
  label?: string;
  description?: string;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  onUpload?: (file: File) => Promise<{ url?: string; error?: string }>;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'gallery' | 'avatar';
  size?: 'sm' | 'md' | 'lg';
  hint?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  showPreview?: boolean;
  showProgress?: boolean;
  allowReorder?: boolean;
  capture?: 'user' | 'environment';
}
```

## NumberInput / NumberRange

Numeric input with formatting, controls, and validation.

```typescript
interface NumberInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: number;
  onChange?: (value: number | undefined) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  format?: 'number' | 'currency' | 'percentage';
  currency?: string;
  locale?: string;
  showControls?: boolean;
  controlsPosition?: 'right' | 'sides';
  allowNegative?: boolean;
  thousandSeparator?: boolean;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  showMinMax?: boolean;
}

interface NumberRangeProps {
  id?: string;
  label?: string;
  value?: { min?: number; max?: number };
  onChange?: (value: { min?: number; max?: number }) => void;
  minGap?: number;
  labels?: { min?: string; max?: string };
  connected?: boolean;
  // ... inherits other NumberInputProps
}
```

# Modal System Documentation

## BaseModal

Foundation modal component with core functionality.

```typescript
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  preventClose?: boolean;
}
```

## HeaderModal

Modal with structured header and scrollable content.

```typescript
interface HeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  preventClose?: boolean;
  headerActions?: ReactNode;
  iconClassName?: string;
}
```

## ConfirmationModal

Modal for user confirmations and yes/no decisions.

```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  icon?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  loading?: boolean;
  destructive?: boolean;
}
```

## ModalActions

Reusable action buttons for modal footers.

```typescript
interface ModalActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelText?: string;
  submitText?: string;
  submitIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  submitType?: 'button' | 'submit';
  cancelButtonClass?: string;
  submitButtonClass?: string;
  showBorder?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'between';
  children?: ReactNode;
}
```
