import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { Button, Badge, KanbanBoard, Modal, Select, Textarea, Input } from '../../../components/ui';
import { SkeletonCard } from '../../../components/ui';
import { useToast } from '../../../store/toastStore';
import { TicketAttachments } from '../components/TicketAttachments';
import { TicketStatusHistory } from '../components/TicketStatusHistory';
import {
  Edit,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description?: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  customerId?: string;
  customerName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
}

interface TicketFormData {
  subject: string;
  description: string;
  priority: string;
  status: string;
  customerId: string;
  assignedAgentId?: string;
}

interface Agent {
  id: string;
  name: string;
}

const TicketsKanban = () => {
  const { t: _t } = useTranslation();
  void _t; // Translation hook available for future use
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>({
    subject: '',
    description: '',
    priority: 'Medium',
    status: 'New',
    customerId: '',
    assignedAgentId: '',
  });

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

  // Fetch customers
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await apiClient.get('/customers');
      return response.data;
    },
  });

  const tickets: Ticket[] = Array.isArray(ticketsData) ? ticketsData : (ticketsData?.data || ticketsData?.items || []);
  const agents: Agent[] = Array.isArray(agentsData) ? agentsData : (agentsData?.data || agentsData?.items || []);
  const customers: Customer[] = Array.isArray(customersData) ? customersData : (customersData?.data || customersData?.items || []);

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

  // Update ticket mutation (full update)
  const updateTicketMutation = useMutation({
    mutationFn: (data: { id: string; payload: TicketFormData }) =>
      apiClient.put(`/tickets/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsEditModalOpen(false);
      showToast('Ticket updated successfully', 'success');
    },
    onError: () => {
      showToast('Failed to update ticket', 'error');
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
  const handleItemMove = (itemId: string, _sourceColumn: string, targetColumn: string) => {
    const newStatus = columnToStatusMap[targetColumn];
    if (newStatus) {
      updateTicketStatus.mutate({ ticketId: itemId, status: newStatus });
    }
  };

  // Handle item click - open ticket detail modal
  const handleItemClick = (item: any) => {
    const ticket = tickets.find(t => t.id === item.id);
    if (ticket) {
      setSelectedTicket(ticket);
      setIsViewModalOpen(true);
    }
  };

  // Handle edit click
  const handleEditClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      subject: ticket.subject,
      description: ticket.description || '',
      priority: ticket.priority,
      status: ticket.status,
      customerId: ticket.customerId || '',
      assignedAgentId: ticket.assignedAgentId || '',
    });
    setIsEditModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicket) {
      updateTicketMutation.mutate({ id: selectedTicket.id, payload: formData });
    }
  };

  // Helper functions
  const getCustomerName = (customerId?: string) => {
    if (!customerId) return undefined;
    const customer = customers.find(c => c.id === customerId);
    return customer?.name;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      New: 'info',
      Open: 'warning',
      InProgress: 'info',
      Pending: 'warning',
      Resolved: 'success',
      Closed: 'default',
    };
    const labels: Record<string, string> = {
      New: 'New',
      Open: 'Open',
      InProgress: 'In Progress',
      Pending: 'Pending',
      Resolved: 'Resolved',
      Closed: 'Closed',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
      Critical: 'danger',
      High: 'danger',
      Medium: 'warning',
      Low: 'info',
    };
    return <Badge variant={variants[priority] || 'default'} size="sm">{priority}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Critical: 'border-l-red-500',
      High: 'border-l-orange-500',
      Medium: 'border-l-yellow-500',
      Low: 'border-l-blue-500',
    };
    return colors[priority] || 'border-l-gray-300';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      New: <AlertCircle className="w-4 h-4 text-blue-500" />,
      Open: <Clock className="w-4 h-4 text-yellow-500" />,
      InProgress: <ArrowUpRight className="w-4 h-4 text-blue-500" />,
      Pending: <Clock className="w-4 h-4 text-orange-500" />,
      Resolved: <CheckCircle className="w-4 h-4 text-green-500" />,
      Closed: <XCircle className="w-4 h-4 text-gray-500" />,
    };
    return icons[status] || null;
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-500';
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
  ];

  const statusOptions = [
    { value: 'New', label: 'New' },
    { value: 'Open', label: 'Open' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' },
  ];

  const customerOptions = customers.map((customer: Customer) => ({
    value: customer.id,
    label: customer.name,
  }));

  const agentOptions = agents.map((agent: Agent) => ({
    value: agent.id,
    label: agent.name,
  }));

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

      {/* View Ticket Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Ticket ${selectedTicket?.ticketNumber}`}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Header */}
            <div className={`p-4 rounded-lg border-l-4 ${getPriorityColor(selectedTicket.priority)} bg-gray-50 dark:bg-gray-800/50`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedTicket.subject}
                </h3>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedTicket.description || 'No description provided'}
              </p>
            </div>

            {/* Ticket Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</span>
                <div className="mt-2 flex items-center gap-2">
                  {getStatusIcon(selectedTicket.status)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</span>
                <div className="mt-2">
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</span>
                <div className="mt-2 flex items-center gap-2">
                  {(selectedTicket.customerName || getCustomerName(selectedTicket.customerId)) ? (
                    <>
                      <div className={`w-6 h-6 rounded-full ${getAvatarColor(selectedTicket.customerName || getCustomerName(selectedTicket.customerId) || '')} flex items-center justify-center text-white text-xs font-medium`}>
                        {getInitials(selectedTicket.customerName || getCustomerName(selectedTicket.customerId) || '')}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedTicket.customerName || getCustomerName(selectedTicket.customerId)}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Not specified</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned To</span>
                <div className="mt-2 flex items-center gap-2">
                  {(selectedTicket.assignedAgentName || getAgentName(selectedTicket.assignedAgentId)) ? (
                    <>
                      <div className={`w-6 h-6 rounded-full ${getAvatarColor(selectedTicket.assignedAgentName || getAgentName(selectedTicket.assignedAgentId) || '')} flex items-center justify-center text-white text-xs font-medium`}>
                        {getInitials(selectedTicket.assignedAgentName || getAgentName(selectedTicket.assignedAgentId) || '')}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedTicket.assignedAgentName || getAgentName(selectedTicket.assignedAgentId)}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</span>
                <p className="mt-2 text-sm text-gray-900 dark:text-white">
                  {formatDate(selectedTicket.createdAt)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</span>
                <p className="mt-2 text-sm text-gray-900 dark:text-white">
                  {formatDate(selectedTicket.updatedAt)}
                </p>
              </div>
            </div>

            {/* Status History Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <TicketStatusHistory
                ticketId={selectedTicket.id}
                currentStatus={selectedTicket.status}
              />
            </div>

            {/* Attachments Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <TicketAttachments
                ticketId={selectedTicket.id}
                readOnly={false}
                maxFiles={10}
                maxFileSizeMb={10}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="w-full sm:w-auto">
                Close
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleEditClick(selectedTicket);
              }} className="w-full sm:w-auto">
                <Edit className="w-4 h-4 mr-2" />
                Edit Ticket
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Ticket Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Ticket"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief description of the issue"
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the issue..."
            rows={4}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority"
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Customer"
              options={[{ value: '', label: 'Select Customer' }, ...customerOptions]}
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            />
            <Select
              label="Assigned Agent"
              options={[{ value: '', label: 'Unassigned' }, ...agentOptions]}
              value={formData.assignedAgentId || ''}
              onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={updateTicketMutation.isPending}
              className="w-full sm:w-auto"
            >
              Update Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TicketsKanban;
