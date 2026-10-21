import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchVendors } from '../../../api/vendors.js';
import StatusBadge from './StatusBadge.jsx';
import { bookingStatusTone, formatEventDate } from './format.js';

function VendorBookingsPanel() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    fetchVendors()
      .then((rows) => {
        if (!active) {
          return;
        }

        const withBookings = (rows || [])
          .filter((vendor) => (vendor.bookings || []).length > 0)
          .sort((a, b) => a.name.localeCompare(b.name));
        setVendors(withBookings);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Unable to load vendor bookings');
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
  }, []);

  const summary =
    vendors.length === 1
      ? '1 vendor already aligned with an event.'
      : `${vendors.length} vendors already aligned with an event.`;

  return (
    <section className="dashboard-panel" aria-labelledby="vendor-bookings-heading">
      <div className="dashboard-panel__header">
        <div>
          <h2 id="vendor-bookings-heading">Vendors with bookings</h2>
          <p>{loading || error ? 'Vendors already aligned with an event.' : summary}</p>
        </div>
        <Link className="dashboard-panel__link" to="/admin/vendors">
          All vendors
        </Link>
      </div>

      {loading ? <p className="dashboard-empty">Loading vendor bookings…</p> : null}
      {!loading && error ? (
        <p className="dashboard-empty" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && vendors.length === 0 ? (
        <p className="dashboard-empty">No vendors are aligned with a booking yet.</p>
      ) : null}

      {!loading && !error && vendors.length > 0 ? (
        <>
          <div className="dashboard-table-wrap dashboard-table-wrap--vendor-orders">
            <table className="dashboard-table dashboard-vendor-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) =>
                  vendor.bookings.map((booking, index) => (
                    <tr
                      key={`${vendor.id}-${booking.id}-${booking.category}`}
                      className={index === 0 ? 'is-group-start' : undefined}
                    >
                      <td className="dashboard-vendor-table__vendor">
                        <Link to={`/admin/vendors/${vendor.id}`}>{vendor.name}</Link>
                      </td>
                      <td className="dashboard-vendor-table__category">{vendor.category}</td>
                      <td>
                        <Link to={`/admin/bookings/${booking.id}`}>{booking.eventName}</Link>
                      </td>
                      <td className="dashboard-vendor-table__date">
                        {formatEventDate(booking.eventDate)}
                      </td>
                      <td>
                        <StatusBadge tone={bookingStatusTone(booking.selectionStatus)}>
                          {booking.selectionStatus}
                        </StatusBadge>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>

          <ul className="dashboard-vendor-cards">
            {vendors.map((vendor) => (
              <li key={vendor.id} className="dashboard-vendor-card">
                <div className="dashboard-vendor-card__top">
                  <Link to={`/admin/vendors/${vendor.id}`}>{vendor.name}</Link>
                  <span>{vendor.category}</span>
                </div>
                <ul>
                  {vendor.bookings.map((booking) => (
                    <li key={`${booking.id}-${booking.category}`}>
                      <Link to={`/admin/bookings/${booking.id}`}>
                        <span>
                          {booking.eventName}
                          <small>{formatEventDate(booking.eventDate)}</small>
                        </span>
                        <StatusBadge tone={bookingStatusTone(booking.selectionStatus)}>
                          {booking.selectionStatus}
                        </StatusBadge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export default VendorBookingsPanel;
