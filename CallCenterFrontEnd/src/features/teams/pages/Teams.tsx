import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { Button, Badge, Card, CardContent, Modal, Input, Textarea } from '../../../components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { SkeletonTable, EmptyStateNoData } from '../../../components/ui';
import { useToast } from '../../../store/toastStore';

interface Team {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  agentCount?: number;
  createdAt: string;
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>(initialFormData);

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

  const teams = Array.isArray(teamsData) ? teamsData : (teamsData?.data || teamsData?.items || []);

  const filteredTeams = teams.filter((team: Team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage agent teams and groups
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Team
        </Button>
      </div>

      {/* Search */}
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
          </div>
        </CardContent>
      </Card>

      {/* Teams table */}
      <Card variant="bordered">
        {isLoading ? (
          <CardContent>
            <SkeletonTable rows={5} columns={5} />
          </CardContent>
        ) : filteredTeams.length === 0 ? (
          <CardContent>
            <EmptyStateNoData
              title="No teams found"
              description="Get started by creating your first team"
              actionLabel="Add Team"
              onAction={handleOpenCreate}
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team: Team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-gray-500 dark:text-gray-400">
                      {team.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>{team.agentCount || 0}</TableCell>
                  <TableCell>
                    <Badge variant={team.isActive ? 'success' : 'default'}>
                      {team.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(team.createdAt)}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(team)}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDelete(team)}>
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTeam ? 'Edit Team' : 'Add New Team'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Team Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {selectedTeam ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
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
    </div>
  );
};

export default Teams;
