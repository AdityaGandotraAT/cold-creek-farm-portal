import { Icon } from '../AdminIcons.jsx';

function VendorRow({ vendor, onView, onEdit }) {
  return (
    <tr>
      <td>{vendor.category}</td>
      <td>
        <strong>{vendor.name}</strong>
      </td>
      <td>{vendor.phone || '—'}</td>
      <td>{vendor.email || '—'}</td>
      <td>
        {vendor.website ? (
          <a href={vendor.website} target="_blank" rel="noreferrer">
            {vendor.website.replace(/^https?:\/\//i, '')}
          </a>
        ) : (
          '—'
        )}
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
