import { Icon } from '../AdminIcons.jsx';
import StatusBadge from '../clients/StatusBadge.jsx';
import { formatActivityTime } from '../dashboard/format.js';
import { notificationIcon, notificationTone } from './format.js';

function NotificationItem({ item, onView, onMarkRead }) {
  const unread = item.status === 'Unread';

  return (
    <li className={`notifications-item${unread ? ' is-unread' : ''}`}>
      <span className="notifications-item__icon" aria-hidden="true">
        <Icon name={notificationIcon(item.type)} />
      </span>
      <div className="notifications-item__copy">
        <div className="notifications-item__meta">
          <StatusBadge tone={notificationTone(item.type)}>{item.type}</StatusBadge>
          <StatusBadge tone={unread ? 'pending' : 'neutral'}>{item.status}</StatusBadge>
        </div>
        <h3>{item.title}</h3>
        <p>{item.detail}</p>
        <time dateTime={item.occurredAt}>{formatActivityTime(item.occurredAt)}</time>
      </div>
      <div className="notifications-item__actions">
        {item.bookingId ? (
          <button className="clients-action" type="button" onClick={() => onView(item)}>
            <Icon name="eye" />
            View Booking
          </button>
        ) : null}
        {unread ? (
          <button className="clients-action" type="button" onClick={() => onMarkRead(item)}>
            Mark as read
          </button>
        ) : null}
      </div>
    </li>
  );
}

export default NotificationItem;
