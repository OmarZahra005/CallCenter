import { useState, useCallback } from 'react';

type ValidationRule<T> = {
  validate: (value: T[keyof T], formData: T) => boolean;
  message: string;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface UseFormValidationReturn<T> {
  errors: FormErrors<T>;
  validateField: (field: keyof T, value: T[keyof T], formData: T) => boolean;
  validateForm: (formData: T) => boolean;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

export const useFormValidation = <T extends Record<string, unknown>>(
  rules: ValidationRules<T>
): UseFormValidationReturn<T> => {
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const validateField = useCallback(
    (field: keyof T, value: T[keyof T], formData: T): boolean => {
      const fieldRules = rules[field];
      if (!fieldRules) return true;

      for (const rule of fieldRules) {
        if (!rule.validate(value, formData)) {
          setErrors((prev) => ({ ...prev, [field]: rule.message }));
          return false;
        }
      }

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    },
    [rules]
  );

  const validateForm = useCallback(
    (formData: T): boolean => {
      const newErrors: FormErrors<T> = {};
      let isValid = true;

      for (const field of Object.keys(rules) as Array<keyof T>) {
        const fieldRules = rules[field];
        if (!fieldRules) continue;

        for (const rule of fieldRules) {
          if (!rule.validate(formData[field], formData)) {
            newErrors[field] = rule.message;
            isValid = false;
            break;
          }
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    [rules]
  );

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors: Object.keys(errors).length > 0,
  };
};

// Common validation helpers
export const validators = {
  required: (message = 'This field is required') => ({
    validate: (value: unknown) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  }),

  email: (message = 'Invalid email address') => ({
    validate: (value: unknown) => {
      if (!value || typeof value !== 'string') return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message,
  }),

  minLength: (min: number, message?: string) => ({
    validate: (value: unknown) => {
      if (!value || typeof value !== 'string') return true;
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string) => ({
    validate: (value: unknown) => {
      if (!value || typeof value !== 'string') return true;
      return value.length <= max;
    },
    message: message || `Must be at most ${max} characters`,
  }),

  pattern: (regex: RegExp, message: string) => ({
    validate: (value: unknown) => {
      if (!value || typeof value !== 'string') return true;
      return regex.test(value);
    },
    message,
  }),

  match: <T>(field: keyof T, message: string) => ({
    validate: (value: unknown, formData: T) => value === formData[field],
    message,
  }),

  phone: (message = 'Invalid phone number') => ({
    validate: (value: unknown) => {
      if (!value || typeof value !== 'string') return true;
      return /^[\d\s\-+()]+$/.test(value) && value.replace(/\D/g, '').length >= 10;
    },
    message,
  }),
};

export default useFormValidation;
