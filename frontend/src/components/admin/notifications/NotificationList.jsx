import { Icon } from '../AdminIcons.jsx';
import NotificationItem from './NotificationItem.jsx';

function NotificationList({ notifications, onView, onMarkRead }) {
  if (notifications.length === 0) {
    return (
      <div className="clients-empty notifications-empty">
        <Icon name="notifications" />
        <p>No notifications found.</p>
        <span>Try a different search, status, or notification type.</span>
      </div>
    );
  }

  return (
    <ul className="notifications-list">
      {notifications.map((item) => (
        <NotificationItem key={item.id} item={item} onView={onView} onMarkRead={onMarkRead} />
      ))}
    </ul>
  );
}

export default NotificationList;
