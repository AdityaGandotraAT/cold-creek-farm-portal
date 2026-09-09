import { Icon } from '../AdminIcons.jsx';
import StatusBadge from '../clients/StatusBadge.jsx';
import { vendorStatusTone } from '../vendors/format.js';

function CategoryCard({ category, onView, onEdit, onViewVendors }) {
  return (
    <li className="clients-card">
      <div className="clients-card__top">
        <div className="categories-name">
          <strong>{category.name}</strong>
          {category.required ? <span className="categories-required">Required</span> : null}
        </div>
        <StatusBadge tone={vendorStatusTone(category.status)}>{category.status}</StatusBadge>
      </div>
      <p>
        <span className="categories-count">{category.vendorCount}</span> vendors
      </p>
      <div className="clients-table__actions">
        <button className="clients-action" type="button" onClick={() => onView(category)}>
          <Icon name="eye" />
          View
        </button>
        <button className="clients-action" type="button" onClick={() => onEdit(category)}>
          <Icon name="edit" />
          Edit
        </button>
        <button className="clients-action" type="button" onClick={() => onViewVendors(category)}>
          <Icon name="vendors" />
          View Vendors
        </button>
      </div>
    </li>
  );
}

export default CategoryCard;
