import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../AdminIcons.jsx';
import ProgressBar from './ProgressBar.jsx';
import StatusBadge from './StatusBadge.jsx';
import { bookingStatusTone, formatEventDate } from './format.js';

function UpcomingEvents({ events }) {
  const navigate = useNavigate();

  function openEvent(event) {
    navigate(event.bookingId ? `/admin/bookings/${event.bookingId}` : '/admin/bookings');
  }

  return (
    <section className="dashboard-panel" aria-labelledby="upcoming-events-heading">
      <div className="dashboard-panel__header">
        <div>
          <h2 id="upcoming-events-heading">Upcoming Events</h2>
          <p>Next bookings on the calendar, with vendor selection progress.</p>
        </div>
        <Link className="dashboard-panel__link" to="/admin/bookings">
          View all bookings
        </Link>
      </div>

      <div className="dashboard-table-wrap dashboard-table-wrap--events">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Event Date</th>
              <th>Venue</th>
              <th>Booking Status</th>
              <th>Vendor Selection</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <strong>{event.clientName}</strong>
                </td>
                <td>{formatEventDate(event.eventDate)}</td>
                <td>{event.venue}</td>
                <td>
                  <StatusBadge tone={bookingStatusTone(event.bookingStatus)}>
                    {event.bookingStatus}
                  </StatusBadge>
                </td>
                <td>
                  <ProgressBar
                    value={event.selectedCount}
                    max={event.requiredCount}
                    label={`Vendor selection for ${event.clientName}`}
                  />
                </td>
                <td>
                  <button className="dashboard-action" type="button" onClick={() => openEvent(event)}>
                    <Icon name="eye" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="dashboard-event-cards">
        {events.map((event) => (
          <li key={event.id} className="dashboard-event-card">
            <div className="dashboard-event-card__top">
              <strong>{event.clientName}</strong>
              <StatusBadge tone={bookingStatusTone(event.bookingStatus)}>
                {event.bookingStatus}
              </StatusBadge>
            </div>
            <p>
              {formatEventDate(event.eventDate)} · {event.venue}
            </p>
            <ProgressBar
              value={event.selectedCount}
              max={event.requiredCount}
              label={`Vendor selection for ${event.clientName}`}
            />
            <button className="dashboard-action" type="button" onClick={() => openEvent(event)}>
              <Icon name="eye" />
              View
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default UpcomingEvents;
