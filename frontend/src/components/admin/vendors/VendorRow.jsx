import { Icon } from '../AdminIcons.jsx';
import StatusBadge from '../clients/StatusBadge.jsx';
import { vendorStatusTone } from './format.js';

function VendorRow({ vendor, onView, onEdit }) {
  return (
    <tr>
      <td>
        <strong>{vendor.name}</strong>
      </td>
      <td>{vendor.company}</td>
      <td>{vendor.category}</td>
      <td>{vendor.email || '—'}</td>
      <td>{vendor.phone || '—'}</td>
      <td>
        <StatusBadge tone={vendorStatusTone(vendor.status)}>{vendor.status}</StatusBadge>
      </td>
      <td>
        <div className="clients-table__actions">
          <button className="clients-action" type="button" onClick={() => onView(vendor)}>
            <Icon name="eye" />
            View
          </button>
          <button className="clients-action" type="button" onClick={() => onEdit(vendor)}>
            <Icon name="edit" />
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
}

export default VendorRow;
