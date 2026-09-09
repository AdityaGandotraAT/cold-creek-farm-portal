import { Link, useParams } from 'react-router-dom';
import BookingVendorSelections from '../../components/admin/bookings/BookingVendorSelections.jsx';
import '../../components/admin/bookings/bookings.css';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import StatusBadge from '../../components/admin/clients/StatusBadge.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import { bookings } from '../../data/bookingsMock.js';
import { getBookingVendorSelections } from '../../data/bookingVendorSelectionsMock.js';
import { getVendorSelectionLock } from '../../data/vendorSelectionLock.js';
import { bookingStatusTone, formatEventDate } from '../../components/admin/dashboard/format.js';

const copy = {
  add: {
    title: 'Add New Booking',
    description: 'Create a new Cold Creek Farm event booking.',
    message: 'Booking creation will be implemented here.',
  },
  view: {
    title: 'View Booking',
    description: 'Review event details, vendor selections, and the 90-day selection lock.',
    message: 'Booking details will be implemented here.',
  },
  edit: {
    title: 'Edit Booking',
    description: 'Update booking details.',
    message: 'Booking editing will be implemented here.',
  },
};

function BookingPlaceholderPage({ mode }) {
  const { bookingId } = useParams();
  const booking = bookings.find((item) => item.id === bookingId);
  const page = copy[mode];
  const title = booking ? `${page.title}: ${booking.coupleName}` : page.title;
  const selections = mode === 'view' && booking ? getBookingVendorSelections(booking.id) : null;
  const lock = booking ? getVendorSelectionLock(booking.eventDate) : null;

  return (
    <div className="clients-page">
      <Link className="client-form__back" to="/admin/bookings">
        ← Back to Bookings
      </Link>
      <PageHeader title={title} description={page.description} />
      {mode === 'view' && booking ? (
        <section className="client-form__section booking-summary">
          <h3>Event</h3>
          <dl className="booking-summary__grid">
            <div>
              <dt>Event Date</dt>
              <dd>{formatEventDate(booking.eventDate)}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>{booking.venue}</dd>
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
      ) : (
        <section className="client-form__section">
          <p>{page.message}</p>
        </section>
      )}
      {selections ? <BookingVendorSelections selections={selections} lock={lock} /> : null}
    </div>
  );
}

export default BookingPlaceholderPage;
