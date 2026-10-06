import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { formatActivityTime } from '../../components/admin/dashboard/format.js';
import {
  getClientNotifications,
  getClientNotificationsError,
  getClientNotificationsLoading,
  getClientNotificationsUnreadCount,
  loadClientNotifications,
  markAllClientNotificationsRead,
  markClientNotificationRead,
  subscribeClientNotifications,
} from '../../data/clientNotificationsStore.js';

function destinationFor(item) {
  if (String(item.type || '').startsWith('Vendor')) {
    return { to: '/client/vendors', label: 'Vendor selections' };
  }

  if (item.bookingId) {
    return { to: '/client/booking', label: 'My booking' };
  }

  return null;
}

function ClientNotificationsPage() {
  const notifications = useSyncExternalStore(
    subscribeClientNotifications,
    getClientNotifications,
    getClientNotifications,
  );
  const loading = useSyncExternalStore(
    subscribeClientNotifications,
    getClientNotificationsLoading,
    getClientNotificationsLoading,
  );
  const loadError = useSyncExternalStore(
    subscribeClientNotifications,
    getClientNotificationsError,
    getClientNotificationsError,
  );
  const unreadCount = useSyncExternalStore(
    subscribeClientNotifications,
    getClientNotificationsUnreadCount,
    getClientNotificationsUnreadCount,
  );
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadClientNotifications();
  }, []);

  async function handleMarkRead(id) {
    setActionError('');
    try {
      await markClientNotificationRead(id);
    } catch (err) {
      setActionError(err.message || 'Unable to update this notification');
    }
  }

  async function handleMarkAll() {
    setActionError('');
    try {
      await markAllClientNotificationsRead();
    } catch (err) {
      setActionError(err.message || 'Unable to mark notifications as read');
    }
  }

  return (
    <div className="client-notes">
      <header className="client-booking__intro">
        <div>
          <p className="client-stub__kicker">Your updates</p>
          <h2>Notifications</h2>
          <p>Booking changes and vendor replies for your event show up here.</p>
        </div>
        {unreadCount > 0 ? (
          <button className="client-welcome__cta" type="button" onClick={handleMarkAll}>
            Mark all as read
          </button>
        ) : null}
      </header>

      {loadError || actionError ? (
        <p className="client-account__alert" role="alert">
          {actionError || loadError}
        </p>
      ) : null}

      {loading && notifications.length === 0 ? (
        <p className="client-account__muted">Loading notifications...</p>
      ) : null}

      {!loading && notifications.length === 0 ? (
        <section className="client-booking__panel">
          <h3>No updates yet</h3>
          <p className="client-account__muted">
            When Cold Creek Farm updates your booking, or a vendor accepts or declines, it will
            appear here.
          </p>
        </section>
      ) : null}

      <ul className="client-notes__list">
        {notifications.map((item) => {
          const unread = item.status === 'Unread';
          const destination = destinationFor(item);

          return (
            <li key={item.id} className={`client-note${unread ? ' is-unread' : ''}`}>
              <div className="client-note__meta">
                <span className="client-note__type">{item.type}</span>
                <time dateTime={item.occurredAt}>{formatActivityTime(item.occurredAt)}</time>
              </div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <div className="client-note__actions">
                {destination ? (
                  <Link className="client-note__link" to={destination.to}>
                    {destination.label}
                  </Link>
                ) : null}
                {unread ? (
                  <button type="button" onClick={() => handleMarkRead(item.id)}>
                    Mark as read
                  </button>
                ) : (
                  <span className="client-note__read">Read</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ClientNotificationsPage;
