import { Icon } from '../AdminIcons.jsx';
import StatusBadge from '../clients/StatusBadge.jsx';
import { vendorStatusTone } from '../vendors/format.js';
import CategoryCard from './CategoryCard.jsx';

function CategoryTable({ categories, onView, onEdit, onViewVendors }) {
  if (categories.length === 0) {
    return (
      <div className="clients-empty categories-empty">
        <Icon name="categories" />
        <p>No vendor categories found.</p>
        <span>Try a different category name or status filter.</span>
      </div>
    );
  }

  return (
    <>
      <div className="clients-table-wrap">
        <table className="clients-table categories-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Status</th>
              <th>Number of Vendors</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className="categories-name">
                    <strong>{category.name}</strong>
                    {category.required ? <span className="categories-required">Required</span> : null}
                  </div>
                </td>
                <td>
                  <StatusBadge tone={vendorStatusTone(category.status)}>{category.status}</StatusBadge>
                </td>
                <td>
                  <span className="categories-count">{category.vendorCount}</span>
                </td>
                <td>
                  <div className="clients-table__actions">
                    <button className="clients-action" type="button" onClick={() => onView(category)}>
                      <Icon name="eye" />
                      View
                    </button>
                    <button className="clients-action" type="button" onClick={() => onEdit(category)}>
                      <Icon name="edit" />
                      Edit
                    </button>
                    <button
                      className="clients-action"
                      type="button"
                      onClick={() => onViewVendors(category)}
                    >
                      <Icon name="vendors" />
                      View Vendors
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="clients-cards">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onView={onView}
            onEdit={onEdit}
            onViewVendors={onViewVendors}
          />
        ))}
      </ul>
    </>
  );
}

export default CategoryTable;
