import { useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/admin/AdminIcons.jsx';
import Filter from '../../components/admin/clients/Filter.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import SearchBar from '../../components/admin/clients/SearchBar.jsx';
import '../../components/admin/clients/clients.css';
import CategoryTable from '../../components/admin/vendor-categories/CategoryTable.jsx';
import '../../components/admin/vendor-categories/vendorCategories.css';
import { vendorStatusOptions } from '../../data/vendorsMock.js';
import {
  vendorCategoryRecords,
  withVendorCounts,
} from '../../data/vendorCategoriesMock.js';
import { getVendors, subscribeVendors } from '../../data/vendorsStore.js';

function VendorCategoriesPage() {
  const navigate = useNavigate();
  const vendors = useSyncExternalStore(subscribeVendors, getVendors, getVendors);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const categories = useMemo(
    () => withVendorCounts(vendorCategoryRecords, vendors),
    [vendors],
  );

  const visibleCategories = useMemo(
    () =>
      categories.filter((category) => {
        if (normalizedQuery && !category.name.toLowerCase().includes(normalizedQuery)) {
          return false;
        }

        if (status && category.status !== status) {
          return false;
        }

        return true;
      }),
    [categories, normalizedQuery, status],
  );

  return (
    <div className="clients-page">
      <PageHeader
        title="Vendor Categories"
        description="Manage the vendor service categories available for Cold Creek Farm events."
        action={
          <button
            className="clients-add"
            type="button"
            onClick={() => navigate('/admin/vendor-categories/new')}
          >
            <Icon name="plus" />
            Add Category
          </button>
        }
      />

      <p className="categories-note">
        Florist, Photographers, Catering, DJs, Rentals, and Wedding Officiants are required for every
        Cold Creek Farm event and cannot be removed or disabled. Additional categories from the
        preferred vendor list are shown for Admin management only.
      </p>

      <div className="clients-toolbar categories-toolbar">
        <SearchBar
          id="category-search"
          value={query}
          onChange={setQuery}
          placeholder="Search by category name"
        />
        <Filter id="category-status-filter" label="Status">
          <select
            id="category-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All</option>
            {vendorStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Filter>
      </div>

      <section className="clients-panel">
        <CategoryTable
          categories={visibleCategories}
          onView={(category) => navigate(`/admin/vendor-categories/${category.id}`)}
          onEdit={(category) => navigate(`/admin/vendor-categories/${category.id}/edit`)}
          onViewVendors={(category) =>
            navigate(`/admin/vendors?category=${encodeURIComponent(category.name)}`)
          }
        />
      </section>
    </div>
  );
}

export default VendorCategoriesPage;
