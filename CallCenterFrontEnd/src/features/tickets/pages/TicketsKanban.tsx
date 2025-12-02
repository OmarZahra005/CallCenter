import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { Button, Badge, KanbanBoard } from '../../../components/ui';
import { SkeletonCard } from '../../../components/ui';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description?: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  customerId?: string;
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Agent {
  id: string;
  name: string;
}

const TicketsKanban = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'my'>('all');

  // Fetch tickets
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await apiClient.get('/tickets');
      return response.data;
    },
  });

  // Fetch agents for assignee names
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get('/agents');
      return response.data;
    },
  });

  const tickets: Ticket[] = Array.isArray(ticketsData) ? ticketsData : (ticketsData?.data || ticketsData?.items || []);
  const agents: Agent[] = Array.isArray(agentsData) ? agentsData : (agentsData?.data || agentsData?.items || []);

  // Update ticket status mutation
  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const response = await apiClient.put(`/tickets/${ticketId}`, {
        ...ticket,
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // Get agent name by ID
  const getAgentName = (agentId?: string) => {
    if (!agentId) return undefined;
    const agent = agents.find(a => a.id === agentId);
    return agent?.name;
  };

  // Map status to column ID
  const statusToColumnMap: Record<string, string> = {
    'New': 'new',
    'Open': 'open',
    'InProgress': 'in-progress',
    'Pending': 'pending',
    'Resolved': 'resolved',
    'Closed': 'closed',
  };

  const columnToStatusMap: Record<string, string> = {
    'new': 'New',
    'open': 'Open',
    'in-progress': 'InProgress',
    'pending': 'Pending',
    'resolved': 'Resolved',
    'closed': 'Closed',
  };

  // Build Kanban columns
  const kanbanColumns = useMemo(() => {
    const columns = [
      { id: 'new', title: 'New', color: 'bg-blue-500', items: [] as any[] },
      { id: 'open', title: 'Open', color: 'bg-yellow-500', items: [] as any[] },
      { id: 'in-progress', title: 'In Progress', color: 'bg-purple-500', items: [] as any[] },
      { id: 'pending', title: 'Pending', color: 'bg-orange-500', items: [] as any[] },
      { id: 'resolved', title: 'Resolved', color: 'bg-green-500', items: [] as any[] },
      { id: 'closed', title: 'Closed', color: 'bg-gray-500', items: [] as any[] },
    ];

    tickets.forEach((ticket) => {
      const columnId = statusToColumnMap[ticket.status] || 'new';
      const column = columns.find(c => c.id === columnId);
      if (column) {
        column.items.push({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          priority: ticket.priority,
          assignee: getAgentName(ticket.assignedAgentId),
          customerId: ticket.customerId,
        });
      }
    });

    return columns;
  }, [tickets, agents]);

  // Handle item move between columns
  const handleItemMove = (itemId: string, sourceColumn: string, targetColumn: string) => {
    const newStatus = columnToStatusMap[targetColumn];
    if (newStatus) {
      updateTicketStatus.mutate({ ticketId: itemId, status: newStatus });
    }
  };

  // Handle item click
  const handleItemClick = (item: any) => {
    console.log('Ticket clicked:', item);
    // TODO: Open ticket detail modal
  };

  if (ticketsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets Kanban</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Drag and drop tickets between columns to update status
          </p>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="w-72 h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets Kanban</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Drag and drop tickets between columns to update status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Tickets
          </Button>
          <Button
            variant={filter === 'my' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('my')}
          >
            My Tickets
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4">
        {kanbanColumns.map((column) => (
          <div key={column.id} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${column.color}`}></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{column.title}:</span>
            <Badge variant="default" size="sm">{column.items.length}</Badge>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        columns={kanbanColumns}
        onItemMove={handleItemMove}
        onItemClick={handleItemClick}
      />
    </div>
  );
};

export default TicketsKanban;
