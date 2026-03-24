import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../api/client';
import { Button, Badge, Card, CardContent, Modal, Input, Select, Pagination } from '../../../components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { SkeletonTable, EmptyStateNoData } from '../../../components/ui';
import { useToast } from '../../../store/toastStore';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Coffee,
  Phone,
  Mail,
  Filter,
  Download,
  MoreVertical,
  Grid3X3,
  List,
  ChevronDown,
} from 'lucide-react';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const }
  },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  },
};

const tableRowVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 }
  }
};

const ITEMS_PER_PAGE = 10;

interface Agent {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  teamId?: string;
  teamName?: string;
  currentState?: string;
  avatarUrl?: string;
}

interface AgentFormData {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  teamId?: string;
}

const initialFormData: AgentFormData = {
  employeeId: '',
  name: '',
  email: '',
  phone: '',
  role: 'Agent',
  status: 'Active',
  teamId: '',
};

const Agents = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<AgentFormData>(initialFormData);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get('/agents');
      return response.data;
    },
  });

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await apiClient.get('/teams');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AgentFormData) => {
      // Transform payload to match backend expectations
      const requestPayload = {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        role: data.role,
        teamId: data.teamId || null, // Send null instead of empty string
        skillLevel: 1, // Default skill level
      };
      return apiClient.post('/agents', requestPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setIsModalOpen(false);
      resetForm();
      showToast(t('agentsPage.agentCreated'), 'success');
    },
    onError: () => {
      showToast(t('agentsPage.createFailed'), 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: AgentFormData }) => {
      // Transform payload to match backend expectations
      const requestPayload = {
        name: data.payload.name,
        email: data.payload.email,
        phone: data.payload.phone || null,
        role: data.payload.role,
        status: data.payload.status,
        teamId: data.payload.teamId || null, // Send null instead of empty string
        skillLevel: 1, // Default skill level
      };
      return apiClient.put(`/agents/${data.id}`, requestPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setIsModalOpen(false);
      resetForm();
      showToast(t('agentsPage.agentUpdated'), 'success');
    },
    onError: () => {
      showToast(t('agentsPage.updateFailed'), 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/agents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setIsDeleteModalOpen(false);
      setSelectedAgent(null);
      showToast(t('agentsPage.agentDeleted'), 'success');
    },
    onError: () => {
      showToast(t('agentsPage.deleteFailed'), 'error');
    },
  });

  const agents: Agent[] = Array.isArray(agentsData) ? agentsData : (agentsData?.data || agentsData?.items || []);
  const teams = Array.isArray(teamsData) ? teamsData : (teamsData?.data || teamsData?.items || []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = agents.length;
    const active = agents.filter((a: Agent) => a.status === 'Active').length;
    const inactive = agents.filter((a: Agent) => a.status === 'Inactive').length;
    const onLeave = agents.filter((a: Agent) => a.status === 'OnLeave').length;
    const available = agents.filter((a: Agent) => a.currentState === 'Available').length;
    const busy = agents.filter((a: Agent) => a.currentState === 'Busy').length;
    const onBreak = agents.filter((a: Agent) => a.currentState === 'Break').length;
    return { total, active, inactive, onLeave, available, busy, onBreak };
  }, [agents]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent: Agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
      const matchesRole = roleFilter === 'all' || agent.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [agents, searchTerm, statusFilter, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: 'status' | 'role', value: string) => {
    if (type === 'status') setStatusFilter(value);
    else setRoleFilter(value);
    setCurrentPage(1);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedAgent(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      employeeId: agent.employeeId,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      role: agent.role,
      status: agent.status,
      teamId: agent.teamId || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAgent) {
      updateMutation.mutate({ id: selectedAgent.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (selectedAgent) {
      deleteMutation.mutate(selectedAgent.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      Active: 'success',
      Inactive: 'danger',
      OnLeave: 'warning',
    };
    const statusLabels: Record<string, string> = {
      Active: t('agentsPage.statusActive'),
      Inactive: t('agentsPage.statusInactive'),
      OnLeave: t('agentsPage.statusOnLeave'),
      Terminated: t('agentsPage.statusTerminated'),
    };
    return <Badge variant={variants[status] || 'default'}>{statusLabels[status] || status}</Badge>;
  };

  const getStateIndicator = (state?: string) => {
    const colors: Record<string, string> = {
      Available: 'bg-green-500',
      Busy: 'bg-red-500',
      Break: 'bg-yellow-500',
      Offline: 'bg-gray-400',
      ACW: 'bg-purple-500',
      Meeting: 'bg-blue-500',
    };
    return colors[state || ''] || 'bg-gray-400';
  };

  const getStateLabel = (state?: string) => {
    if (!state) return t('agentsPage.stateOffline');
    const labels: Record<string, string> = {
      Available: t('agentsPage.stateAvailable'),
      Busy: t('agentsPage.stateOnCall'),
      Break: t('agentsPage.stateOnBreak'),
      Offline: t('agentsPage.stateOffline'),
      ACW: t('agentsPage.stateAfterCall'),
      Meeting: t('agentsPage.stateInMeeting'),
    };
    return labels[state] || state;
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      Agent: t('agentsPage.roleAgent'),
      Supervisor: t('agentsPage.roleSupervisor'),
      QaEvaluator: t('agentsPage.roleQaEvaluator'),
      Admin: t('agentsPage.roleAdmin'),
    };
    return roleLabels[role] || role;
  };

  const roleOptions = [
    { value: 'Agent', label: t('agentsPage.roleAgent') },
    { value: 'Supervisor', label: t('agentsPage.roleSupervisor') },
    { value: 'QaEvaluator', label: t('agentsPage.roleQaEvaluator') },
    { value: 'Admin', label: t('agentsPage.roleAdmin') },
  ];

  const statusOptions = [
    { value: 'Active', label: t('agentsPage.statusActive') },
    { value: 'Inactive', label: t('agentsPage.statusInactive') },
    { value: 'OnLeave', label: t('agentsPage.statusOnLeave') },
    { value: 'Terminated', label: t('agentsPage.statusTerminated') },
  ];

  const teamOptions = teams.map((team: { id: string; name: string }) => ({
    value: team.id,
    label: team.name,
  }));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getStatusFilterLabel = (status: string) => {
    const labels: Record<string, string> = {
      Active: t('agentsPage.statusActive'),
      Inactive: t('agentsPage.statusInactive'),
      OnLeave: t('agentsPage.statusOnLeave'),
    };
    return labels[status] || status;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.agents')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('agentsPage.subtitle')}
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 me-2" />
            {t('agentsPage.addAgent')}
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('agentsPage.totalAgents')}</p>
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('agentsPage.active')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('agentsPage.available')}</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.available}</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Phone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('agentsPage.onBreak')}</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.onBreak}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Coffee className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
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
              placeholder={t('agentsPage.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status filter */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4 me-2" />
                {t('agentsPage.filters')}
                {(statusFilter !== 'all' || roleFilter !== 'all') && (
                  <span className="ms-2 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                    {(statusFilter !== 'all' ? 1 : 0) + (roleFilter !== 'all' ? 1 : 0)}
                  </span>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('agentsPage.statusLabel')}</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">{t('agentsPage.allStatuses')}</option>
                      <option value="Active">{t('agentsPage.statusActive')}</option>
                      <option value="Inactive">{t('agentsPage.statusInactive')}</option>
                      <option value="OnLeave">{t('agentsPage.statusOnLeave')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('agentsPage.roleLabel')}</label>
                    <select
                      value={roleFilter}
                      onChange={(e) => handleFilterChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">{t('agentsPage.allRoles')}</option>
                      <option value="Agent">{t('agentsPage.roleAgent')}</option>
                      <option value="Supervisor">{t('agentsPage.roleSupervisor')}</option>
                      <option value="Admin">{t('agentsPage.roleAdmin')}</option>
                    </select>
                  </div>
                  {(statusFilter !== 'all' || roleFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setRoleFilter('all');
                      }}
                      className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      {t('agentsPage.clearAllFilters')}
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
              {t('agentsPage.exportBtn')}
            </Button>
          </div>
        </div>

        {/* Active filters chips */}
        {(statusFilter !== 'all' || roleFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {t('agentsPage.statusLabel')}: {getStatusFilterLabel(statusFilter)}
                <button onClick={() => setStatusFilter('all')} className="ms-2 text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
            {roleFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {t('agentsPage.roleLabel')}: {getRoleLabel(roleFilter)}
                <button onClick={() => setRoleFilter('all')} className="ms-2 text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          {t('agentsPage.showing')} {paginatedAgents.length} {t('agentsPage.of')} {filteredAgents.length} {t('agentsPage.agentsLabel')}
          {filteredAgents.length !== agents.length && ` (${t('agentsPage.filteredFrom')} ${agents.length})`}
        </span>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden">
          {isLoading ? (
            <CardContent>
              <SkeletonTable rows={5} columns={7} />
            </CardContent>
          ) : paginatedAgents.length === 0 ? (
            <CardContent>
              <EmptyStateNoData
                title={filteredAgents.length === 0 && agents.length > 0 ? t('agentsPage.noMatchingAgents') : t('agentsPage.noAgentsFound')}
                description={filteredAgents.length === 0 && agents.length > 0 ? t('agentsPage.adjustFilters') : t('agentsPage.getStarted')}
                actionLabel={t('agentsPage.addAgent')}
                onAction={handleOpenCreate}
              />
            </CardContent>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">{t('agentsPage.agentColumn')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('agentsPage.employeeId')}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t('agentsPage.contact')}</TableHead>
                      <TableHead>{t('agentsPage.role')}</TableHead>
                      <TableHead>{t('agentsPage.status')}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t('agentsPage.state')}</TableHead>
                      <TableHead className="text-end w-[100px]">{t('agentsPage.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedAgents.map((agent: Agent, index: number) => (
                        <motion.tr
                          key={agent.id}
                          variants={tableRowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className={`w-10 h-10 rounded-full ${getAvatarColor(agent.name)} flex items-center justify-center text-white font-medium text-sm`}>
                                  {getInitials(agent.name)}
                                </div>
                                <span className={`absolute bottom-0 end-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStateIndicator(agent.currentState)}`}></span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">{agent.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate md:hidden">{agent.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{agent.employeeId}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[180px]">{agent.email}</span>
                              </div>
                              {agent.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{agent.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="whitespace-nowrap">{getRoleLabel(agent.role)}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(agent.status)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${getStateIndicator(agent.currentState)}`}></span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{getStateLabel(agent.currentState)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(agent)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDelete(agent)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : paginatedAgents.length === 0 ? (
            <Card className="p-8">
              <EmptyStateNoData
                title={filteredAgents.length === 0 && agents.length > 0 ? t('agentsPage.noMatchingAgents') : t('agentsPage.noAgentsFound')}
                description={filteredAgents.length === 0 && agents.length > 0 ? t('agentsPage.adjustFilters') : t('agentsPage.getStarted')}
                actionLabel={t('agentsPage.addAgent')}
                onAction={handleOpenCreate}
              />
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {paginatedAgents.map((agent: Agent, index: number) => (
                    <motion.div
                      key={agent.id}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`w-12 h-12 rounded-full ${getAvatarColor(agent.name)} flex items-center justify-center text-white font-medium`}>
                                {getInitials(agent.name)}
                              </div>
                              <span className={`absolute bottom-0 end-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${getStateIndicator(agent.currentState)}`}></span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{agent.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleLabel(agent.role)}</p>
                            </div>
                          </div>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Toggle actions menu
                              }}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{agent.email}</span>
                          </div>
                          {agent.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span>{agent.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {agent.employeeId}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(agent.status)}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <span className={`w-2 h-2 rounded-full ${getStateIndicator(agent.currentState)}`}></span>
                              {getStateLabel(agent.currentState)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(agent)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(agent)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        title={selectedAgent ? t('agentsPage.editAgent') : t('agentsPage.addNewAgent')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('agentsPage.employeeId')}
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              placeholder="e.g., EMP001"
              required
            />
            <Input
              label={t('agentsPage.fullName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('agentsPage.emailAddress')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label={t('agentsPage.phoneNumber')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label={t('agentsPage.role')}
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <Select
              label={t('agentsPage.status')}
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
            <Select
              label={t('agentsPage.team')}
              options={[{ value: '', label: t('agentsPage.selectTeam') }, ...teamOptions]}
              value={formData.teamId || ''}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {selectedAgent ? t('agentsPage.updateAgent') : t('agentsPage.createAgent')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('agentsPage.deleteAgent')}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
              <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{selectedAgent?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAgent?.email}</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('agentsPage.deleteConfirmation')}
          </p>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
              className="w-full sm:w-auto"
            >
              {t('agentsPage.deleteAgent')}
            </Button>
          </div>
        </div>
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

export default Agents;
