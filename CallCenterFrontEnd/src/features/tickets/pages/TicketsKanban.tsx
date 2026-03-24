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
  const { t, i18n } = useTranslation();
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

  const isArabic = i18n.language === 'ar';

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
      const ticket = tickets.find(tk => tk.id === ticketId);
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
      showToast(t('ticketsPage.updatedSuccess'), 'success');
    },
    onError: () => {
      showToast(t('ticketsPage.updatedError'), 'error');
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
      { id: 'new', title: t('ticketsPage.statusNew'), color: 'bg-blue-500', items: [] as any[] },
      { id: 'open', title: t('ticketsPage.statusOpen'), color: 'bg-yellow-500', items: [] as any[] },
      { id: 'in-progress', title: t('ticketsPage.statusInProgress'), color: 'bg-purple-500', items: [] as any[] },
      { id: 'pending', title: t('ticketsPage.statusPending'), color: 'bg-orange-500', items: [] as any[] },
      { id: 'resolved', title: t('ticketsPage.statusResolved'), color: 'bg-green-500', items: [] as any[] },
      { id: 'closed', title: t('ticketsPage.statusClosed'), color: 'bg-gray-500', items: [] as any[] },
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
  }, [tickets, agents, t]);

  // Handle item move between columns
  const handleItemMove = (itemId: string, _sourceColumn: string, targetColumn: string) => {
    const newStatus = columnToStatusMap[targetColumn];
    if (newStatus) {
      updateTicketStatus.mutate({ ticketId: itemId, status: newStatus });
    }
  };

  // Handle item click - open ticket detail modal
  const handleItemClick = (item: any) => {
    const ticket = tickets.find(tk => tk.id === item.id);
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      New: t('ticketsPage.statusNew'),
      Open: t('ticketsPage.statusOpen'),
      InProgress: t('ticketsPage.statusInProgress'),
      Pending: t('ticketsPage.statusPending'),
      Resolved: t('ticketsPage.statusResolved'),
      Closed: t('ticketsPage.statusClosed'),
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      Critical: t('ticketsPage.priorityCritical'),
      High: t('ticketsPage.priorityHigh'),
      Medium: t('ticketsPage.priorityMedium'),
      Low: t('ticketsPage.priorityLow'),
    };
    return labels[priority] || priority;
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
    return <Badge variant={variants[status] || 'default'}>{getStatusLabel(status)}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
      Critical: 'danger',
      High: 'danger',
      Medium: 'warning',
      Low: 'info',
    };
    return <Badge variant={variants[priority] || 'default'} size="sm">{getPriorityLabel(priority)}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Critical: 'border-s-red-500',
      High: 'border-s-orange-500',
      Medium: 'border-s-yellow-500',
      Low: 'border-s-blue-500',
    };
    return colors[priority] || 'border-s-gray-300';
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
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
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
    { value: 'Low', label: t('ticketsPage.priorityLow') },
    { value: 'Medium', label: t('ticketsPage.priorityMedium') },
    { value: 'High', label: t('ticketsPage.priorityHigh') },
    { value: 'Critical', label: t('ticketsPage.priorityCritical') },
  ];

  const statusOptions = [
    { value: 'New', label: t('ticketsPage.statusNew') },
    { value: 'Open', label: t('ticketsPage.statusOpen') },
    { value: 'InProgress', label: t('ticketsPage.statusInProgress') },
    { value: 'Pending', label: t('ticketsPage.statusPending') },
    { value: 'Resolved', label: t('ticketsPage.statusResolved') },
    { value: 'Closed', label: t('ticketsPage.statusClosed') },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('ticketsPage.kanbanTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('ticketsPage.kanbanSubtitle')}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('ticketsPage.kanbanTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('ticketsPage.kanbanSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            {t('ticketsPage.allTickets')}
          </Button>
          <Button
            variant={filter === 'my' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('my')}
          >
            {t('ticketsPage.myTickets')}
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
        title={`${t('ticketsPage.ticketNumber')} ${selectedTicket?.ticketNumber || ''}`}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Header */}
            <div className={`p-4 rounded-lg border-s-4 ${getPriorityColor(selectedTicket.priority)} bg-gray-50 dark:bg-gray-800/50`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedTicket.subject}
                </h3>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedTicket.description || t('ticketsPage.noDescription')}
              </p>
            </div>

            {/* Ticket Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.status')}</span>
                <div className="mt-2 flex items-center gap-2">
                  {getStatusIcon(selectedTicket.status)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('ticketsPage.priority')}</span>
                <div className="mt-2">
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('ticketsPage.customer')}</span>
                <div className="mt-2 flex items-center gap-2">
                  {(selectedTicket.customerName || getCustomerName(selectedTicket.customerId)) ? (
                    <>
                      <div className={`w-6 h-6 rounded-full ${getAvatarColor(selectedTicket.customerName || getCustomerName(selectedTicket.customerId) || '')} flex items-center justify-center text-white text-xs font-medium`}>
                        {getInitials(selectedTicket.customerName || getCustomerName(selectedTicket.customerId) || '')}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedTicket.customerName || getCustomerName(selectedTicket.customerId)}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">{t('ticketsPage.notSpecified')}</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('ticketsPage.assignedTo')}</span>
                <div className="mt-2 flex items-center gap-2">
                  {(selectedTicket.assignedAgentName || getAgentName(selectedTicket.assignedAgentId)) ? (
                    <>
                      <div className={`w-6 h-6 rounded-full ${getAvatarColor(selectedTicket.assignedAgentName || getAgentName(selectedTicket.assignedAgentId) || '')} flex items-center justify-center text-white text-xs font-medium`}>
                        {getInitials(selectedTicket.assignedAgentName || getAgentName(selectedTicket.assignedAgentId) || '')}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedTicket.assignedAgentName || getAgentName(selectedTicket.assignedAgentId)}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400 italic">{t('ticketsPage.unassigned')}</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('ticketsPage.created')}</span>
                <p className="mt-2 text-sm text-gray-900 dark:text-white">
                  {formatDate(selectedTicket.createdAt)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('ticketsPage.lastUpdated')}</span>
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
                {t('common.close')}
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleEditClick(selectedTicket);
              }} className="w-full sm:w-auto">
                <Edit className="w-4 h-4 me-2" />
                {t('ticketsPage.editTicket')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Ticket Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('ticketsPage.editTicket')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('ticketsPage.subject')}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder={t('ticketsPage.subjectPlaceholder')}
            required
          />
          <Textarea
            label={t('ticketsPage.description')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('ticketsPage.descriptionPlaceholder')}
            rows={4}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('ticketsPage.priority')}
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />
            <Select
              label={t('common.status')}
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('ticketsPage.customer')}
              options={[{ value: '', label: t('ticketsPage.selectCustomer') }, ...customerOptions]}
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            />
            <Select
              label={t('ticketsPage.assignedAgent')}
              options={[{ value: '', label: t('ticketsPage.unassigned') }, ...agentOptions]}
              value={formData.assignedAgentId || ''}
              onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={updateTicketMutation.isPending}
              className="w-full sm:w-auto"
            >
              {t('ticketsPage.updateTicket')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TicketsKanban;
