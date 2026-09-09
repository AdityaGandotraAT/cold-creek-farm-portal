import { useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import Filter from '../../components/admin/clients/Filter.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import SearchBar from '../../components/admin/clients/SearchBar.jsx';
import '../../components/admin/clients/clients.css';
import NotificationList from '../../components/admin/notifications/NotificationList.jsx';
import '../../components/admin/notifications/notifications.css';
import {
  notificationStatusOptions,
  notificationTypeOptions,
} from '../../data/notificationsMock.js';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
} from '../../data/notificationsStore.js';

function matchesSearch(item, query) {
  if (!query) {
    return true;
  }

  const haystack = [item.title, item.detail, item.relatedName, item.type].join(' ').toLowerCase();
  return haystack.includes(query);
}

function NotificationsPage() {
  const navigate = useNavigate();
  const notifications = useSyncExternalStore(
    subscribeNotifications,
    getNotifications,
    getNotifications,
  );
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Unread');
  const [type, setType] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const unreadCount = notifications.filter((item) => item.status === 'Unread').length;

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((item) => {
        if (!matchesSearch(item, normalizedQuery)) {
          return false;
        }

        if (status && item.status !== status) {
          return false;
        }

        if (type && item.type !== type) {
          return false;
        }

        return true;
      }),
    [notifications, normalizedQuery, status, type],
  );

  return (
    <div className="clients-page">
      <PageHeader
        title="Notifications"
        description="Review booking, vendor, and client alerts for Cold Creek Farm. Email delivery will be connected later."
        action={
          unreadCount > 0 ? (
            <button
              className="clients-add notifications-mark-all"
              type="button"
              onClick={() => markAllNotificationsRead()}
            >
              Mark all as read
            </button>
          ) : null
        }
      />

      <div className="clients-toolbar notifications-toolbar">
        <SearchBar
          id="notification-search"
          value={query}
          onChange={setQuery}
          placeholder="Search by client, vendor, or message"
        />
        <Filter id="notification-status-filter" label="Status">
          <select
            id="notification-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All</option>
            {notificationStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Filter>
        <Filter id="notification-type-filter" label="Type">
          <select
            id="notification-type-filter"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">All types</option>
            {notificationTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Filter>
      </div>

      <section className="clients-panel">
        <NotificationList
          notifications={visibleNotifications}
          onView={(item) => navigate(`/admin/bookings/${item.bookingId}`)}
          onMarkRead={(item) => markNotificationRead(item.id)}
        />
      </section>
    </div>
  );
}

export default NotificationsPage;
