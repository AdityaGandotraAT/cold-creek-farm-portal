import { Icon } from '../AdminIcons.jsx';

function breakableEmail(email) {
  const at = email.indexOf('@');
  if (at <= 0) return email;
  return (
    <>
      {email.slice(0, at + 1)}
      <wbr />
      {email.slice(at + 1)}
    </>
  );
}

function VendorRow({ vendor, onView, onEdit }) {
  return (
    <tr>
      <td className="vendors-table__category">{vendor.category}</td>
      <td className="vendors-table__name">
        <strong>{vendor.name}</strong>
      </td>
      <td className="vendors-table__phone">{vendor.phone || '—'}</td>
      <td className="vendors-table__email">{vendor.email ? breakableEmail(vendor.email) : '—'}</td>
      <td className="vendors-table__website">
        {vendor.website ? (
          <a href={vendor.website} target="_blank" rel="noreferrer" title={vendor.website}>
            {vendor.website.replace(/^https?:\/\//i, '')}
          </a>
        ) : (
          '—'
        )}
      </td>
      <td className="vendors-table__actions">
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
