import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../api/client';
import { Button, Badge, Card, CardContent, Modal, Input, Select, Textarea, Pagination } from '../../../components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { SkeletonTable, EmptyStateNoData } from '../../../components/ui';
import { useToast } from '../../../store/toastStore';
import { CustomerNotes } from '../components/CustomerNotes';
import { useCallCenter } from '../../../context/CallCenterContext';
import { useAuthStore } from '../../../store/authStore';
import { initiateOutboundCall } from '../../../api/callApi';
import { IncomingCallBanner } from '../../../components/call-center';
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Users,
  Crown,
  UserCheck,
  UserPlus,
  Filter,
  Download,
  Grid3X3,
  List,
  ChevronDown,
  Mail,
  Phone,
  PhoneOutgoing,
  Loader2,
  Building2,
  Calendar,
  MessageSquare,
  MoreVertical,
} from 'lucide-react';

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

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: string;
  notes?: string;
  createdAt: string;
  totalTickets?: number;
  totalCalls?: number;
  lastInteraction?: string;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: string;
  notes?: string;
}

const initialFormData: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  type: 'Regular',
  notes: '',
};

const Customers = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { twilioReady, activeCall, setAgentIdentity } = useCallCenter();
  const user = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-initialize Twilio Device with current user's email for Click-to-Call
  useEffect(() => {
    if (user?.email && !twilioReady) {
      setAgentIdentity(user.email);
    }
  }, [user?.email, twilioReady, setAgentIdentity]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewingNotesCustomer, setViewingNotesCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [callingCustomerId, setCallingCustomerId] = useState<string | null>(null);

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await apiClient.get('/customers');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => apiClient.post('/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      resetForm();
      showToast(t('customersPage.createdSuccess'), 'success');
    },
    onError: () => {
      showToast(t('customersPage.createdError'), 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: CustomerFormData }) =>
      apiClient.put(`/customers/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      resetForm();
      showToast(t('customersPage.updatedSuccess'), 'success');
    },
    onError: () => {
      showToast(t('customersPage.updatedError'), 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      showToast(t('customersPage.deletedSuccess'), 'success');
    },
    onError: () => {
      showToast(t('customersPage.deletedError'), 'error');
    },
  });

  const callMutation = useMutation({
    mutationFn: (data: { customerId: string; customerNumber: string }) =>
      initiateOutboundCall({
        customerNumber: data.customerNumber,
        customerId: data.customerId,
      }),
    onSuccess: () => {
      showToast(t('customersPage.callSuccess'), 'success');
      setCallingCustomerId(null);
    },
    onError: (error: Error) => {
      showToast(error.message || t('customersPage.callError'), 'error');
      setCallingCustomerId(null);
    },
  });

  const handleClickToCall = (customer: Customer) => {
    if (!customer.phone || !twilioReady || activeCall) return;
    setCallingCustomerId(customer.id);
    callMutation.mutate({
      customerId: customer.id,
      customerNumber: customer.phone,
    });
  };

  const customers: Customer[] = Array.isArray(customersData) ? customersData : (customersData?.data || customersData?.items || []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = customers.length;
    const premium = customers.filter((c: Customer) => c.type === 'Premium').length;
    const regular = customers.filter((c: Customer) => c.type === 'Regular').length;
    const newCustomers = customers.filter((c: Customer) => c.type === 'New').length;
    const withCompany = customers.filter((c: Customer) => c.company).length;
    return { total, premium, regular, newCustomers, withCompany };
  }, [customers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer: Customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        (customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesType = typeFilter === 'all' || customer.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [customers, searchTerm, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedCustomer(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company || '',
      type: customer.type,
      notes: customer.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer) {
      updateMutation.mutate({ id: selectedCustomer.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (selectedCustomer) {
      deleteMutation.mutate(selectedCustomer.id);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Premium: t('customersPage.premium'),
      Regular: t('customersPage.regular'),
      New: t('customersPage.new'),
    };
    return labels[type] || type;
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { variant: 'success' | 'info' | 'default'; icon: React.ReactNode }> = {
      Premium: { variant: 'success', icon: <Crown className="w-3 h-3 me-1" /> },
      Regular: { variant: 'info', icon: <UserCheck className="w-3 h-3 me-1" /> },
      New: { variant: 'default', icon: <UserPlus className="w-3 h-3 me-1" /> },
    };
    const { variant, icon } = config[type] || { variant: 'default' as const, icon: null };
    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {getTypeLabel(type)}
      </Badge>
    );
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Premium: 'border-s-yellow-500',
      Regular: 'border-s-blue-500',
      New: 'border-s-green-500',
    };
    return colors[type] || 'border-s-gray-300';
  };

  const isArabic = i18n.language === 'ar';

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

    if (diffMins < 60) return t('customersPage.mAgo', { count: diffMins });
    if (diffHours < 24) return t('customersPage.hAgo', { count: diffHours });
    if (diffDays < 7) return t('customersPage.dAgo', { count: diffDays });
    return formatDate(dateString);
  };

  const typeOptions = [
    { value: 'New', label: t('customersPage.new') },
    { value: 'Regular', label: t('customersPage.regular') },
    { value: 'Premium', label: t('customersPage.premium') },
  ];

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
    <>
      {/* Incoming call banner for outbound calls */}
      <IncomingCallBanner />

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.customers')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('customersPage.subtitle')}
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 me-2" />
            {t('customersPage.addCustomer')}
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('customersPage.totalCustomers')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('customersPage.premium')}</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.premium}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('customersPage.regular')}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.regular}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('customersPage.new')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.newCustomers}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <UserPlus className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('customersPage.business')}</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.withCompany}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search and filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('customersPage.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                <Filter className="w-4 h-4 me-2" />
                {t('customersPage.filters')}
                {typeFilter !== 'all' && (
                  <span className="ms-2 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">1</span>
                )}
                <ChevronDown className="w-4 h-4 ms-2" />
              </button>

              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute end-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('customersPage.customerType')}</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">{t('customersPage.allTypes')}</option>
                      <option value="Premium">{t('customersPage.premium')}</option>
                      <option value="Regular">{t('customersPage.regular')}</option>
                      <option value="New">{t('customersPage.new')}</option>
                    </select>
                  </div>
                  {typeFilter !== 'all' && (
                    <button
                      onClick={() => setTypeFilter('all')}
                      className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      {t('customersPage.clearAllFilters')}
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
              <Download className="w-4 h-4 me-2" />
              {t('customersPage.exportBtn')}
            </Button>
          </div>
        </div>

        {/* Active filters chips */}
        {typeFilter !== 'all' && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {t('common.type')}: {getTypeLabel(typeFilter)}
              <button onClick={() => setTypeFilter('all')} className="ms-2 text-gray-500 hover:text-gray-700">×</button>
            </span>
          </div>
        )}
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          {t('customersPage.showing')} {paginatedCustomers.length} {t('customersPage.of')} {filteredCustomers.length} {t('customersPage.customers')}
          {filteredCustomers.length !== customers.length && ` (${t('customersPage.filteredFrom')} ${customers.length})`}
        </span>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden">
          {isLoading ? (
            <CardContent>
              <SkeletonTable rows={5} columns={7} />
            </CardContent>
          ) : paginatedCustomers.length === 0 ? (
            <CardContent>
              <EmptyStateNoData
                title={filteredCustomers.length === 0 && customers.length > 0 ? t('customersPage.noMatchingCustomers') : t('customersPage.noCustomersFound')}
                description={filteredCustomers.length === 0 && customers.length > 0 ? t('customersPage.tryAdjusting') : t('customersPage.getStarted')}
                actionLabel={t('customersPage.addCustomer')}
                onAction={handleOpenCreate}
              />
            </CardContent>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('customersPage.customer')}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t('customersPage.email')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('customersPage.phone')}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t('customersPage.company')}</TableHead>
                      <TableHead>{t('common.type')}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t('customersPage.created')}</TableHead>
                      <TableHead className="text-end w-[120px]">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedCustomers.map((customer: Customer, index: number) => (
                        <motion.tr
                          key={customer.id}
                          variants={tableRowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ delay: index * 0.03 }}
                          className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group border-s-4 ${getTypeColor(customer.type)}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-white font-medium`}>
                                {getInitials(customer.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate lg:hidden">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{customer.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span>{customer.phone}</span>
                              {customer.phone && twilioReady && !activeCall && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClickToCall(customer);
                                  }}
                                  disabled={callingCustomerId === customer.id}
                                  className="p-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors disabled:opacity-50 ms-1"
                                  title={t('customersPage.callCustomer')}
                                >
                                  {callingCustomerId === customer.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <PhoneOutgoing className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {customer.company ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Building2 className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate max-w-[120px]">{customer.company}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getTypeBadge(customer.type)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(customer.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewingNotesCustomer(customer)}
                                className="h-8 w-8 p-0"
                                title={t('customersPage.viewNotes')}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenView(customer)}
                                className="h-8 w-8 p-0"
                                title={t('customersPage.viewDetails')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(customer)}
                                className="h-8 w-8 p-0"
                                title={t('common.edit')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDelete(customer)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                title={t('common.delete')}
                              >
                                <Trash2 className="w-4 h-4" />
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
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : paginatedCustomers.length === 0 ? (
            <Card className="p-8">
              <EmptyStateNoData
                title={filteredCustomers.length === 0 && customers.length > 0 ? t('customersPage.noMatchingCustomers') : t('customersPage.noCustomersFound')}
                description={filteredCustomers.length === 0 && customers.length > 0 ? t('customersPage.tryAdjusting') : t('customersPage.getStarted')}
                actionLabel={t('customersPage.addCustomer')}
                onAction={handleOpenCreate}
              />
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {paginatedCustomers.map((customer: Customer, index: number) => (
                    <motion.div
                      key={customer.id}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`p-4 hover:shadow-lg transition-all duration-200 group border-s-4 ${getTypeColor(customer.type)}`}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-white text-lg font-medium`}>
                              {getInitials(customer.name)}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {customer.name}
                              </h3>
                              {getTypeBadge(customer.type)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleOpenView(customer)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span>{customer.phone}</span>
                            </div>
                            {customer.phone && twilioReady && !activeCall && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClickToCall(customer);
                                }}
                                disabled={callingCustomerId === customer.id}
                                className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors disabled:opacity-50"
                                title={t('customersPage.callCustomer')}
                              >
                                {callingCustomerId === customer.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <PhoneOutgoing className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                          {customer.company && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{customer.company}</span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatRelativeTime(customer.createdAt)}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingNotesCustomer(customer)}
                              className="h-7 w-7 p-0"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenView(customer)}
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(customer)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
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
        title={selectedCustomer ? t('customersPage.editCustomer') : t('customersPage.addNewCustomer')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('customersPage.fullName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('customersPage.fullNamePlaceholder')}
              required
            />
            <Input
              label={t('customersPage.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('customersPage.emailPlaceholder')}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('customersPage.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t('customersPage.phonePlaceholder')}
              required
            />
            <Input
              label={t('customersPage.company')}
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder={t('customersPage.companyPlaceholder')}
            />
          </div>
          <Select
            label={t('customersPage.customerType')}
            options={typeOptions}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
          <Textarea
            label={t('customersPage.notes')}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder={t('customersPage.notesPlaceholder')}
            rows={3}
          />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {selectedCustomer ? t('customersPage.updateCustomer') : t('customersPage.createCustomer')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={t('customersPage.customerDetails')}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Header */}
            <div className={`p-4 rounded-lg border-s-4 ${getTypeColor(selectedCustomer.type)} bg-gray-50 dark:bg-gray-800/50`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${getAvatarColor(selectedCustomer.name)} flex items-center justify-center text-white text-2xl font-medium`}>
                  {getInitials(selectedCustomer.name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedCustomer.name}
                  </h3>
                  <div className="mt-1">
                    {getTypeBadge(selectedCustomer.type)}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('customersPage.email')}</span>
                <div className="mt-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.email}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('customersPage.phone')}</span>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.phone && twilioReady && !activeCall && (
                    <button
                      onClick={() => handleClickToCall(selectedCustomer)}
                      disabled={callingCustomerId === selectedCustomer.id}
                      className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors disabled:opacity-50"
                      title={t('customersPage.callCustomer')}
                    >
                      {callingCustomerId === selectedCustomer.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <PhoneOutgoing className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('customersPage.company')}</span>
                <div className="mt-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.company || t('customersPage.notSpecified')}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('customersPage.customerSince')}</span>
                <div className="mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedCustomer.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedCustomer.notes && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('customersPage.notes')}</span>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {selectedCustomer.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="w-full sm:w-auto">
                {t('common.close')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingNotesCustomer(selectedCustomer);
                }}
                className="w-full sm:w-auto"
              >
                <MessageSquare className="w-4 h-4 me-2" />
                {t('customersPage.viewNotes')}
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleOpenEdit(selectedCustomer);
              }} className="w-full sm:w-auto">
                <Edit className="w-4 h-4 me-2" />
                {t('customersPage.editCustomer')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('customersPage.deleteCustomer')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('customersPage.deleteConfirm')} <strong>{selectedCustomer?.name}</strong>? {t('customersPage.deleteWarning')}
          </p>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
              className="w-full sm:w-auto"
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Customer Notes Slide-over Panel */}
      <AnimatePresence>
        {viewingNotesCustomer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setViewingNotesCustomer(null)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: isArabic ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isArabic ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 end-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50"
            >
              <CustomerNotes
                customerId={viewingNotesCustomer.id}
                customerName={viewingNotesCustomer.name}
                onClose={() => setViewingNotesCustomer(null)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside to close filter dropdown */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </motion.div>
    </>
  );
};

export default Customers;
