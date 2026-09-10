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
              <th>Category</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Website</th>
              <th>Actions</th>
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
