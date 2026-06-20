import { useCallback, useEffect, useState } from 'react';
import { validationAPI } from '../services/api';

/**
 * Loads dynamic validation rules for an entity type from MongoDB (via the API)
 * and validates fields on blur / on submit. Mirrors the backend ValidationService.
 *
 * @param {string} entityType e.g. 'Shipping' or 'Billing'
 */
export function useValidation(entityType) {
  const [settings, setSettings] = useState({});
  const [errors, setErrors] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    validationAPI
      .getSettings(entityType)
      .then((res) => {
        if (active) setSettings(res.data || {});
      })
      .catch((err) => console.error(`Failed to load ${entityType} validation rules:`, err))
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [entityType]);

  // Returns an error string ('' if valid) for a single field value.
  const getFieldError = useCallback(
    (fieldName, value) => {
      const setting = settings[fieldName];
      if (!setting) return '';
      const rules = setting.validationRules || {};
      const messages = setting.errorMessages || {};
      const str = value == null ? '' : String(value);

      if (rules.required && str.trim() === '') {
        return messages.required || `${fieldName} is required`;
      }
      // Skip remaining checks when empty and not required
      if (str.trim() === '') return '';

      if (rules.minLength != null && str.length < rules.minLength) {
        return messages.minLength || `Must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength != null && str.length > rules.maxLength) {
        return messages.maxLength || `Must not exceed ${rules.maxLength} characters`;
      }
      if (rules.regexPattern) {
        try {
          if (!new RegExp(rules.regexPattern).test(str)) {
            return messages.pattern || 'Invalid format';
          }
        } catch {
          // ignore invalid regex from server
        }
      }
      const num = parseFloat(str);
      if (rules.minValue != null && !Number.isNaN(num) && num < rules.minValue) {
        return messages.minValue || `Must be at least ${rules.minValue}`;
      }
      if (rules.maxValue != null && !Number.isNaN(num) && num > rules.maxValue) {
        return messages.maxValue || `Must not exceed ${rules.maxValue}`;
      }
      if (Array.isArray(rules.allowedValues) && rules.allowedValues.length > 0 && !rules.allowedValues.includes(str)) {
        return messages.invalidValue || 'Invalid value';
      }
      return '';
    },
    [settings]
  );

  // Validate one field and store the result. Used on blur (tab out).
  const validateField = useCallback(
    (fieldName, value) => {
      const error = getFieldError(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
      return error;
    },
    [getFieldError]
  );

  // Validate every known field against the form data. Used on submit.
  const validateAll = useCallback(
    (formData) => {
      const next = {};
      Object.keys(settings).forEach((fieldName) => {
        next[fieldName] = getFieldError(fieldName, formData[fieldName]);
        if (next[fieldName]) {
          console.log(`Validation failed for ${fieldName}:`, next[fieldName], 'Value:', formData[fieldName]);
        }
      });
      setErrors(next);
      const isValid = Object.values(next).every((e) => !e);
      console.log('Validation result:', isValid, 'Errors:', next);
      return isValid;
    },
    [settings, getFieldError]
  );

  const clearError = useCallback((fieldName) => {
    setErrors((prev) => ({ ...prev, [fieldName]: '' }));
  }, []);

  // Helper to get maxLength for a field from validation rules
  const getMaxLength = useCallback(
    (fieldName) => {
      const setting = settings[fieldName];
      const rules = setting?.validationRules || {};
      return rules.maxLength || null;
    },
    [settings]
  );

  return { settings, errors, loaded, validateField, validateAll, clearError, getMaxLength };
}
