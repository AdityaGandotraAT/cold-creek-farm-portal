import { Icon } from '../AdminIcons.jsx';
import { formatActivityTime } from './format.js';

const typeMeta = {
  client_created: { label: 'Client account created', icon: 'clients' },
  vendor_selected: { label: 'Vendor selected', icon: 'selections' },
  vendor_confirmed: { label: 'Vendor confirmed', icon: 'vendors' },
  vendor_unavailable: { label: 'Vendor marked unavailable', icon: 'alert' },
  booking_updated: { label: 'Booking updated', icon: 'bookings' },
};

function RecentActivity({ items }) {
  return (
    <section className="dashboard-panel" aria-labelledby="recent-activity-heading">
      <div className="dashboard-panel__header">
        <div>
          <h2 id="recent-activity-heading">Recent Activity</h2>
          <p>Latest changes across clients, bookings, and vendors.</p>
        </div>
      </div>

      <ol className="dashboard-activity">
        {items.map((item) => {
          const meta = typeMeta[item.type] || { label: 'Update', icon: 'clock' };

          return (
            <li key={item.id} className="dashboard-activity__item">
              <span className={`dashboard-activity__icon dashboard-activity__icon--${item.type}`} aria-hidden="true">
                <Icon name={meta.icon} />
              </span>
              <div>
                <p className="dashboard-activity__type">{meta.label}</p>
                <p>{item.text}</p>
                <time dateTime={item.occurredAt}>{formatActivityTime(item.occurredAt)}</time>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default RecentActivity;
