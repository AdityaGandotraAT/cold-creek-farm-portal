import { Link } from 'react-router-dom';
import { getSession } from '../../auth/session.js';
import StatusBadge from '../../components/admin/clients/StatusBadge.jsx';
import '../../components/admin/clients/clients.css';
import { bookingStatusTone } from '../../components/admin/dashboard/format.js';
import venuePhoto from '../../assets/login-venue.webp';
import { REQUIRED_VENDOR_CATEGORIES } from '../../data/bookingsMock.js';
import { farmHour, formatFarmDate } from '../../data/farmTime.js';
import { useClientBooking } from '../../hooks/useClientBooking.js';

function greetingForHour(hour) {
  if (hour < 12) {
    return 'Welcome back';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function ClientDashboardPage() {
  const session = getSession();
  const firstName = session?.user?.firstName || 'there';
  const { booking, loading, error } = useClientBooking();
  const selected = booking?.selectedCount || 0;

  return (
    <div className="client-welcome">
      <section className="client-welcome__hero" aria-label="Welcome">
        <img className="client-welcome__hero-photo" src={venuePhoto} alt="" />
        <div className="client-welcome__hero-veil" aria-hidden="true" />
        <div className="client-welcome__hero-copy">
          <p className="client-welcome__eyebrow">Cold Creek Farm · Client Portal</p>
          <h2>
            {greetingForHour(farmHour())}, {firstName}.
          </h2>
          <p>Your celebration details, vendors, and updates live here — quietly, beautifully.</p>
          {booking ? (
            <span className="client-welcome__event">
              {booking.eventName} · {formatFarmDate(booking.eventDate)}
            </span>
          ) : (
            <span className="client-welcome__event">
              {loading ? 'Loading your event…' : error || 'No booking assigned yet'}
            </span>
          )}
        </div>
      </section>

      <section className="client-welcome__grid" aria-label="At a glance">
        <article className="client-welcome__card">
          <p className="client-welcome__card-label">Your event</p>
          <p className="client-welcome__card-value">
            {booking?.eventName || (loading ? 'Loading…' : 'Not assigned')}
          </p>
          <p className="client-welcome__card-hint">
            {booking ? `${booking.venue} · ${booking.guests} guests` : 'Waiting on Cold Creek Farm'}
          </p>
        </article>

        <article className="client-welcome__card">
          <p className="client-welcome__card-label">Booking status</p>
          <p className="client-welcome__card-value">
            {booking ? (
              <StatusBadge tone={bookingStatusTone(booking.bookingStatus)}>
                {booking.bookingStatus}
              </StatusBadge>
            ) : (
              '—'
            )}
          </p>
          <p className="client-welcome__card-hint">{booking?.referenceNumber || 'No reference yet'}</p>
        </article>

        <Link className="client-welcome__card" to="/client/vendors">
          <p className="client-welcome__card-label">Vendors</p>
          <p className="client-welcome__card-value">
            {booking ? `${selected} of ${REQUIRED_VENDOR_CATEGORIES}` : '—'}
          </p>
          <p className="client-welcome__card-hint">
            {booking ? 'From this booking' : 'Available after a booking is assigned'}
          </p>
        </Link>
      </section>

      <div className="client-welcome__strip">
        <p>
          <strong>Next up:</strong> review your booking details, then finish any open vendor
          categories when you are ready.
        </p>
        <Link className="client-welcome__cta" to="/client/booking">
          View my booking
        </Link>
      </div>
    </div>
  );
}

export default ClientDashboardPage;
