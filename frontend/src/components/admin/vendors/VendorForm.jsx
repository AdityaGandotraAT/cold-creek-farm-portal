import { useState } from 'react';
import FormField from '../clients/FormField.jsx';
import { vendorCategories } from '../../../data/vendorsMock.js';
import { emptyVendorForm, toVendorPayload, validateVendorForm } from './vendorForm.js';
import './vendors.css';

function VendorForm({ initialValues = emptyVendorForm, submitLabel = 'Save', onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateVendorForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstError = document.querySelector(
        '.client-form .is-invalid input, .client-form .is-invalid select, .client-form .is-invalid textarea',
      );
      firstError?.focus();
      return;
    }

    setIsSubmitting(true);
    onSubmit(toVendorPayload(values));
    setIsSubmitting(false);
  }

  return (
    <form className="client-form" onSubmit={handleSubmit} noValidate>
      <section className="client-form__section" aria-labelledby="vendor-info-heading">
        <h3 id="vendor-info-heading">Vendor</h3>
        <p className="vendor-form__note">
          Enter the same details Cold Creek Farm shares on the vendor list: category, name, phone,
          email, and website.
        </p>
        <div className="client-form__grid">
          <FormField
            id="category"
            label="Category"
            value={values.category}
            onChange={(value) => updateField('category', value)}
            error={errors.category}
            required
            options={vendorCategories}
            placeholder="Select a category"
          />
          <FormField
            id="name"
            label="Name"
            value={values.name}
            onChange={(value) => updateField('name', value)}
            error={errors.name}
            required
            autoComplete="organization"
            placeholder="Grizzle Photography & Video"
          />
          <FormField
            id="phone"
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={(value) => updateField('phone', value)}
            error={errors.phone}
            optional
            autoComplete="tel"
            placeholder="706-864-3337"
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={(value) => updateField('email', value)}
            error={errors.email}
            optional
            autoComplete="email"
            placeholder="name@email.com"
          />
          <FormField
            id="website"
            label="Website"
            type="url"
            value={values.website}
            onChange={(value) => updateField('website', value)}
            error={errors.website}
            optional
            wide
            placeholder="https://traciegrizzle.com"
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

export default VendorForm;
