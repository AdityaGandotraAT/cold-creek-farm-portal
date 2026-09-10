import { Link, useNavigate, useParams } from 'react-router-dom';
import BookingForm from '../../components/admin/bookings/BookingForm.jsx';
import '../../components/admin/bookings/bookings.css';
import { bookingToForm, emptyBookingForm } from '../../components/admin/bookings/bookingForm.js';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import { addBooking, getBookingById, updateBooking } from '../../data/bookingsStore.js';

function BookingFormPage({ mode }) {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const booking = mode === 'edit' ? getBookingById(bookingId) : null;
  const isEdit = mode === 'edit';

  function handleCancel() {
    navigate(isEdit && booking ? `/admin/bookings/${booking.id}` : '/admin/bookings');
  }

  function handleSubmit(payload) {
    if (isEdit && booking) {
      updateBooking(booking.id, payload);
      navigate(`/admin/bookings/${booking.id}`);
      return;
    }

    const created = addBooking(payload);
    navigate(`/admin/bookings/${created.id}`);
  }

  if (isEdit && !booking) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/bookings">
          ← Back to Bookings
        </Link>
        <PageHeader title="Edit Booking" description="This booking could not be found." />
        <section className="client-form__section">
          <p>This booking could not be found.</p>
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
        submitLabel="Save"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default BookingFormPage;
