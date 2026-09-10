import { useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../../components/admin/AdminIcons.jsx';
import Filter from '../../components/admin/clients/Filter.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import SearchBar from '../../components/admin/clients/SearchBar.jsx';
import '../../components/admin/clients/clients.css';
import VendorTable from '../../components/admin/vendors/VendorTable.jsx';
import '../../components/admin/vendors/vendors.css';
import { vendorCategories } from '../../data/vendorsMock.js';
import { getVendors, subscribeVendors } from '../../data/vendorsStore.js';

function matchesSearch(vendor, query) {
  if (!query) {
    return true;
  }

  const haystack = [vendor.name, vendor.category, vendor.email, vendor.phone, vendor.website]
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

        return true;
      }),
    [vendors, normalizedQuery, category],
  );

  return (
    <div className="clients-page">
      <PageHeader
        title="Vendors"
        description="The Cold Creek Farm preferred vendor list: category, name, phone, email, and website."
        action={
          <button className="clients-add" type="button" onClick={() => navigate('/admin/vendors/new')}>
            <Icon name="plus" />
            Add Vendor
          </button>
        }
      />

      <div className="clients-toolbar vendors-toolbar">
        <SearchBar
          id="vendor-search"
          value={query}
          onChange={setQuery}
          placeholder="Search by name, category, email, or phone"
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
