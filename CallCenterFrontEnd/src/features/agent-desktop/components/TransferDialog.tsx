import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Avatar, Badge } from '../../../components/ui';
import apiClient from '../../../api/client';

interface Agent {
  id: string;
  name: string;
  email: string;
  currentState?: string;
  teamId?: string;
}

interface TransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (agentId: string) => void;
  currentAgentId?: string;
}

const TransferDialog = ({ isOpen, onClose, onTransfer, currentAgentId }: TransferDialogProps) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch available agents
  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['agents-for-transfer'],
    queryFn: async () => {
      const response = await apiClient.get('/agents');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.items || []);
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  // Filter agents (exclude current agent, filter by search)
  const agents: Agent[] = (agentsData || [])
    .filter((agent: Agent) => agent.id !== currentAgentId)
    .filter((agent: Agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Group agents by availability
  const availableAgents = agents.filter(a => a.currentState === 'Available');
  const otherAgents = agents.filter(a => a.currentState !== 'Available');

  const handleTransfer = () => {
    if (selectedAgentId) {
      onTransfer(selectedAgentId);
      setSelectedAgentId(null);
      setSearchTerm('');
      onClose();
    }
  };

  const getStateColor = (state?: string) => {
    switch (state?.toLowerCase()) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-blue-500';
      case 'break': return 'bg-yellow-500';
      case 'acw': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStateBadgeVariant = (state?: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (state?.toLowerCase()) {
      case 'available': return 'success';
      case 'busy': return 'info';
      case 'break': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transfer Call</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select an agent to transfer the call to</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            autoFocus
          />
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No agents match your search' : 'No agents available'}
            </div>
          ) : (
            <>
              {/* Available agents section */}
              {availableAgents.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-2">
                    AVAILABLE ({availableAgents.length})
                  </p>
                  {availableAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        selectedAgentId === agent.id
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <Avatar name={agent.name} size="md" />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${getStateColor(agent.currentState)}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{agent.email}</p>
                      </div>
                      <Badge variant={getStateBadgeVariant(agent.currentState)} size="sm">
                        {agent.currentState || 'Offline'}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Other agents section */}
              {otherAgents.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-2">
                    OTHER AGENTS ({otherAgents.length})
                  </p>
                  {otherAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        selectedAgentId === agent.id
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <Avatar name={agent.name} size="md" />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${getStateColor(agent.currentState)}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{agent.email}</p>
                      </div>
                      <Badge variant={getStateBadgeVariant(agent.currentState)} size="sm">
                        {agent.currentState || 'Offline'}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleTransfer}
            disabled={!selectedAgentId}
          >
            Transfer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransferDialog;
