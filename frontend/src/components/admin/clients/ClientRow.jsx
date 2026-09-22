import { Link } from 'react-router-dom';
import { Icon } from '../AdminIcons.jsx';
import StatusBadge from './StatusBadge.jsx';
import { bookingStatusTone, formatEventDate } from '../dashboard/format.js';

function ClientRow({ client }) {
  return (
    <tr>
      <td>
        <strong>{client.name}</strong>
        <div className="clients-table__ref">{client.referenceNumber}</div>
      </td>
      <td>{client.email}</td>
      <td>{client.phone}</td>
      <td>{client.eventDate ? formatEventDate(client.eventDate) : '—'}</td>
      <td>{client.venue || '—'}</td>
      <td>
        {client.bookingStatus ? (
          <StatusBadge tone={bookingStatusTone(client.bookingStatus)}>
            {client.bookingStatus}
          </StatusBadge>
        ) : (
          '—'
        )}
      </td>
      <td>
        <div className="clients-table__actions">
          <Link
            className="clients-action"
            to={`/admin/clients/${client.id}`}
            state={{ client }}
          >
            <Icon name="eye" />
            View
          </Link>
          <Link className="clients-action" to={`/admin/clients/${client.id}/edit`}>
            <Icon name="edit" />
            Edit
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default ClientRow;
