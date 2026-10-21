import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchVendorBookings } from '../../../api/vendors.js';
import { bookingStatusTone, formatEventDate } from '../dashboard/format.js';
import { Icon } from '../AdminIcons.jsx';
import StatusBadge from '../clients/StatusBadge.jsx';

function VendorBookings({ vendorId }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');
    fetchVendorBookings(vendorId)
      .then((data) => {
        if (!active) {
          return;
        }
        setBookings(data.bookings || []);
        setCount(Number(data.count) || 0);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Unable to load bookings for this vendor');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [vendorId]);

  const heading =
    count === 1 ? 'Bookings (1)' : `Bookings (${loading ? '…' : count})`;

  return (
    <section className="client-form__section" aria-labelledby="vendor-bookings-heading">
      <h3 id="vendor-bookings-heading">{heading}</h3>
      <p className="vendor-form__note">
        Events this vendor is aligned with, and the status of each selection.
      </p>

      {loading ? <p>Loading bookings...</p> : null}
      {!loading && error ? (
        <p className="client-form__error" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && bookings.length === 0 ? (
        <div className="clients-empty">
          <p>This vendor is not aligned with any bookings.</p>
        </div>
      ) : null}
      {!loading && !error && bookings.length > 0 ? (
        <>
          <div className="clients-table-wrap">
            <table className="clients-table vendor-bookings-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={`${booking.id}-${booking.category}`}>
                    <td>
                      <strong>{booking.eventName}</strong>
                      <div className="clients-table__ref">{booking.referenceNumber}</div>
                    </td>
                    <td>{booking.clientName}</td>
                    <td>{formatEventDate(booking.eventDate)}</td>
                    <td>{booking.category}</td>
                    <td>
                      <StatusBadge tone={bookingStatusTone(booking.selectionStatus)}>
                        {booking.selectionStatus}
                      </StatusBadge>
                    </td>
                    <td>
                      <button
                        className="clients-action"
                        type="button"
                        onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                      >
                        <Icon name="eye" />
                        View Booking
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="clients-cards">
            {bookings.map((booking) => (
              <li key={`${booking.id}-${booking.category}`} className="clients-card">
                <div className="clients-card__top">
                  <strong>{booking.eventName}</strong>
                  <StatusBadge tone={bookingStatusTone(booking.selectionStatus)}>
                    {booking.selectionStatus}
                  </StatusBadge>
                </div>
                <p>{booking.clientName}</p>
                <p>
                  {formatEventDate(booking.eventDate)} · {booking.category}
                </p>
                <button
                  className="clients-action"
                  type="button"
                  onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                >
                  <Icon name="eye" />
                  View Booking
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export default VendorBookings;
