import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../api/client';
import { Button, Badge, Card, CardContent, Modal, Input, Textarea, Pagination } from '../../../components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { SkeletonTable, EmptyStateNoData } from '../../../components/ui';
import { useToast } from '../../../store/toastStore';
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Users,
  UsersRound,
  UserCheck,
  UserX,
  Filter,
  Download,
  Grid3X3,
  List,
  ChevronDown,
  Calendar,
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

interface Team {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  agentCount?: number;
  createdAt: string;
  leadName?: string;
  performance?: number;
}

interface TeamFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

const initialFormData: TeamFormData = {
  name: '',
  description: '',
  isActive: true,
};

const Teams = () => {
  const { t: _t } = useTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>(initialFormData);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await apiClient.get('/teams');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TeamFormData) => apiClient.post('/teams', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsModalOpen(false);
      resetForm();
      showToast('Team created successfully', 'success');
    },
    onError: () => {
      showToast('Failed to create team', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: TeamFormData }) =>
      apiClient.put(`/teams/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsModalOpen(false);
      resetForm();
      showToast('Team updated successfully', 'success');
    },
    onError: () => {
      showToast('Failed to update team', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsDeleteModalOpen(false);
      setSelectedTeam(null);
      showToast('Team deleted successfully', 'success');
    },
    onError: () => {
      showToast('Failed to delete team', 'error');
    },
  });

  const teams: Team[] = Array.isArray(teamsData) ? teamsData : (teamsData?.data || teamsData?.items || []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = teams.length;
    const active = teams.filter((t: Team) => t.isActive).length;
    const inactive = teams.filter((t: Team) => !t.isActive).length;
    const totalAgents = teams.reduce((sum: number, t: Team) => sum + (t.agentCount || 0), 0);
    return { total, active, inactive, totalAgents };
  }, [teams]);

  // Filter teams
  const filteredTeams = useMemo(() => {
    return teams.filter((team: Team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && team.isActive) ||
        (statusFilter === 'inactive' && !team.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [teams, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedTeam(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      isActive: team.isActive,
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (team: Team) => {
    setSelectedTeam(team);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeam) {
      updateMutation.mutate({ id: selectedTeam.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (selectedTeam) {
      deleteMutation.mutate(selectedTeam.id);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success" className="flex items-center">
        <UserCheck className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="default" className="flex items-center">
        <UserX className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'border-l-green-500' : 'border-l-gray-400';
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
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

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage agent teams and groups
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Team
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <UsersRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Teams</p>
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive Teams</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <UserX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Agents</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.totalAgents}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              placeholder="Search by name or description..."
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
                {statusFilter !== 'all' && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">1</span>
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
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  {statusFilter !== 'all' && (
                    <button
                      onClick={() => setStatusFilter('all')}
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
        {statusFilter !== 'all' && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              Status: {statusFilter === 'active' ? 'Active' : 'Inactive'}
              <button onClick={() => setStatusFilter('all')} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
            </span>
          </div>
        )}
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          Showing {paginatedTeams.length} of {filteredTeams.length} teams
          {filteredTeams.length !== teams.length && ` (filtered from ${teams.length})`}
        </span>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden">
          {isLoading ? (
            <CardContent>
              <SkeletonTable rows={5} columns={6} />
            </CardContent>
          ) : paginatedTeams.length === 0 ? (
            <CardContent>
              <EmptyStateNoData
                title={filteredTeams.length === 0 && teams.length > 0 ? "No matching teams" : "No teams found"}
                description={filteredTeams.length === 0 && teams.length > 0 ? "Try adjusting your search or filters" : "Get started by creating your first team"}
                actionLabel="Add Team"
                onAction={handleOpenCreate}
              />
            </CardContent>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead className="hidden lg:table-cell">Description</TableHead>
                      <TableHead>Agents</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Created</TableHead>
                      <TableHead className="text-end w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedTeams.map((team: Team, index: number) => (
                        <motion.tr
                          key={team.id}
                          variants={tableRowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ delay: index * 0.03 }}
                          className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group border-l-4 ${getStatusColor(team.isActive)}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${getAvatarColor(team.name)} flex items-center justify-center text-white font-medium`}>
                                {getInitials(team.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {team.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate lg:hidden max-w-[150px]">
                                  {team.description || 'No description'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">
                              {team.description || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">{team.agentCount || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(team.isActive)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(team.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenView(team)}
                                className="h-8 w-8 p-0"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(team)}
                                className="h-8 w-8 p-0"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDelete(team)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                title="Delete"
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
          ) : paginatedTeams.length === 0 ? (
            <Card className="p-8">
              <EmptyStateNoData
                title={filteredTeams.length === 0 && teams.length > 0 ? "No matching teams" : "No teams found"}
                description={filteredTeams.length === 0 && teams.length > 0 ? "Try adjusting your search or filters" : "Get started by creating your first team"}
                actionLabel="Add Team"
                onAction={handleOpenCreate}
              />
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {paginatedTeams.map((team: Team, index: number) => (
                    <motion.div
                      key={team.id}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`p-4 hover:shadow-lg transition-all duration-200 group border-l-4 ${getStatusColor(team.isActive)}`}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full ${getAvatarColor(team.name)} flex items-center justify-center text-white text-lg font-medium`}>
                              {getInitials(team.name)}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {team.name}
                              </h3>
                              {getStatusBadge(team.isActive)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleOpenView(team)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {team.description || 'No description provided'}
                          </p>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{team.agentCount || 0}</span>
                            <span className="text-gray-500">agents</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatRelativeTime(team.createdAt)}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenView(team)}
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(team)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(team)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
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
        title={selectedTeam ? 'Edit Team' : 'Add New Team'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Team Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Customer Support Team"
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the team's purpose and responsibilities..."
            rows={3}
          />
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Team
            </label>
            <span className="text-xs text-gray-500">
              (Inactive teams won't receive new assignments)
            </span>
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
              {selectedTeam ? 'Update Team' : 'Create Team'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Team Details"
        size="lg"
      >
        {selectedTeam && (
          <div className="space-y-6">
            {/* Team Header */}
            <div className={`p-4 rounded-lg border-l-4 ${getStatusColor(selectedTeam.isActive)} bg-gray-50 dark:bg-gray-800/50`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${getAvatarColor(selectedTeam.name)} flex items-center justify-center text-white text-2xl font-medium`}>
                  {getInitials(selectedTeam.name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedTeam.name}
                  </h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedTeam.isActive)}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agents</span>
                <div className="mt-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTeam.agentCount || 0}</span>
                  <span className="text-sm text-gray-500">members</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</span>
                <div className="mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedTeam.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</span>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {selectedTeam.description || 'No description provided'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="w-full sm:w-auto">
                Close
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleOpenEdit(selectedTeam);
              }} className="w-full sm:w-auto">
                <Edit className="w-4 h-4 mr-2" />
                Edit Team
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Team"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{selectedTeam?.name}</strong>? This action cannot be undone.
          </p>
          {selectedTeam && (selectedTeam.agentCount || 0) > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This team has {selectedTeam.agentCount} agent(s). They will need to be reassigned.
              </p>
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
              className="w-full sm:w-auto"
            >
              Delete
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

export default Teams;
