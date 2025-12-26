import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../api/client';
import { Button, Badge, Card, CardContent, Modal, Input, Select, Textarea, Pagination } from '../../../components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { SkeletonTable, EmptyStateNoData } from '../../../components/ui';
import { useToast } from '../../../store/toastStore';
import {
  Search,
  Plus,
  Edit,
  Eye,
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Grid3X3,
  List,
  ChevronDown,
  User,
  Calendar,
  MessageSquare,
  ArrowUpRight,
  MoreVertical,
} from 'lucide-react';
import { TicketAttachments } from '../components/TicketAttachments';
import { TicketStatusHistory } from '../components/TicketStatusHistory';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const tableRowVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState<TicketFormData>(initialFormData);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const tickets: Ticket[] = Array.isArray(ticketsData) ? ticketsData : (ticketsData?.data || ticketsData?.items || []);
  const customers = Array.isArray(customersData) ? customersData : (customersData?.data || customersData?.items || []);
  const agents = Array.isArray(agentsData) ? agentsData : (agentsData?.data || agentsData?.items || []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = tickets.length;
    const newTickets = tickets.filter((t: Ticket) => t.status === 'New').length;
    const open = tickets.filter((t: Ticket) => t.status === 'Open').length;
    const inProgress = tickets.filter((t: Ticket) => t.status === 'InProgress').length;
    const pending = tickets.filter((t: Ticket) => t.status === 'Pending').length;
    const resolved = tickets.filter((t: Ticket) => t.status === 'Resolved').length;
    const closed = tickets.filter((t: Ticket) => t.status === 'Closed').length;
    const critical = tickets.filter((t: Ticket) => t.priority === 'Critical').length;
    const high = tickets.filter((t: Ticket) => t.priority === 'High').length;
    return { total, newTickets, open, inProgress, pending, resolved, closed, critical, high };
  }, [tickets]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket: Ticket) => {
      const matchesSearch =
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: 'status' | 'priority', value: string) => {
    if (type === 'status') setStatusFilter(value);
    else setPriorityFilter(value);
    setCurrentPage(1);
  };

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

  const formatRelativeTime = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
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

  return (
    <motion.div
      className="space-y-6 p-1"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      {/* Page header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.tickets')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage support tickets and track issues
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.open + stats.newTickets}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ArrowUpRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.resolved}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical/High</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.critical + stats.high}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search and filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket number, subject, or customer..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                    {(statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Open">Open</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setPriorityFilter('all');
                      }}
                      className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Clear all filters
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2.5 ${viewMode === 'table' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>

            {/* Export button */}
            <Button variant="outline" className="hidden sm:inline-flex">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Active filters chips */}
        {(statusFilter !== 'all' || priorityFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Status: {statusFilter === 'InProgress' ? 'In Progress' : statusFilter}
                <button onClick={() => setStatusFilter('all')} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Priority: {priorityFilter}
                <button onClick={() => setPriorityFilter('all')} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          Showing {paginatedTickets.length} of {filteredTickets.length} tickets
          {filteredTickets.length !== tickets.length && ` (filtered from ${tickets.length})`}
        </span>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden">
          {isLoading ? (
            <CardContent>
              <SkeletonTable rows={5} columns={7} />
            </CardContent>
          ) : paginatedTickets.length === 0 ? (
            <CardContent>
              <EmptyStateNoData
                title={filteredTickets.length === 0 && tickets.length > 0 ? "No matching tickets" : "No tickets found"}
                description={filteredTickets.length === 0 && tickets.length > 0 ? "Try adjusting your search or filters" : "Get started by creating your first ticket"}
                actionLabel="Create Ticket"
                onAction={handleOpenCreate}
              />
            </CardContent>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Ticket #</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="hidden lg:table-cell">Customer</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Assigned</TableHead>
                      <TableHead className="hidden sm:table-cell">Created</TableHead>
                      <TableHead className="text-end w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedTickets.map((ticket: Ticket, index: number) => (
                        <motion.tr
                          key={ticket.id}
                          variants={tableRowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ delay: index * 0.03 }}
                          className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group border-l-4 ${getPriorityColor(ticket.priority)}`}
                        >
                          <TableCell>
                            <span className="font-mono text-sm font-medium text-primary-600 dark:text-primary-400">
                              {ticket.ticketNumber}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate max-w-[250px]">
                                {ticket.subject}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[250px] lg:hidden">
                                {ticket.customerName || 'No customer'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full ${getAvatarColor(ticket.customerName || '')} flex items-center justify-center text-white text-xs font-medium`}>
                                {getInitials(ticket.customerName || '')}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                                {ticket.customerName || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(ticket.status)}
                              {getStatusBadge(ticket.status)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {ticket.assignedAgentName ? (
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${getAvatarColor(ticket.assignedAgentName)} flex items-center justify-center text-white text-xs font-medium`}>
                                  {getInitials(ticket.assignedAgentName)}
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                                  {ticket.assignedAgentName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(ticket.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenView(ticket)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(ticket)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : paginatedTickets.length === 0 ? (
            <Card className="p-8">
              <EmptyStateNoData
                title={filteredTickets.length === 0 && tickets.length > 0 ? "No matching tickets" : "No tickets found"}
                description={filteredTickets.length === 0 && tickets.length > 0 ? "Try adjusting your search or filters" : "Get started by creating your first ticket"}
                actionLabel="Create Ticket"
                onAction={handleOpenCreate}
              />
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {paginatedTickets.map((ticket: Ticket, index: number) => (
                    <motion.div
                      key={ticket.id}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`p-4 hover:shadow-lg transition-all duration-200 group border-l-4 ${getPriorityColor(ticket.priority)}`}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-primary-600 dark:text-primary-400">
                              {ticket.ticketNumber}
                            </span>
                            {getPriorityBadge(ticket.priority)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleOpenView(ticket)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Subject */}
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {ticket.subject}
                        </h3>

                        {/* Description preview */}
                        {ticket.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                            {ticket.description}
                          </p>
                        )}

                        {/* Customer & Agent */}
                        <div className="space-y-2 mb-4">
                          {ticket.customerName && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <User className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{ticket.customerName}</span>
                            </div>
                          )}
                          {ticket.assignedAgentName && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <MessageSquare className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">Assigned to {ticket.assignedAgentName}</span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(ticket.status)}
                            {getStatusBadge(ticket.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatRelativeTime(ticket.createdAt)}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenView(ticket)}
                                className="h-7 w-7 p-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(ticket)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTicket ? 'Edit Ticket' : 'Create New Ticket'}
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
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {selectedTicket ? 'Update Ticket' : 'Create Ticket'}
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
                  {selectedTicket.customerName && (
                    <>
                      <div className={`w-6 h-6 rounded-full ${getAvatarColor(selectedTicket.customerName)} flex items-center justify-center text-white text-xs font-medium`}>
                        {getInitials(selectedTicket.customerName)}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedTicket.customerName}</span>
                    </>
                  )}
                  {!selectedTicket.customerName && <span className="text-sm text-gray-400">Not specified</span>}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned To</span>
                <div className="mt-2 flex items-center gap-2">
                  {selectedTicket.assignedAgentName ? (
                    <>
                      <div className={`w-6 h-6 rounded-full ${getAvatarColor(selectedTicket.assignedAgentName)} flex items-center justify-center text-white text-xs font-medium`}>
                        {getInitials(selectedTicket.assignedAgentName)}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedTicket.assignedAgentName}</span>
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
                handleOpenEdit(selectedTicket);
              }} className="w-full sm:w-auto">
                <Edit className="w-4 h-4 mr-2" />
                Edit Ticket
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Click outside to close filter dropdown */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default Tickets;
