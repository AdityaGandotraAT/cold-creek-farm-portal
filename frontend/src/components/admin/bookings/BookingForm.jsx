import { useState } from 'react';
import { bookingStatusOptions, eventTypeOptions } from '../../../data/bookingsMock.js';
import FormField from '../clients/FormField.jsx';
import {
  DEFAULT_VENUE,
  emptyBookingForm,
  toBookingPayload,
  validateBookingForm,
} from './bookingForm.js';

function BookingForm({
  initialValues = emptyBookingForm,
  referenceNumber,
  clientOptions = [],
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState({ ...initialValues, venue: DEFAULT_VENUE });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name, value) {
    if (name === 'venue') {
      return;
    }

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
    const nextErrors = validateBookingForm({ ...values, venue: DEFAULT_VENUE });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstError = document.querySelector(
        '.client-form .is-invalid input, .client-form .is-invalid select, .client-form .is-invalid textarea',
      );
      firstError?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit(toBookingPayload({ ...values, venue: DEFAULT_VENUE }));
    } catch (err) {
      setSubmitError(err.message || 'Unable to save booking');
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
      <section className="client-form__section" aria-labelledby="booking-event-heading">
        <h3 id="booking-event-heading">Event</h3>
        {referenceNumber ? (
          <p className="booking-form__note">Booking {referenceNumber}</p>
        ) : null}
        <p className="booking-form__note">
          Choose the client who should see this booking in their portal. Vendor selections are
          made by the client and are not edited on this form.
        </p>
        <div className="client-form__grid">
          <FormField
            id="clientId"
            label="Client"
            value={values.clientId}
            onChange={(value) => updateField('clientId', value)}
            error={errors.clientId}
            options={clientOptions}
            placeholder="Select a client"
            required
            wide
          />
          <FormField
            id="name"
            label="Name"
            value={values.name}
            onChange={(value) => updateField('name', value)}
            error={errors.name}
            required
            wide
            autoComplete="name"
            placeholder="Couple or contact name"
          />
          <FormField
            id="eventName"
            label="Event Name"
            value={values.eventName}
            onChange={(value) => updateField('eventName', value)}
            error={errors.eventName}
            required
            wide
            placeholder="Event name"
          />
          <FormField
            id="eventType"
            label="Event Type"
            value={values.eventType}
            onChange={(value) => updateField('eventType', value)}
            error={errors.eventType}
            options={eventTypeOptions}
            placeholder="Select an event type"
            optional
          />
          <FormField
            id="eventDate"
            label="Event Date"
            type="date"
            value={values.eventDate}
            onChange={(value) => updateField('eventDate', value)}
            error={errors.eventDate}
            required
          />
          <FormField
            id="venue"
            label="Venue"
            value={DEFAULT_VENUE}
            onChange={() => {}}
            readOnly
          />
          <FormField
            id="eventStartTime"
            label="Start Time"
            type="time"
            value={values.eventStartTime}
            onChange={(value) => updateField('eventStartTime', value)}
            error={errors.eventStartTime}
            required
          />
          <FormField
            id="eventEndTime"
            label="End Time"
            type="time"
            value={values.eventEndTime}
            onChange={(value) => updateField('eventEndTime', value)}
            error={errors.eventEndTime}
            required
          />
          <FormField
            id="guests"
            label="Guests"
            type="number"
            min={1}
            step={1}
            value={values.guests}
            onChange={(value) => updateField('guests', value)}
            error={errors.guests}
            required
          />
          <FormField
            id="bookingStatus"
            label="Booking Status"
            value={values.bookingStatus}
            onChange={(value) => updateField('bookingStatus', value)}
            error={errors.bookingStatus}
            required
            options={bookingStatusOptions}
          />
          <FormField
            id="notes"
            label="Important notes"
            type="textarea"
            value={values.notes}
            onChange={(value) => updateField('notes', value)}
            error={errors.notes}
            optional
            wide
            rows={4}
            placeholder="Special requirements, accessibility, ceremony notes"
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

export default BookingForm;
