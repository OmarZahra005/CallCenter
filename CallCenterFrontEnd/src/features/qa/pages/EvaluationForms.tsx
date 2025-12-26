import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  BarChart3,
  Target,
  Scale,
  Star,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Modal,
} from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';
import apiClient from '../../../api/client';
import { FormBuilder } from '../components/FormBuilder';

// Types
interface FormCriteria {
  id: string;
  formId: string;
  criteriaName: string;
  description?: string;
  maxPoints: number;
  weight: number;
  isCritical: boolean;
  displayOrder: number;
}

interface EvaluationForm {
  id: string;
  name: string;
  description?: string;
  maxScore: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  criteria: FormCriteria[];
}

const EvaluationForms = () => {
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [selectedForm, setSelectedForm] = useState<EvaluationForm | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<EvaluationForm | null>(null);
  const [deleteConfirmForm, setDeleteConfirmForm] = useState<EvaluationForm | null>(null);

  // Fetch all forms
  const {
    data: forms = [],
    isLoading,
    error,
  } = useQuery<EvaluationForm[]>({
    queryKey: ['qa-forms'],
    queryFn: async () => {
      const response = await apiClient.get('/qa/forms');
      return response.data;
    },
  });

  // Toggle form active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const form = forms.find((f) => f.id === id);
      if (!form) throw new Error('Form not found');

      const response = await apiClient.put(`/qa/forms/${id}`, {
        ...form,
        isActive,
        criteria: form.criteria.map((c) => ({
          id: c.id,
          criteriaName: c.criteriaName,
          description: c.description,
          maxPoints: c.maxPoints,
          weight: c.weight,
          isCritical: c.isCritical,
          displayOrder: c.displayOrder,
        })),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa-forms'] });
    },
  });

  // Delete form
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/qa/forms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa-forms'] });
      setDeleteConfirmForm(null);
    },
  });

  // Duplicate form
  const duplicateMutation = useMutation({
    mutationFn: async (form: EvaluationForm) => {
      const response = await apiClient.post('/qa/forms', {
        name: `${form.name} (Copy)`,
        description: form.description,
        maxScore: form.maxScore,
        passingScore: form.passingScore,
        isActive: false,
        criteria: form.criteria.map((c) => ({
          criteriaName: c.criteriaName,
          description: c.description,
          maxPoints: c.maxPoints,
          weight: c.weight,
          isCritical: c.isCritical,
          displayOrder: c.displayOrder,
        })),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa-forms'] });
    },
  });

  // Filter forms
  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      const matchesSearch =
        !searchTerm ||
        form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesActive = !showActiveOnly || form.isActive;
      return matchesSearch && matchesActive;
    });
  }, [forms, searchTerm, showActiveOnly]);

  // Stats
  const stats = useMemo(() => {
    const totalForms = forms.length;
    const activeForms = forms.filter((f) => f.isActive).length;
    const totalCriteria = forms.reduce((sum, f) => sum + f.criteria.length, 0);
    const avgCriteria = totalForms > 0 ? Math.round(totalCriteria / totalForms) : 0;
    return { totalForms, activeForms, totalCriteria, avgCriteria };
  }, [forms]);

  // Handle create new form
  const handleCreateNew = () => {
    setEditingForm(null);
    setIsBuilderOpen(true);
  };

  // Handle edit form
  const handleEdit = (form: EvaluationForm) => {
    setEditingForm(form);
    setIsBuilderOpen(true);
  };

  // Handle preview form
  const handlePreview = (form: EvaluationForm) => {
    setSelectedForm(form);
    setIsPreviewOpen(true);
  };

  // Handle form saved
  const handleFormSaved = () => {
    setIsBuilderOpen(false);
    setEditingForm(null);
    queryClient.invalidateQueries({ queryKey: ['qa-forms'] });
  };

  // Calculate total weight for a form
  const calculateTotalWeight = (criteria: FormCriteria[]) => {
    return criteria.reduce((sum, c) => sum + c.weight, 0);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 p-1"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-primary-600" />
              Evaluation Forms
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create and manage QA evaluation forms and scoring criteria
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Form
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Forms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalForms}</p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <ClipboardList className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Forms</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeForms}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Criteria</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCriteria}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Criteria/Form</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgCriteria}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={staggerItem}>
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                showActiveOnly
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {showActiveOnly ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              Active Only
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Forms List */}
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-gray-500">Failed to load evaluation forms</p>
          </Card>
        ) : filteredForms.length === 0 ? (
          <Card className="p-8 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || showActiveOnly ? 'No matching forms found' : 'No evaluation forms yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || showActiveOnly
                ? 'Try adjusting your filters'
                : 'Create your first evaluation form to start scoring agent interactions'}
            </p>
            {!searchTerm && !showActiveOnly && (
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredForms.map((form, index) => {
                const totalWeight = calculateTotalWeight(form.criteria);
                const criticalCount = form.criteria.filter((c) => c.isCritical).length;

                return (
                  <motion.div
                    key={form.id}
                    variants={staggerItem}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Form Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {form.name}
                              </h3>
                              <Badge
                                variant={form.isActive ? 'success' : 'default'}
                                size="sm"
                              >
                                {form.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            {form.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                                {form.description}
                              </p>
                            )}

                            {/* Form Stats */}
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                <Target className="w-4 h-4" />
                                <span>{form.criteria.length} criteria</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                <Star className="w-4 h-4" />
                                <span>Max: {form.maxScore} pts</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                <Scale className="w-4 h-4" />
                                <span>Pass: {form.passingScore}%</span>
                              </div>
                              {criticalCount > 0 && (
                                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>{criticalCount} critical</span>
                                </div>
                              )}
                            </div>

                            {/* Weight indicator */}
                            {totalWeight !== 100 && totalWeight > 0 && (
                              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Total weight: {totalWeight.toFixed(0)}% (should be 100%)
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(form)}
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(form)}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateMutation.mutate(form)}
                              disabled={duplicateMutation.isPending}
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleActiveMutation.mutate({
                                  id: form.id,
                                  isActive: !form.isActive,
                                })
                              }
                              disabled={toggleActiveMutation.isPending}
                              title={form.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {form.isActive ? (
                                <ToggleRight className="w-4 h-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmForm(form)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Form Builder Modal */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditingForm(null);
        }}
        title={editingForm ? 'Edit Evaluation Form' : 'Create Evaluation Form'}
        size="xl"
      >
        <FormBuilder
          form={editingForm}
          onSave={handleFormSaved}
          onCancel={() => {
            setIsBuilderOpen(false);
            setEditingForm(null);
          }}
        />
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedForm(null);
        }}
        title="Form Preview"
        size="lg"
      >
        {selectedForm && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                {selectedForm.name}
              </h3>
              {selectedForm.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {selectedForm.description}
                </p>
              )}
              <div className="flex gap-4 text-sm">
                <span className="text-gray-500">Max Score: {selectedForm.maxScore}</span>
                <span className="text-gray-500">Passing: {selectedForm.passingScore}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Evaluation Criteria</h4>
              {selectedForm.criteria
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((criterion, index) => (
                  <div
                    key={criterion.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-400">
                            {index + 1}.
                          </span>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {criterion.criteriaName}
                          </h5>
                          {criterion.isCritical && (
                            <Badge variant="danger" size="sm">
                              Critical
                            </Badge>
                          )}
                        </div>
                        {criterion.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {criterion.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {criterion.maxPoints} pts
                        </p>
                        <p className="text-gray-500">
                          Weight: {(criterion.weight * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    {/* Score buttons preview */}
                    <div className="flex items-center gap-1 mt-3">
                      {[...Array(criterion.maxPoints + 1)].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500"
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleEdit(selectedForm);
                }}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Form
              </Button>
              <Button
                onClick={() => {
                  setIsPreviewOpen(false);
                  setSelectedForm(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmForm}
        onClose={() => setDeleteConfirmForm(null)}
        title="Delete Evaluation Form"
        size="sm"
      >
        {deleteConfirmForm && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  Are you sure you want to delete this form?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  "{deleteConfirmForm.name}" will be permanently deleted. This action cannot be
                  undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmForm(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteMutation.mutate(deleteConfirmForm.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Form
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export { EvaluationForms };
export default EvaluationForms;
