import { Link } from 'react-router-dom';
import StatusBadge from '../../components/admin/clients/StatusBadge.jsx';
import '../../components/admin/clients/clients.css';
import { bookingStatusTone, formatTimeRange } from '../../components/admin/dashboard/format.js';
import { useClientBooking } from '../../hooks/useClientBooking.js';
import { formatFarmDate } from '../../data/farmTime.js';

function ClientBookingPage() {
  const { booking, loading, error } = useClientBooking();

  if (loading) {
    return (
      <div className="client-booking">
        <header className="client-booking__intro">
          <div>
            <p className="client-stub__kicker">Your event</p>
            <h2>My Booking</h2>
            <p>Loading your event details...</p>
          </div>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-booking">
        <header className="client-booking__intro">
          <div>
            <p className="client-stub__kicker">Your event</p>
            <h2>My Booking</h2>
            <p>{error}</p>
          </div>
        </header>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="client-booking">
        <header className="client-booking__intro">
          <div>
            <p className="client-stub__kicker">Your event</p>
            <h2>No booking yet</h2>
            <p>
              Cold Creek Farm has not assigned an event to this account. Check back after the
              farm creates your booking.
            </p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="client-booking">
      <header className="client-booking__intro">
        <div>
          <p className="client-stub__kicker">Your event</p>
          <h2>{booking.eventName}</h2>
          <p>
            Details for this booking are managed by Cold Creek Farm. Contact the farm if
            something needs updating.
          </p>
        </div>
        <StatusBadge tone={bookingStatusTone(booking.bookingStatus)}>
          {booking.bookingStatus}
        </StatusBadge>
      </header>

      <section className="client-welcome__grid" aria-label="When and where">
        <article className="client-welcome__card">
          <p className="client-welcome__card-label">Event date</p>
          <p className="client-welcome__card-value">{formatFarmDate(booking.eventDate)}</p>
          <p className="client-welcome__card-hint">{booking.eventType || 'Event'}</p>
        </article>
        <article className="client-welcome__card">
          <p className="client-welcome__card-label">Event time</p>
          <p className="client-welcome__card-value">
            {formatTimeRange(booking.eventStartTime, booking.eventEndTime)}
          </p>
          <p className="client-welcome__card-hint">{booking.venue}</p>
        </article>
        <article className="client-welcome__card">
          <p className="client-welcome__card-label">Guests</p>
          <p className="client-welcome__card-value">{booking.guests}</p>
          <p className="client-welcome__card-hint">Expected count</p>
        </article>
      </section>

      <section className="client-booking__panel" aria-labelledby="client-booking-details">
        <h3 id="client-booking-details">Booking details</h3>
        <dl className="client-booking__facts">
          <div>
            <dt>Couple name</dt>
            <dd>{booking.name}</dd>
          </div>
          <div>
            <dt>Event type</dt>
            <dd>{booking.eventType || '—'}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{booking.venue}</dd>
          </div>
          <div>
            <dt>Booking / reference number</dt>
            <dd>{booking.referenceNumber}</dd>
          </div>
          <div>
            <dt>Booking status</dt>
            <dd>
              <StatusBadge tone={bookingStatusTone(booking.bookingStatus)}>
                {booking.bookingStatus}
              </StatusBadge>
            </dd>
          </div>
        </dl>
      </section>

      <section className="client-booking__panel" aria-labelledby="client-booking-notes">
        <h3 id="client-booking-notes">Important notes</h3>
        <p className="client-booking__notes">
          {booking.notes || 'No special requirements have been noted for this event.'}
        </p>
      </section>

      <div className="client-welcome__strip">
        <p>
          <strong>Need a change?</strong> Date, time, venue, and guest count are updated by
          Cold Creek Farm. You can review vendor picks whenever you are ready.
        </p>
        <Link className="client-welcome__cta" to="/client/vendors">
          Vendor selections
        </Link>
      </div>
    </div>
  );
}

export default ClientBookingPage;
