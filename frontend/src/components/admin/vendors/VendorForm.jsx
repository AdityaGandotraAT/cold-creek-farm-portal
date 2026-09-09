import { useState } from 'react';
import FormField from '../clients/FormField.jsx';
import { vendorCategories, vendorStatusOptions } from '../../../data/vendorsMock.js';
import { emptyVendorForm, toVendorPayload, validateVendorForm } from './vendorForm.js';

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
        <h3 id="vendor-info-heading">Vendor Information</h3>
        <div className="client-form__grid">
          <FormField
            id="name"
            label="Vendor Name"
            value={values.name}
            onChange={(value) => updateField('name', value)}
            error={errors.name}
            required
            autoComplete="name"
          />
          <FormField
            id="company"
            label="Company Name"
            value={values.company}
            onChange={(value) => updateField('company', value)}
            error={errors.company}
            required
            autoComplete="organization"
          />
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
            id="status"
            label="Status"
            value={values.status}
            onChange={(value) => updateField('status', value)}
            error={errors.status}
            required
            options={vendorStatusOptions}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={(value) => updateField('email', value)}
            error={errors.email}
            required
            autoComplete="email"
            placeholder="name@email.com"
          />
          <FormField
            id="phone"
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={(value) => updateField('phone', value)}
            error={errors.phone}
            required
            autoComplete="tel"
            placeholder="(555) 123-4567"
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
            placeholder="https://"
          />
          <FormField
            id="address"
            label="Address"
            value={values.address}
            onChange={(value) => updateField('address', value)}
            error={errors.address}
            optional
            wide
            autoComplete="street-address"
          />
        </div>
      </section>

      <section className="client-form__section" aria-labelledby="vendor-offerings-heading">
        <h3 id="vendor-offerings-heading">Offerings</h3>
        <div className="client-form__grid">
          <FormField
            id="description"
            label="Description"
            type="textarea"
            rows={4}
            value={values.description}
            onChange={(value) => updateField('description', value)}
            error={errors.description}
            optional
            wide
          />
          <FormField
            id="services"
            label="Services Offered"
            type="textarea"
            rows={3}
            value={values.services}
            onChange={(value) => updateField('services', value)}
            error={errors.services}
            optional
            wide
          />
          <FormField
            id="pricing"
            label="Pricing / Packages"
            type="textarea"
            rows={3}
            value={values.pricing}
            onChange={(value) => updateField('pricing', value)}
            error={errors.pricing}
            optional
            wide
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
