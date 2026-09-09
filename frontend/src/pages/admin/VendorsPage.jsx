import { useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../../components/admin/AdminIcons.jsx';
import Filter from '../../components/admin/clients/Filter.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import SearchBar from '../../components/admin/clients/SearchBar.jsx';
import '../../components/admin/clients/clients.css';
import VendorTable from '../../components/admin/vendors/VendorTable.jsx';
import '../../components/admin/vendors/vendors.css';
import { vendorCategories, vendorStatusOptions } from '../../data/vendorsMock.js';
import { getVendors, subscribeVendors } from '../../data/vendorsStore.js';

function matchesSearch(vendor, query) {
  if (!query) {
    return true;
  }

  const haystack = [vendor.name, vendor.company, vendor.category, vendor.email, vendor.phone]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function VendorsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vendors = useSyncExternalStore(subscribeVendors, getVendors, getVendors);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const visibleVendors = useMemo(
    () =>
      vendors.filter((vendor) => {
        if (!matchesSearch(vendor, normalizedQuery)) {
          return false;
        }

        if (category && vendor.category !== category) {
          return false;
        }

        if (status && vendor.status !== status) {
          return false;
        }

        return true;
      }),
    [vendors, normalizedQuery, category, status],
  );

  return (
    <div className="clients-page">
      <PageHeader
        title="Vendors"
        description="Manage vendors and their service categories for Cold Creek Farm events."
        action={
          <button className="clients-add" type="button" onClick={() => navigate('/admin/vendors/new')}>
            <Icon name="plus" />
            Add Vendor
          </button>
        }
      />

      <div className="clients-toolbar">
        <SearchBar
          id="vendor-search"
          value={query}
          onChange={setQuery}
          placeholder="Search vendors by name, company, email, or phone"
        />
        <Filter id="vendor-category-filter" label="Category">
          <select
            id="vendor-category-filter"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All Categories</option>
            {vendorCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Filter>
        <Filter id="vendor-status-filter" label="Status">
          <select
            id="vendor-status-filter"
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
        <VendorTable
          vendors={visibleVendors}
          onView={(vendor) => navigate(`/admin/vendors/${vendor.id}`)}
          onEdit={(vendor) => navigate(`/admin/vendors/${vendor.id}/edit`)}
        />
      </section>
    </div>
  );
}

export default VendorsPage;
