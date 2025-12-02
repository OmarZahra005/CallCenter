import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: string;
  createdAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await apiClient.get('/customers');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.data || data?.items || []);
    },
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const response = await apiClient.get(`/customers/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerDto) => {
      const response = await apiClient.post('/customers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerDto }) => {
      const response = await apiClient.put(`/customers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
