import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BookingForm from '../../components/admin/bookings/BookingForm.jsx';
import '../../components/admin/bookings/bookings.css';
import { bookingToForm, emptyBookingForm } from '../../components/admin/bookings/bookingForm.js';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import { fetchClients } from '../../api/clients.js';
import {
  addBooking,
  ensureBooking,
  getBookingById,
  updateBooking,
} from '../../data/bookingsStore.js';

function BookingFormPage({ mode }) {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const isEdit = mode === 'edit';
  const [booking, setBooking] = useState(() => (isEdit ? getBookingById(bookingId) : null));
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(isEdit && !booking);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadClients() {
      try {
        const records = await fetchClients();
        if (active) {
          setClients(records);
        }
      } catch {
        if (active) {
          setClients([]);
        }
      }
    }

    loadClients();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEdit) {
      return undefined;
    }

    let active = true;

    async function load() {
      if (!booking) {
        setLoading(true);
      }
      setError('');

      try {
        const record = await ensureBooking(bookingId);
        if (active) {
          setBooking(record);
        }
      } catch (err) {
        if (active && !booking) {
          setError(err.message || 'Unable to load booking');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [bookingId, isEdit]);

  const clientOptions = useMemo(() => {
    const options = clients.map((client) => ({
      value: client.id,
      label: `${client.name} (${client.email})`,
    }));

    if (booking?.clientId && !options.some((option) => option.value === booking.clientId)) {
      options.unshift({
        value: booking.clientId,
        label: booking.clientName || 'Assigned client',
      });
    }

    return options;
  }, [booking, clients]);

  function handleCancel() {
    navigate(isEdit && booking ? `/admin/bookings/${booking.id}` : '/admin/bookings');
  }

  async function handleSubmit(payload) {
    const hasClient = Boolean(payload.clientId);
    if (isEdit && booking) {
      const result = await updateBooking(booking.id, payload);
      navigate(`/admin/bookings/${result.booking.id}`, {
        state: {
          bookingNotice: result.emailSent
            ? 'bookingUpdatedEmailed'
            : hasClient
              ? 'bookingUpdatedEmailFailed'
              : 'bookingUpdated',
          bookingName: result.booking.name,
          booking: result.booking,
        },
      });
      return;
    }

    const result = await addBooking(payload);
    navigate(`/admin/bookings/${result.booking.id}`, {
      state: {
        bookingNotice: result.emailSent
          ? 'bookingCreatedEmailed'
          : hasClient
            ? 'bookingCreatedEmailFailed'
            : 'bookingCreated',
        bookingName: result.booking.name,
        booking: result.booking,
      },
    });
  }

  if (isEdit && loading && !booking) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/bookings">
          ← Back to Bookings
        </Link>
        <PageHeader title="Edit Booking" description="Loading booking details..." />
      </div>
    );
  }

  if (isEdit && !booking) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/bookings">
          ← Back to Bookings
        </Link>
        <PageHeader title="Edit Booking" description={error || 'This booking could not be found.'} />
        <section className="client-form__section">
          <p>{error || 'This booking could not be found.'}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="clients-page">
      <Link className="client-form__back" to="/admin/bookings">
        ← Back to Bookings
      </Link>
      <PageHeader
        title={isEdit ? `Edit Booking: ${booking.name}` : 'Add New Booking'}
        description={
          isEdit
            ? 'Update this Cold Creek Farm event booking.'
            : 'Create a new Cold Creek Farm event booking.'
        }
      />
      <BookingForm
        key={booking?.id || 'new'}
        initialValues={isEdit ? bookingToForm(booking) : emptyBookingForm}
        referenceNumber={isEdit ? booking.referenceNumber : undefined}
        clientOptions={clientOptions}
        submitLabel="Save"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default BookingFormPage;
