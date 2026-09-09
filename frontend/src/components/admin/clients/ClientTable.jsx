import { Icon } from '../AdminIcons.jsx';
import ClientRow from './ClientRow.jsx';
import StatusBadge from './StatusBadge.jsx';
import { bookingStatusTone, formatEventDate } from '../dashboard/format.js';

function ClientTable({ clients, onView, onEdit }) {
  if (clients.length === 0) {
    return (
      <div className="clients-empty">
        <p>No clients found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="clients-table-wrap">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Event Date</th>
              <th>Venue</th>
              <th>Booking Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                onView={onView}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="clients-cards">
        {clients.map((client) => (
          <li key={client.id} className="clients-card">
            <div className="clients-card__top">
              <div>
                <strong>{client.name}</strong>
                <div className="clients-table__ref">{client.referenceNumber}</div>
              </div>
              <StatusBadge tone={bookingStatusTone(client.bookingStatus)}>
                {client.bookingStatus}
              </StatusBadge>
            </div>
            <p>{client.email}</p>
            <p>{client.phone}</p>
            <p>
              {formatEventDate(client.eventDate)} · {client.venue}
            </p>
            <div className="clients-table__actions">
              <button className="clients-action" type="button" onClick={() => onView(client)}>
                <Icon name="eye" />
                View
              </button>
              <button className="clients-action" type="button" onClick={() => onEdit(client)}>
                <Icon name="edit" />
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default ClientTable;
