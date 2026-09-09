import StatusBadge from '../clients/StatusBadge.jsx';
import { formatEventDate } from '../dashboard/format.js';
import { getVendorSelectionLockDays } from '../../../data/vendorSelectionLock.js';

function lockTone(status) {
  if (status === 'Open') {
    return 'confirmed';
  }

  if (status === 'Locked') {
    return 'pending';
  }

  return 'neutral';
}

function remainingLabel(lock) {
  if (lock.status === 'Unknown' || lock.daysUntilDeadline == null) {
    return 'Event date is missing.';
  }

  if (!lock.locked) {
    const days = lock.daysUntilDeadline;
    return days === 1 ? '1 day remaining' : `${days} days remaining`;
  }

  if (lock.daysUntilDeadline === 0) {
    return `Locked today · ${getVendorSelectionLockDays()} days before the event`;
  }

  return `Within ${getVendorSelectionLockDays()} days of the event`;
}

function VendorSelectionLockStatus({ lock }) {
  const open = lock.status === 'Open';

  return (
    <div className={`booking-lock${open ? ' is-open' : ' is-locked'}`}>
      <div className="booking-lock__copy">
        <div className="booking-lock__title">
          <span>Vendor selection</span>
          <StatusBadge tone={lockTone(lock.status)}>{lock.status}</StatusBadge>
        </div>
        {lock.deadlineDate ? (
          <p>
            Deadline {formatEventDate(lock.deadlineDate)}
            <span aria-hidden="true"> · </span>
            {remainingLabel(lock)}
          </p>
        ) : (
          <p>{remainingLabel(lock)}</p>
        )}
        <p className="booking-lock__rule">
          {open
            ? 'Clients can select and change vendors until this deadline.'
            : 'Clients cannot select a new vendor or change an existing selection.'}
        </p>
      </div>
    </div>
  );
}

export default VendorSelectionLockStatus;
