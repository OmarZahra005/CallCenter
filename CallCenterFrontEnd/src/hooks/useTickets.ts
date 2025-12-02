import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  customerId: string;
  customerName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDto {
  subject: string;
  description?: string;
  priority: string;
  customerId: string;
  assignedAgentId?: string;
}

export interface UpdateTicketDto extends Partial<CreateTicketDto> {
  status?: string;
}

export const useTickets = () => {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await apiClient.get('/tickets');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.data || data?.items || []);
    },
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: async () => {
      const response = await apiClient.get(`/tickets/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTicketDto) => {
      const response = await apiClient.post('/tickets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTicketDto }) => {
      const response = await apiClient.put(`/tickets/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};
