import { Icon } from '../AdminIcons.jsx';
import StatusBadge from '../clients/StatusBadge.jsx';
import {
  bookingStatusTone,
  formatEventDate,
} from '../dashboard/format.js';
import { REQUIRED_VENDOR_CATEGORIES } from '../../../data/bookingsMock.js';
import { getVendorSelectionLock } from '../../../data/vendorSelectionLock.js';

function progressTone(selectedCount) {
  if (selectedCount >= REQUIRED_VENDOR_CATEGORIES) {
    return 'confirmed';
  }
  if (selectedCount > 0) {
    return 'pending';
  }
  return 'neutral';
}

function progressLabel(selectedCount) {
  if (selectedCount >= REQUIRED_VENDOR_CATEGORIES) {
    return 'Complete';
  }
  if (selectedCount > 0) {
    return 'In progress';
  }
  return 'Not started';
}

function SelectionRow({ booking, onView }) {
  const lock = getVendorSelectionLock(booking.eventDate);
  const selectedCount = Number(booking.selectedCount) || 0;

  return (
    <tr>
      <td>
        <strong>{booking.eventName || booking.name}</strong>
      </td>
      <td>{booking.referenceNumber}</td>
      <td>{formatEventDate(booking.eventDate)}</td>
      <td>
        <StatusBadge tone={bookingStatusTone(booking.bookingStatus)}>
          {booking.bookingStatus}
        </StatusBadge>
      </td>
      <td>
        <div className="bookings-progress-cell">
          <span className="bookings-progress">
            {selectedCount} / {REQUIRED_VENDOR_CATEGORIES}
          </span>
          <StatusBadge tone={progressTone(selectedCount)}>
            {progressLabel(selectedCount)}
          </StatusBadge>
        </div>
      </td>
      <td>
        <StatusBadge tone={lock.status === 'Open' ? 'confirmed' : 'pending'}>
          {lock.status}
        </StatusBadge>
      </td>
      <td>
        <div className="clients-table__actions">
          <button className="clients-action" type="button" onClick={() => onView(booking)}>
            <Icon name="eye" />
            View Booking
          </button>
        </div>
      </td>
    </tr>
  );
}

function SelectionCard({ booking, onView }) {
  const lock = getVendorSelectionLock(booking.eventDate);
  const selectedCount = Number(booking.selectedCount) || 0;

  return (
    <li className="clients-card">
      <div className="clients-card__top">
        <strong>{booking.eventName || booking.name}</strong>
        <StatusBadge tone={progressTone(selectedCount)}>
          {progressLabel(selectedCount)}
        </StatusBadge>
      </div>
      <p>{booking.referenceNumber}</p>
      <p>{formatEventDate(booking.eventDate)}</p>
      <p>
        {selectedCount} / {REQUIRED_VENDOR_CATEGORIES} selected · Selection {lock.status}
      </p>
      <div className="clients-card__actions">
        <button className="clients-action" type="button" onClick={() => onView(booking)}>
          <Icon name="eye" />
          View Booking
        </button>
      </div>
    </li>
  );
}

function SelectionTable({ bookings, onView }) {
  if (bookings.length === 0) {
    return (
      <div className="clients-empty bookings-empty">
        <Icon name="vendors" />
        <p>No vendor selections found.</p>
        <span>Try a different search or filter, or open a booking to review its selections.</span>
      </div>
    );
  }

  return (
    <>
      <div className="clients-table-wrap bookings-table-wrap">
        <table className="clients-table selections-table">
          <thead>
            <tr>
              <th>Client / Event</th>
              <th>Reference</th>
              <th>Event Date</th>
              <th>Booking Status</th>
              <th>Selections</th>
              <th>Lock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <SelectionRow key={booking.id} booking={booking} onView={onView} />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="clients-cards">
        {bookings.map((booking) => (
          <SelectionCard key={booking.id} booking={booking} onView={onView} />
        ))}
      </ul>
    </>
  );
}

export default SelectionTable;
