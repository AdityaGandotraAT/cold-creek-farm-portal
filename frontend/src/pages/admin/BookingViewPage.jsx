import { Link, useNavigate, useParams } from 'react-router-dom';
import BookingVendorSelections from '../../components/admin/bookings/BookingVendorSelections.jsx';
import '../../components/admin/bookings/bookings.css';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import StatusBadge from '../../components/admin/clients/StatusBadge.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import { bookingStatusTone, formatEventDate, formatTimeRange } from '../../components/admin/dashboard/format.js';
import { getBookingVendorSelections } from '../../data/bookingVendorSelectionsMock.js';
import { getBookingById } from '../../data/bookingsStore.js';
import { getVendorSelectionLock } from '../../data/vendorSelectionLock.js';

function BookingViewPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const booking = getBookingById(bookingId);

  if (!booking) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/bookings">
          ← Back to Bookings
        </Link>
        <PageHeader title="View Booking" description="This booking could not be found." />
        <section className="client-form__section">
          <p>This booking could not be found.</p>
        </section>
      </div>
    );
  }

  const selections = getBookingVendorSelections(booking.id);
  const lock = getVendorSelectionLock(booking.eventDate);

  return (
    <div className="clients-page">
      <Link className="client-form__back" to="/admin/bookings">
        ← Back to Bookings
      </Link>
      <PageHeader
        title={`View Booking: ${booking.name}`}
        description="Review event details, vendor selections, and the 90-day selection lock."
        action={
          <button
            className="clients-add"
            type="button"
            onClick={() => navigate(`/admin/bookings/${booking.id}/edit`)}
          >
            Edit
          </button>
        }
      />
      <section className="client-form__section booking-summary">
        <h3>Event</h3>
        <dl className="booking-summary__grid">
          <div>
            <dt>Name</dt>
            <dd>{booking.name}</dd>
          </div>
          <div>
            <dt>Booking/Reference Number</dt>
            <dd>{booking.referenceNumber}</dd>
          </div>
          <div>
            <dt>Event Date</dt>
            <dd>{formatEventDate(booking.eventDate)}</dd>
          </div>
          <div>
            <dt>Event Time</dt>
            <dd>{formatTimeRange(booking.eventStartTime, booking.eventEndTime)}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{booking.venue}</dd>
          </div>
          <div>
            <dt>Guests</dt>
            <dd>{booking.guests}</dd>
          </div>
          <div>
            <dt>Booking Status</dt>
            <dd>
              <StatusBadge tone={bookingStatusTone(booking.bookingStatus)}>
                {booking.bookingStatus}
              </StatusBadge>
            </dd>
          </div>
          <div>
            <dt>Vendor Selection</dt>
            <dd>
              <StatusBadge tone={lock?.status === 'Open' ? 'confirmed' : 'pending'}>
                {lock?.status || 'Unknown'}
              </StatusBadge>
            </dd>
          </div>
        </dl>
      </section>
      <BookingVendorSelections selections={selections} lock={lock} />
    </div>
  );
}

export default BookingViewPage;
