import { useState } from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';
import Select from './Select';
import Input from './Input';

type FilterOperator = 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in';

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
}

interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
  value2?: string; // For 'between' operator
}

interface FilterBuilderProps {
  fields: FilterField[];
  onApply: (filters: FilterCondition[]) => void;
  onClear?: () => void;
  initialFilters?: FilterCondition[];
  className?: string;
}

export const FilterBuilder = ({
  fields,
  onApply,
  onClear,
  initialFilters = [],
  className,
}: FilterBuilderProps) => {
  const [filters, setFilters] = useState<FilterCondition[]>(
    initialFilters.length > 0 ? initialFilters : [createEmptyFilter()]
  );
  const [isExpanded, setIsExpanded] = useState(false);

  function createEmptyFilter(): FilterCondition {
    return {
      id: crypto.randomUUID(),
      field: fields[0]?.key || '',
      operator: 'contains',
      value: '',
    };
  }

  const operatorsByType: Record<FilterField['type'], { value: FilterOperator; label: string }[]> = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' },
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'gt', label: 'Greater than' },
      { value: 'lt', label: 'Less than' },
      { value: 'gte', label: 'Greater or equal' },
      { value: 'lte', label: 'Less or equal' },
      { value: 'between', label: 'Between' },
    ],
    date: [
      { value: 'equals', label: 'On' },
      { value: 'gt', label: 'After' },
      { value: 'lt', label: 'Before' },
      { value: 'between', label: 'Between' },
    ],
    select: [
      { value: 'equals', label: 'Is' },
      { value: 'in', label: 'Is any of' },
    ],
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setFilters(prev =>
      prev.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const addFilter = () => {
    setFilters(prev => [...prev, createEmptyFilter()]);
  };

  const removeFilter = (id: string) => {
    setFilters(prev => {
      const newFilters = prev.filter(f => f.id !== id);
      return newFilters.length > 0 ? newFilters : [createEmptyFilter()];
    });
  };

  const handleApply = () => {
    const validFilters = filters.filter(f => f.field && f.value);
    onApply(validFilters);
  };

  const handleClear = () => {
    setFilters([createEmptyFilter()]);
    onClear?.();
  };

  const activeCount = filters.filter(f => f.field && f.value).length;

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
          'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
          activeCount > 0 && 'border-primary-500 text-primary-600 dark:text-primary-400'
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {isExpanded && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsExpanded(false)} />
          <div className="absolute start-0 mt-2 w-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filter Results</h3>
            </div>

            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {filters.map((filter, index) => {
                const field = fields.find(f => f.key === filter.field);
                const operators = field ? operatorsByType[field.type] : operatorsByType.text;

                return (
                  <div key={filter.id} className="flex items-start gap-2">
                    {index > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 pt-2.5 w-8">AND</span>
                    )}
                    <div className={cn('flex-1 grid gap-2', index === 0 ? 'grid-cols-3' : 'grid-cols-3')}>
                      <Select
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, { field: e.target.value, value: '' })}
                        options={fields.map(f => ({ value: f.key, label: f.label }))}
                      />
                      <Select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, { operator: e.target.value as FilterOperator })}
                        options={operators}
                      />
                      {field?.type === 'select' && field.options ? (
                        <Select
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          options={[{ value: '', label: 'Select...' }, ...field.options]}
                        />
                      ) : (
                        <Input
                          type={field?.type === 'date' ? 'date' : field?.type === 'number' ? 'number' : 'text'}
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          placeholder="Value"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                onClick={addFilter}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                + Add condition
              </button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterBuilder;
