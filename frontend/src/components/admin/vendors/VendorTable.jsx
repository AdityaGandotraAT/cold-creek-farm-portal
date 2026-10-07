import { Icon } from '../AdminIcons.jsx';
import VendorCard from './VendorCard.jsx';
import VendorRow from './VendorRow.jsx';

function VendorTable({ vendors, onView, onEdit }) {
  if (vendors.length === 0) {
    return (
      <div className="clients-empty vendors-empty">
        <Icon name="vendors" />
        <p>No vendors found.</p>
        <span>Try a different name, category, email, or phone.</span>
      </div>
    );
  }

  return (
    <>
      <div className="clients-table-wrap vendors-table-wrap">
        <table className="clients-table vendors-table">
          <thead>
            <tr>
              <th className="vendors-table__category">Category</th>
              <th className="vendors-table__name">Name</th>
              <th className="vendors-table__phone">Phone</th>
              <th className="vendors-table__email">Email</th>
              <th className="vendors-table__website">Website</th>
              <th className="vendors-table__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <VendorRow key={vendor.id} vendor={vendor} onView={onView} onEdit={onEdit} />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="clients-cards">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} onView={onView} onEdit={onEdit} />
        ))}
      </ul>
    </>
  );
}

export default VendorTable;
