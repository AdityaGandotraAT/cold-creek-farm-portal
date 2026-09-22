import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import BookingVendorSelections from '../../components/admin/bookings/BookingVendorSelections.jsx';
import '../../components/admin/bookings/bookings.css';
import ClientDeleteModal from '../../components/admin/clients/ClientDeleteModal.jsx';
import ClientSuccessModal from '../../components/admin/clients/ClientSuccessModal.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import StatusBadge from '../../components/admin/clients/StatusBadge.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import { bookingStatusTone, formatEventDate, formatTimeRange } from '../../components/admin/dashboard/format.js';
import {
  deleteBooking,
  ensureBooking,
  ensureBookingVendorSelections,
  getBookingById,
} from '../../data/bookingsStore.js';
import { getVendorSelectionLock } from '../../data/vendorSelectionLock.js';

function BookingViewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(
    () => location.state?.booking || getBookingById(bookingId),
  );
  const [selections, setSelections] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!booking);
  const [successNotice, setSuccessNotice] = useState(() => {
    if (location.state?.bookingNotice && location.state?.bookingName) {
      return {
        kind: location.state.bookingNotice,
        clientName: location.state.bookingName,
      };
    }
    return null;
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      if (!bookingId) {
        setError('Invalid booking');
        setLoading(false);
        return;
      }

      if (!booking) {
        setLoading(true);
      }

      try {
        const record = await ensureBooking(bookingId);
        const vendorSelections = await ensureBookingVendorSelections(bookingId);
        if (active) {
          setBooking(record);
          setSelections(vendorSelections);
          setError('');
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
  }, [bookingId]);

  async function handleDeleteConfirm() {
    if (!booking || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const removed = await deleteBooking(booking.id);
      navigate('/admin/bookings', {
        state: {
          bookingNotice: 'bookingDeleted',
          bookingName: removed.name,
        },
      });
    } catch (err) {
      setDeleteError(err.message || 'Unable to delete booking');
      setIsDeleting(false);
    }
  }

  if (loading && !booking) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/bookings">
          ← Back to Bookings
        </Link>
        <PageHeader title="View Booking" description="Loading booking details..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/bookings">
          ← Back to Bookings
        </Link>
        <PageHeader title="View Booking" description={error || 'This booking could not be found.'} />
        <section className="client-form__section">
          <p>{error || 'This booking could not be found.'}</p>
        </section>
      </div>
    );
  }

  const lock = getVendorSelectionLock(booking.eventDate);

  return (
    <div className="clients-page">
      <Link className="client-form__back" to="/admin/bookings">
        ← Back to Bookings
      </Link>
      <PageHeader
        title={`View Booking: ${booking.eventName || booking.name}`}
        description="Review event details, vendor selections, and the 90-day selection lock."
        action={
          <div className="clients-header__actions">
            <Link className="clients-add" to={`/admin/bookings/${booking.id}/edit`}>
              Edit
            </Link>
            <button className="clients-delete" type="button" onClick={() => setDeleteOpen(true)}>
              Delete
            </button>
          </div>
        }
      />
      {deleteError ? (
        <p className="client-form__error" role="alert">
          {deleteError}
        </p>
      ) : null}
      <section className="client-form__section booking-summary">
        <h3>Event</h3>
        <dl className="booking-summary__grid">
          <div>
            <dt>Name</dt>
            <dd>{booking.name}</dd>
          </div>
          <div>
            <dt>Client</dt>
            <dd>{booking.clientName || 'Not assigned'}</dd>
          </div>
          <div>
            <dt>Event Name</dt>
            <dd>{booking.eventName}</dd>
          </div>
          <div>
            <dt>Event Type</dt>
            <dd>{booking.eventType || '—'}</dd>
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
        {booking.notes ? (
          <div className="booking-summary__notes">
            <h4>Important notes</h4>
            <p>{booking.notes}</p>
          </div>
        ) : null}
      </section>
      <BookingVendorSelections selections={selections} lock={lock} />

      {successNotice ? (
        <ClientSuccessModal
          kind={successNotice.kind}
          clientName={successNotice.clientName}
          onClose={() => setSuccessNotice(null)}
        />
      ) : null}
      {deleteOpen ? (
        <ClientDeleteModal
          clientName={booking.name}
          entityLabel="booking"
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            if (!isDeleting) {
              setDeleteOpen(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}

export default BookingViewPage;
