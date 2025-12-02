import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface Agent {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  teamId?: string;
  currentState?: string;
  hireDate?: string;
}

export interface CreateAgentDto {
  name: string;
  email: string;
  phone: string;
  role: string;
  teamId?: string;
}

export interface UpdateAgentDto extends Partial<CreateAgentDto> {
  status?: string;
}

export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get('/agents');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.data || data?.items || []);
    },
  });
};

export const useAgent = (id: string) => {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAgentDto) => {
      const response = await apiClient.post('/agents', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAgentDto }) => {
      const response = await apiClient.put(`/agents/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};
