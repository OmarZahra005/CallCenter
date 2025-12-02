import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { Button, Badge, Card, CardContent, Modal, Input, Select, Textarea } from '../../../components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { SkeletonTable, EmptyStateNoData } from '../../../components/ui';
import { useToast } from '../../../store/toastStore';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: string;
  notes?: string;
  createdAt: string;
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);

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
      showToast('Customer created successfully', 'success');
    },
    onError: () => {
      showToast('Failed to create customer', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: CustomerFormData }) =>
      apiClient.put(`/customers/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      resetForm();
      showToast('Customer updated successfully', 'success');
    },
    onError: () => {
      showToast('Failed to update customer', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      showToast('Customer deleted successfully', 'success');
    },
    onError: () => {
      showToast('Failed to delete customer', 'error');
    },
  });

  const customers = Array.isArray(customersData) ? customersData : (customersData?.data || customersData?.items || []);

  const filteredCustomers = customers.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

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

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'success' | 'info' | 'default'> = {
      Premium: 'success',
      Regular: 'info',
      New: 'default',
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const typeOptions = [
    { value: 'New', label: 'New' },
    { value: 'Regular', label: 'Regular' },
    { value: 'Premium', label: 'Premium' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.customers')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage customer profiles and information
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </Button>
      </div>

      {/* Search and filters */}
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
            <Button variant="outline">{t('common.filter')}</Button>
            <Button variant="outline">{t('common.export')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers table */}
      <Card variant="bordered">
        {isLoading ? (
          <CardContent>
            <SkeletonTable rows={5} columns={7} />
          </CardContent>
        ) : filteredCustomers.length === 0 ? (
          <CardContent>
            <EmptyStateNoData
              title="No customers found"
              description="Get started by adding your first customer"
              actionLabel="Add Customer"
              onAction={handleOpenCreate}
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer: Customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {customer.name}
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.company || '-'}</TableCell>
                  <TableCell>{getTypeBadge(customer.type)}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(customer)}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDelete(customer)}>
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
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <Select
            label="Customer Type"
            options={typeOptions}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {selectedCustomer ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Customer"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.
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

export default Customers;
