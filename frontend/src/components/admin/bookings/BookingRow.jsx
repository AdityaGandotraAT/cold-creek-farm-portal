import { Icon } from '../AdminIcons.jsx';
import StatusBadge from '../clients/StatusBadge.jsx';
import {
  bookingStatusTone,
  formatEventDate,
  formatTimeRange,
} from '../dashboard/format.js';
import { REQUIRED_VENDOR_CATEGORIES } from '../../../data/bookingsMock.js';
import { getVendorSelectionLock } from '../../../data/vendorSelectionLock.js';

function BookingRow({ booking, onView, onEdit }) {
  const lock = getVendorSelectionLock(booking.eventDate);

  return (
    <tr>
      <td>
        <strong>{booking.coupleName}</strong>
      </td>
      <td>{booking.referenceNumber}</td>
      <td>{formatEventDate(booking.eventDate)}</td>
      <td>{formatTimeRange(booking.eventStartTime, booking.eventEndTime)}</td>
      <td>{booking.venue}</td>
      <td>{booking.guests}</td>
      <td>
        <StatusBadge tone={bookingStatusTone(booking.bookingStatus)}>
          {booking.bookingStatus}
        </StatusBadge>
      </td>
      <td>
        <div className="bookings-progress-cell">
          <span className="bookings-progress">
            {booking.selectedCount} / {REQUIRED_VENDOR_CATEGORIES}
          </span>
          <StatusBadge tone={lock.status === 'Open' ? 'confirmed' : 'pending'}>
            {lock.status}
          </StatusBadge>
        </div>
      </td>
      <td>
        <div className="clients-table__actions">
          <button className="clients-action" type="button" onClick={() => onView(booking)}>
            <Icon name="eye" />
            View
          </button>
          <button className="clients-action" type="button" onClick={() => onEdit(booking)}>
            <Icon name="edit" />
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
}

export default BookingRow;
