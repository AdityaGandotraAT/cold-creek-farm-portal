import { Icon } from '../AdminIcons.jsx';
import StatusBadge from '../clients/StatusBadge.jsx';
import { vendorStatusTone } from './format.js';

function VendorCard({ vendor, onView, onEdit }) {
  return (
    <li className="clients-card">
      <div className="clients-card__top">
        <div>
          <strong>{vendor.name}</strong>
          <div className="clients-table__ref">{vendor.company}</div>
        </div>
        <StatusBadge tone={vendorStatusTone(vendor.status)}>{vendor.status}</StatusBadge>
      </div>
      <p>{vendor.category}</p>
      <p>{vendor.email || '—'}</p>
      <p>{vendor.phone || '—'}</p>
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
    </li>
  );
}

export default VendorCard;
