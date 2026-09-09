import { Icon } from '../AdminIcons.jsx';
import StatusBadge from './StatusBadge.jsx';
import { bookingStatusTone, formatEventDate } from '../dashboard/format.js';

function ClientRow({ client, onView, onEdit }) {
  return (
    <tr>
      <td>
        <strong>{client.name}</strong>
        <div className="clients-table__ref">{client.referenceNumber}</div>
      </td>
      <td>{client.email}</td>
      <td>{client.phone}</td>
      <td>{formatEventDate(client.eventDate)}</td>
      <td>{client.venue}</td>
      <td>
        <StatusBadge tone={bookingStatusTone(client.bookingStatus)}>
          {client.bookingStatus}
        </StatusBadge>
      </td>
      <td>
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
      </td>
    </tr>
  );
}

export default ClientRow;
