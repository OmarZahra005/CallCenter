import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../api/client';
import { Button, Badge, Card, CardContent, Modal, Input, Select, Pagination } from '../../../components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { SkeletonTable, EmptyStateNoData } from '../../../components/ui';
import { useToast } from '../../../store/toastStore';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
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
  currentState?: string;
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
    mutationFn: (data: AgentFormData) => apiClient.post('/agents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setIsModalOpen(false);
      resetForm();
      showToast('Agent created successfully', 'success');
    },
    onError: () => {
      showToast('Failed to create agent', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: AgentFormData }) =>
      apiClient.put(`/agents/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setIsModalOpen(false);
      resetForm();
      showToast('Agent updated successfully', 'success');
    },
    onError: () => {
      showToast('Failed to update agent', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/agents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setIsDeleteModalOpen(false);
      setSelectedAgent(null);
      showToast('Agent deleted successfully', 'success');
    },
    onError: () => {
      showToast('Failed to delete agent', 'error');
    },
  });

  const agents = Array.isArray(agentsData) ? agentsData : (agentsData?.data || agentsData?.items || []);
  const teams = Array.isArray(teamsData) ? teamsData : (teamsData?.data || teamsData?.items || []);

  const filteredAgents = agents.filter((agent: Agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getStateBadge = (state?: string) => {
    if (!state) return null;
    const colors: Record<string, string> = {
      Available: 'bg-agent-available',
      Busy: 'bg-agent-busy',
      Break: 'bg-agent-break',
      Offline: 'bg-agent-offline',
      ACW: 'bg-agent-acw',
      Meeting: 'bg-agent-meeting',
    };
    return (
      <span className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${colors[state] || 'bg-gray-400'}`}></span>
        {t(`agentState.${state.toLowerCase()}`) || state}
      </span>
    );
  };

  const roleOptions = [
    { value: 'Agent', label: 'Agent' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Admin', label: 'Admin' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'OnLeave', label: 'On Leave' },
  ];

  const teamOptions = teams.map((team: { id: string; name: string }) => ({
    value: team.id,
    label: team.name,
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.agents')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your call center agents
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleOpenCreate}>
            <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Agent
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline">{t('common.filter')}</Button>
            <Button variant="outline">{t('common.export')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Agents table */}
      <Card variant="bordered">
        {isLoading ? (
          <CardContent>
            <SkeletonTable rows={5} columns={7} />
          </CardContent>
        ) : paginatedAgents.length === 0 && filteredAgents.length === 0 ? (
          <CardContent>
            <EmptyStateNoData
              title="No agents found"
              description="Get started by creating your first agent"
              actionLabel="Add Agent"
              onAction={handleOpenCreate}
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current State</TableHead>
                <TableHead className="text-end">Actions</TableHead>
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
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <TableCell className="font-medium">{agent.employeeId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </motion.div>
                        {agent.name}
                      </div>
                    </TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.role}</TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell>{getStateBadge(agent.currentState)}</TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(agent)}>
                          {t('common.edit')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDelete(agent)}>
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAgent ? 'Edit Agent' : 'Add New Agent'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              required
            />
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Role"
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
            <Select
              label="Team"
              options={[{ value: '', label: 'Select Team' }, ...teamOptions]}
              value={formData.teamId || ''}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
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
              {selectedAgent ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Agent"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{selectedAgent?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Agents;
