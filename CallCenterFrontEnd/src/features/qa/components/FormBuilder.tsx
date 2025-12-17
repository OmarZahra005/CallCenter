import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  AlertTriangle,
  Save,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
} from 'lucide-react';
import { Button, Badge } from '../../../components/ui';
import apiClient from '../../../api/client';

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

interface FormBuilderProps {
  form?: EvaluationForm | null;
  onSave: () => void;
  onCancel: () => void;
}

interface CriteriaInput {
  id: string;
  criteriaName: string;
  description: string;
  maxPoints: number;
  weight: number;
  isCritical: boolean;
  isExpanded: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const FormBuilder = ({ form, onSave, onCancel }: FormBuilderProps) => {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(80);
  const [isActive, setIsActive] = useState(true);
  const [criteria, setCriteria] = useState<CriteriaInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data if editing
  useEffect(() => {
    if (form) {
      setName(form.name);
      setDescription(form.description || '');
      setPassingScore(form.passingScore);
      setIsActive(form.isActive);
      setCriteria(
        form.criteria
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((c) => ({
            id: c.id,
            criteriaName: c.criteriaName,
            description: c.description || '',
            maxPoints: c.maxPoints,
            weight: c.weight * 100, // Convert to percentage for display
            isCritical: c.isCritical,
            isExpanded: false,
          }))
      );
    } else {
      // Default criteria for new form
      setCriteria([
        {
          id: generateId(),
          criteriaName: 'Greeting & Introduction',
          description: 'Did the agent properly greet and introduce themselves?',
          maxPoints: 5,
          weight: 15,
          isCritical: false,
          isExpanded: true,
        },
        {
          id: generateId(),
          criteriaName: 'Problem Understanding',
          description: 'Did the agent clearly understand the customer\'s issue?',
          maxPoints: 5,
          weight: 20,
          isCritical: false,
          isExpanded: false,
        },
        {
          id: generateId(),
          criteriaName: 'Resolution Quality',
          description: 'Was the issue resolved satisfactorily?',
          maxPoints: 5,
          weight: 25,
          isCritical: true,
          isExpanded: false,
        },
        {
          id: generateId(),
          criteriaName: 'Communication Skills',
          description: 'Was the agent professional and clear in communication?',
          maxPoints: 5,
          weight: 20,
          isCritical: false,
          isExpanded: false,
        },
        {
          id: generateId(),
          criteriaName: 'Closing & Follow-up',
          description: 'Did the agent properly close the call and offer follow-up?',
          maxPoints: 5,
          weight: 20,
          isCritical: false,
          isExpanded: false,
        },
      ]);
    }
  }, [form]);

  // Calculate totals
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const totalMaxPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0);
  const criticalCount = criteria.filter((c) => c.isCritical).length;

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Form name is required';
    }

    if (criteria.length === 0) {
      newErrors.criteria = 'At least one criterion is required';
    }

    criteria.forEach((c, index) => {
      if (!c.criteriaName.trim()) {
        newErrors[`criteria_${index}_name`] = 'Criterion name is required';
      }
      if (c.maxPoints < 1) {
        newErrors[`criteria_${index}_points`] = 'Max points must be at least 1';
      }
      if (c.weight < 0) {
        newErrors[`criteria_${index}_weight`] = 'Weight cannot be negative';
      }
    });

    if (Math.abs(totalWeight - 100) > 0.1 && criteria.length > 0) {
      newErrors.totalWeight = 'Total weight should equal 100%';
    }

    if (passingScore < 0 || passingScore > 100) {
      newErrors.passingScore = 'Passing score must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        description: description || undefined,
        maxScore: totalMaxPoints,
        passingScore,
        isActive,
        criteria: criteria.map((c, index) => ({
          ...(form ? { id: c.id } : {}),
          criteriaName: c.criteriaName,
          description: c.description || undefined,
          maxPoints: c.maxPoints,
          weight: c.weight / 100, // Convert back to decimal
          isCritical: c.isCritical,
          displayOrder: index + 1,
        })),
      };

      if (form) {
        await apiClient.put(`/qa/forms/${form.id}`, payload);
      } else {
        await apiClient.post('/qa/forms', payload);
      }
    },
    onSuccess: () => {
      onSave();
    },
  });

  const handleSave = () => {
    if (validate()) {
      saveMutation.mutate();
    }
  };

  // Add new criterion
  const addCriterion = () => {
    setCriteria([
      ...criteria,
      {
        id: generateId(),
        criteriaName: '',
        description: '',
        maxPoints: 5,
        weight: 0,
        isCritical: false,
        isExpanded: true,
      },
    ]);
  };

  // Remove criterion
  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  // Update criterion
  const updateCriterion = (id: string, updates: Partial<CriteriaInput>) => {
    setCriteria(criteria.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Toggle criterion expansion
  const toggleExpanded = (id: string) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, isExpanded: !c.isExpanded } : c))
    );
  };

  // Auto-distribute weights
  const distributeWeightsEvenly = () => {
    if (criteria.length === 0) return;
    const evenWeight = Math.floor(100 / criteria.length);
    const remainder = 100 - evenWeight * criteria.length;
    setCriteria(
      criteria.map((c, i) => ({
        ...c,
        weight: evenWeight + (i === 0 ? remainder : 0),
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Form Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Customer Service Evaluation"
            className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.name
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this evaluation form..."
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passing Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
              className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.passingScore
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.passingScore && (
              <p className="mt-1 text-sm text-red-500">{errors.passingScore}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-full px-4 py-2.5 border rounded-lg flex items-center justify-between transition-colors ${
                isActive
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{isActive ? 'Active' : 'Inactive'}</span>
              <CheckCircle
                className={`w-5 h-5 ${isActive ? 'text-green-500' : 'text-gray-400'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Criteria Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Evaluation Criteria
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag to reorder. Total weight should equal 100%.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={distributeWeightsEvenly}
              title="Distribute weights evenly"
            >
              Auto-distribute
            </Button>
            <Button variant="outline" size="sm" onClick={addCriterion}>
              <Plus className="w-4 h-4 mr-1" />
              Add Criterion
            </Button>
          </div>
        </div>

        {/* Weight indicator */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Total Weight</span>
            <span
              className={`font-medium ${
                Math.abs(totalWeight - 100) < 0.1
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }`}
            >
              {totalWeight.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                Math.abs(totalWeight - 100) < 0.1
                  ? 'bg-green-500'
                  : totalWeight > 100
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(totalWeight, 100)}%` }}
            />
          </div>
          {errors.totalWeight && (
            <p className="mt-2 text-sm text-yellow-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {errors.totalWeight}
            </p>
          )}
        </div>

        {/* Criteria list */}
        {errors.criteria && (
          <p className="mb-4 text-sm text-red-500 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {errors.criteria}
          </p>
        )}

        <Reorder.Group
          axis="y"
          values={criteria}
          onReorder={setCriteria}
          className="space-y-3"
        >
          <AnimatePresence>
            {criteria.map((criterion, index) => (
              <Reorder.Item
                key={criterion.id}
                value={criterion}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Criterion header */}
                  <div className="flex items-center gap-3 p-3 cursor-move">
                    <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={criterion.criteriaName}
                        onChange={(e) =>
                          updateCriterion(criterion.id, {
                            criteriaName: e.target.value,
                          })
                        }
                        placeholder="Criterion name"
                        className={`w-full px-3 py-1.5 text-sm border rounded bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors[`criteria_${index}_name`]
                            ? 'border-red-500'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {criterion.isCritical && (
                        <Badge variant="danger" size="sm">
                          Critical
                        </Badge>
                      )}
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 text-right">
                        {criterion.weight}%
                      </span>
                      <span className="text-sm text-gray-500 w-10 text-right">
                        {criterion.maxPoints}pts
                      </span>
                      <button
                        onClick={() => toggleExpanded(criterion.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {criterion.isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => removeCriterion(criterion.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {criterion.isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-0 space-y-3 border-t border-gray-100 dark:border-gray-700 mt-2 pt-3">
                          {/* Description */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Description / Instructions
                            </label>
                            <textarea
                              value={criterion.description}
                              onChange={(e) =>
                                updateCriterion(criterion.id, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="Describe what evaluators should look for..."
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>

                          {/* Points, Weight, Critical */}
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Max Points
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={criterion.maxPoints}
                                onChange={(e) =>
                                  updateCriterion(criterion.id, {
                                    maxPoints: parseInt(e.target.value) || 1,
                                  })
                                }
                                className={`w-full px-3 py-2 text-sm border rounded bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                  errors[`criteria_${index}_points`]
                                    ? 'border-red-500'
                                    : 'border-gray-200 dark:border-gray-600'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Weight (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={criterion.weight}
                                onChange={(e) =>
                                  updateCriterion(criterion.id, {
                                    weight: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className={`w-full px-3 py-2 text-sm border rounded bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                  errors[`criteria_${index}_weight`]
                                    ? 'border-red-500'
                                    : 'border-gray-200 dark:border-gray-600'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Critical
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCriterion(criterion.id, {
                                    isCritical: !criterion.isCritical,
                                  })
                                }
                                className={`w-full px-3 py-2 text-sm border rounded flex items-center justify-center gap-2 transition-colors ${
                                  criterion.isCritical
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                <AlertTriangle
                                  className={`w-4 h-4 ${
                                    criterion.isCritical ? 'text-red-500' : ''
                                  }`}
                                />
                                {criterion.isCritical ? 'Yes' : 'No'}
                              </button>
                            </div>
                          </div>

                          {/* Info about critical */}
                          {criterion.isCritical && (
                            <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
                              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>
                                Critical criteria can cause automatic failure if scored below
                                threshold.
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {criteria.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No criteria added yet</p>
            <Button variant="outline" size="sm" onClick={addCriterion}>
              <Plus className="w-4 h-4 mr-1" />
              Add First Criterion
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Form Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Criteria</p>
            <p className="font-semibold text-gray-900 dark:text-white">{criteria.length}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Max Points</p>
            <p className="font-semibold text-gray-900 dark:text-white">{totalMaxPoints}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Weight</p>
            <p
              className={`font-semibold ${
                Math.abs(totalWeight - 100) < 0.1 ? 'text-green-600' : 'text-yellow-600'
              }`}
            >
              {totalWeight.toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Critical Items</p>
            <p className="font-semibold text-red-600">{criticalCount}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {form ? 'Update Form' : 'Create Form'}
            </>
          )}
        </Button>
      </div>

      {/* Error display */}
      {saveMutation.isError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          Failed to save form. Please try again.
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
