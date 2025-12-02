import { useState } from 'react';
import { cn } from '../../utils/cn';
import Badge from './Badge';

interface KanbanItem {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee?: string;
  dueDate?: Date;
  customerId?: string;
  customerName?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
  color: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onItemMove?: (itemId: string, sourceColumn: string, targetColumn: string) => void;
  onItemClick?: (item: KanbanItem) => void;
  className?: string;
}

export const KanbanBoard = ({ columns, onItemMove, onItemClick, className }: KanbanBoardProps) => {
  const [draggedItem, setDraggedItem] = useState<{ item: KanbanItem; sourceColumn: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (item: KanbanItem, columnId: string) => {
    setDraggedItem({ item, sourceColumn: columnId });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.sourceColumn !== targetColumn) {
      onItemMove?.(draggedItem.item.id, draggedItem.sourceColumn, targetColumn);
    }
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'border-l-red-500';
      case 'High':
        return 'border-l-orange-500';
      case 'Medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-green-500';
    }
  };

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn(
            'flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-800 rounded-lg',
            dragOverColumn === column.id && 'ring-2 ring-primary-500'
          )}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
          onDragLeave={() => setDragOverColumn(null)}
        >
          {/* Column Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', column.color)}></span>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{column.title}</h3>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {column.items.length}
              </span>
            </div>
          </div>

          {/* Column Items */}
          <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-20rem)] overflow-y-auto">
            {column.items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item, column.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onItemClick?.(item)}
                className={cn(
                  'bg-white dark:bg-gray-900 rounded-lg p-3 border-l-4 shadow-sm cursor-pointer',
                  'hover:shadow-md transition-shadow',
                  getPriorityColor(item.priority),
                  draggedItem?.item.id === item.id && 'opacity-50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{item.ticketNumber}</span>
                  <Badge
                    variant={item.priority === 'Critical' || item.priority === 'High' ? 'danger' : item.priority === 'Medium' ? 'warning' : 'success'}
                    size="sm"
                  >
                    {item.priority}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                  {item.subject}
                </p>
                <div className="flex items-center justify-between text-xs">
                  {item.assignee && (
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-primary-600 dark:text-primary-400">
                          {item.assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                        {item.assignee}
                      </span>
                    </div>
                  )}
                  {item.dueDate && (
                    <span className={cn(
                      'text-xs',
                      new Date(item.dueDate) < new Date() ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {column.items.length === 0 && (
              <div className="flex items-center justify-center h-20 text-sm text-gray-400 dark:text-gray-500">
                No tickets
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
