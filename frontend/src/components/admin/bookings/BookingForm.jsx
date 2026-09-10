import { useState } from 'react';
import { bookingStatusOptions, venueOptions } from '../../../data/bookingsMock.js';
import FormField from '../clients/FormField.jsx';
import {
  emptyBookingForm,
  toBookingPayload,
  validateBookingForm,
} from './bookingForm.js';

function BookingForm({
  initialValues = emptyBookingForm,
  referenceNumber,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}) {
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
    const nextErrors = validateBookingForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstError = document.querySelector(
        '.client-form .is-invalid input, .client-form .is-invalid select, .client-form .is-invalid textarea',
      );
      firstError?.focus();
      return;
    }

    setIsSubmitting(true);
    onSubmit(toBookingPayload(values));
    setIsSubmitting(false);
  }

  return (
    <form className="client-form" onSubmit={handleSubmit} noValidate>
      <section className="client-form__section" aria-labelledby="booking-event-heading">
        <h3 id="booking-event-heading">Event</h3>
        {referenceNumber ? (
          <p className="booking-form__note">Booking {referenceNumber}</p>
        ) : null}
        <p className="booking-form__note">
          Vendor selections are made by the client. They are not edited on this form.
        </p>
        <div className="client-form__grid">
          <FormField
            id="name"
            label="Name"
            value={values.name}
            onChange={(value) => updateField('name', value)}
            error={errors.name}
            required
            wide
            autoComplete="name"
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
            value={values.venue}
            onChange={(value) => updateField('venue', value)}
            error={errors.venue}
            required
            options={venueOptions}
            placeholder="Select a venue"
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
