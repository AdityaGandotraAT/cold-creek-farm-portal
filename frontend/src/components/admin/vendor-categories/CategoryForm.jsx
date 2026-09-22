import { useState } from 'react';
import FormField from '../clients/FormField.jsx';
import { vendorStatusOptions } from '../../../data/vendorsMock.js';
import {
  emptyCategoryForm,
  toCategoryPayload,
  validateCategoryForm,
} from './categoryForm.js';

function CategoryForm({
  initialValues = emptyCategoryForm,
  required = false,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setSubmitError('');
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateCategoryForm(values, { required });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit(toCategoryPayload(values));
    } catch (err) {
      setSubmitError(err.message || 'Unable to save category');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="client-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <p className="client-form__error" role="alert">
          {submitError}
        </p>
      ) : null}

      <section className="client-form__section">
        <h3>Category Details</h3>
        {required ? (
          <p className="categories-note">
            This is a required Cold Creek Farm category. The name cannot be changed and it cannot be
            disabled.
          </p>
        ) : (
          <p className="categories-note">
            Additional categories are for Admin management of the preferred vendor list.
          </p>
        )}
        <div className="client-form__grid">
          <FormField
            id="categoryName"
            label="Category Name"
            value={values.name}
            onChange={(value) => updateField('name', value)}
            error={errors.name}
            required={!required}
            readOnly={required}
            wide
          />
          <FormField
            id="categoryStatus"
            label="Status"
            value={values.status}
            onChange={(value) => updateField('status', value)}
            error={errors.status}
            required
            options={required ? ['Active'] : vendorStatusOptions}
            readOnly={required}
          />
        </div>
      </section>

      <div className="client-form__actions">
        <button className="clients-add" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button className="client-form__cancel" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;
