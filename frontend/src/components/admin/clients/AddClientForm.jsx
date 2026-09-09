import { useState } from 'react';
import { farmTodayISO } from '../../../data/farmTime.js';
import FormField from './FormField.jsx';
import {
  emptyClientForm,
  toClientPayload,
  validateClientForm,
} from './clientForm.js';

function AddClientForm({ onSubmit, onCancel }) {
  const today = farmTodayISO();
  const [values, setValues] = useState(emptyClientForm);
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
    const nextErrors = validateClientForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstError = document.querySelector('.client-form .is-invalid input, .client-form .is-invalid select, .client-form .is-invalid textarea');
      firstError?.focus();
      return;
    }

    setIsSubmitting(true);
    onSubmit(toClientPayload(values));
    setIsSubmitting(false);
  }

  return (
    <form className="client-form" onSubmit={handleSubmit} noValidate>
      <section className="client-form__section" aria-labelledby="client-info-heading">
        <h3 id="client-info-heading">Client Information</h3>
        <div className="client-form__grid">
          <FormField
            id="firstName"
            label="First Name"
            value={values.firstName}
            onChange={(value) => updateField('firstName', value)}
            error={errors.firstName}
            required
            autoComplete="given-name"
          />
          <FormField
            id="lastName"
            label="Last Name"
            value={values.lastName}
            onChange={(value) => updateField('lastName', value)}
            error={errors.lastName}
            required
            autoComplete="family-name"
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
            id="primaryPhone"
            label="Primary Phone"
            type="tel"
            value={values.primaryPhone}
            onChange={(value) => updateField('primaryPhone', value)}
            error={errors.primaryPhone}
            required
            autoComplete="tel"
            placeholder="(706) 555-0100"
          />
          <FormField
            id="secondaryPhone"
            label="Secondary Phone"
            type="tel"
            value={values.secondaryPhone}
            onChange={(value) => updateField('secondaryPhone', value)}
            error={errors.secondaryPhone}
            optional
            autoComplete="tel-national"
            placeholder="(706) 555-0101"
          />
        </div>
      </section>

      <section className="client-form__section" aria-labelledby="account-options-heading">
        <h3 id="account-options-heading">Account Options</h3>
        <div className="client-form__grid">
          <FormField
            id="birthDate"
            label="Birth Date"
            type="date"
            value={values.birthDate}
            onChange={(value) => updateField('birthDate', value)}
            error={errors.birthDate}
            optional
            autoComplete="bday"
            max={today}
          />
          <FormField
            id="address"
            label="Address"
            value={values.address}
            onChange={(value) => updateField('address', value)}
            error={errors.address}
            required
            wide
            autoComplete="street-address"
          />
          <FormField
            id="city"
            label="City"
            value={values.city}
            onChange={(value) => updateField('city', value)}
            error={errors.city}
            required
            autoComplete="address-level2"
          />
          <FormField
            id="state"
            label="State"
            value={values.state}
            onChange={(value) => updateField('state', value)}
            error={errors.state}
            required
            autoComplete="address-level1"
            placeholder="GA"
          />
          <FormField
            id="zipCode"
            label="ZIP Code"
            value={values.zipCode}
            onChange={(value) => updateField('zipCode', value)}
            error={errors.zipCode}
            required
            autoComplete="postal-code"
            placeholder="30534"
          />
          <FormField
            id="country"
            label="Country"
            value={values.country}
            onChange={(value) => updateField('country', value)}
            error={errors.country}
            required
            autoComplete="country-name"
            placeholder="United States"
          />
        </div>
      </section>

      <section className="client-form__section" aria-labelledby="social-options-heading">
        <h3 id="social-options-heading">Social Options</h3>
        <div className="client-form__grid">
          <FormField
            id="facebookUrl"
            label="Facebook URL"
            type="url"
            value={values.facebookUrl}
            onChange={(value) => updateField('facebookUrl', value)}
            error={errors.facebookUrl}
            optional
            wide
            placeholder="https://"
          />
          <FormField
            id="twitterUrl"
            label="Twitter URL"
            type="url"
            value={values.twitterUrl}
            onChange={(value) => updateField('twitterUrl', value)}
            error={errors.twitterUrl}
            optional
            wide
            placeholder="https://"
          />
          <FormField
            id="googlePlusUrl"
            label="Google+ URL"
            type="url"
            value={values.googlePlusUrl}
            onChange={(value) => updateField('googlePlusUrl', value)}
            error={errors.googlePlusUrl}
            optional
            wide
            placeholder="https://"
          />
        </div>
      </section>

      <div className="client-form__actions">
        <button className="clients-add" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Client'}
        </button>
        <button className="client-form__cancel" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddClientForm;
