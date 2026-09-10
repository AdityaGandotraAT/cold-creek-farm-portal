import { Icon } from '../AdminIcons.jsx';

function VendorCard({ vendor, onView, onEdit }) {
  return (
    <li className="clients-card">
      <div className="clients-card__top">
        <div>
          <strong>{vendor.name}</strong>
          <div className="clients-table__ref">{vendor.category}</div>
        </div>
      </div>
      <p>{vendor.phone || '—'}</p>
      <p>{vendor.email || '—'}</p>
      <p>{vendor.website ? vendor.website.replace(/^https?:\/\//i, '') : '—'}</p>
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
