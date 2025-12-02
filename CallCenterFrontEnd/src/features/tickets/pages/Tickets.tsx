import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../api/client';
import { Button, Badge, Card, CardContent, Modal, Input, Select, Textarea } from '../../../components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { SkeletonTable, EmptyStateNoData } from '../../../components/ui';
import { useToast } from '../../../store/toastStore';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const tableRowVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  customerId: string;
  customerName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketFormData {
  subject: string;
  description: string;
  priority: string;
  status: string;
  customerId: string;
  assignedAgentId?: string;
}

const initialFormData: TicketFormData = {
  subject: '',
  description: '',
  priority: 'Medium',
  status: 'New',
  customerId: '',
  assignedAgentId: '',
};

const Tickets = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState<TicketFormData>(initialFormData);

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await apiClient.get('/tickets');
      return response.data;
    },
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await apiClient.get('/customers');
      return response.data;
    },
  });

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get('/agents');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TicketFormData) => apiClient.post('/tickets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsModalOpen(false);
      resetForm();
      showToast('Ticket created successfully', 'success');
    },
    onError: () => {
      showToast('Failed to create ticket', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: TicketFormData }) =>
      apiClient.put(`/tickets/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsModalOpen(false);
      resetForm();
      showToast('Ticket updated successfully', 'success');
    },
    onError: () => {
      showToast('Failed to update ticket', 'error');
    },
  });

  const tickets = Array.isArray(ticketsData) ? ticketsData : (ticketsData?.data || ticketsData?.items || []);
  const customers = Array.isArray(customersData) ? customersData : (customersData?.data || customersData?.items || []);
  const agents = Array.isArray(agentsData) ? agentsData : (agentsData?.data || agentsData?.items || []);

  const filteredTickets = tickets.filter((ticket: Ticket) =>
    ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedTicket(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      subject: ticket.subject,
      description: ticket.description || '',
      priority: ticket.priority,
      status: ticket.status,
      customerId: ticket.customerId,
      assignedAgentId: ticket.assignedAgentId || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicket) {
      updateMutation.mutate({ id: selectedTicket.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
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
    return <Badge variant={variants[status] || 'default'}>{t(`ticketStatus.${status.toLowerCase()}`) || status}</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const customerOptions = customers.map((customer: { id: string; name: string }) => ({
    value: customer.id,
    label: customer.name,
  }));

  const agentOptions = agents.map((agent: { id: string; name: string }) => ({
    value: agent.id,
    label: agent.name,
  }));

  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      {/* Page header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.tickets')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage support tickets and issues
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleOpenCreate}>
            <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Ticket
          </Button>
        </motion.div>
      </motion.div>

      {/* Search and filters */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline">{t('common.filter')}</Button>
            <Button variant="outline">{t('common.export')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets table */}
      <Card variant="bordered">
        {isLoading ? (
          <CardContent>
            <SkeletonTable rows={5} columns={7} />
          </CardContent>
        ) : filteredTickets.length === 0 ? (
          <CardContent>
            <EmptyStateNoData
              title="No tickets found"
              description="Get started by creating your first ticket"
              actionLabel="Create Ticket"
              onAction={handleOpenCreate}
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredTickets.map((ticket: Ticket, index: number) => (
                  <motion.tr
                    key={ticket.id}
                    variants={tableRowVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{ticket.subject}</div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{ticket.assignedAgentName || '-'}</TableCell>
                    <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenView(ticket)}>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(ticket)}>
                          {t('common.edit')}
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTicket ? 'Edit Ticket' : 'Create New Ticket'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {selectedTicket ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Ticket ${selectedTicket?.ticketNumber}`}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedTicket.subject}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {selectedTicket.description || 'No description provided'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Priority</span>
                <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Assigned To</span>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {selectedTicket.assignedAgentName || 'Unassigned'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {formatDate(selectedTicket.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleOpenEdit(selectedTicket);
              }}>
                Edit Ticket
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Tickets;
