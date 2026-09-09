import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useSyncExternalStore } from 'react';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import StatusBadge from '../../components/admin/clients/StatusBadge.jsx';
import '../../components/admin/vendor-categories/vendorCategories.css';
import { vendorStatusTone } from '../../components/admin/vendors/format.js';
import '../../components/admin/vendors/vendors.css';
import { getVendorCategoryById, withVendorCounts } from '../../data/vendorCategoriesMock.js';
import { getVendors, subscribeVendors } from '../../data/vendorsStore.js';

function DetailItem({ label, value }) {
  return (
    <div className="vendor-detail__item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function VendorCategoryDetailPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const vendors = useSyncExternalStore(subscribeVendors, getVendors, getVendors);
  const category = useMemo(() => {
    const record = getVendorCategoryById(categoryId);
    return record ? withVendorCounts([record], vendors)[0] : null;
  }, [categoryId, vendors]);

  if (!category) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/vendor-categories">
          ← Back to Categories
        </Link>
        <PageHeader title="View Category" description="This category could not be found." />
        <section className="client-form__section">
          <p>This category could not be found.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="clients-page">
      <Link className="client-form__back" to="/admin/vendor-categories">
        ← Back to Categories
      </Link>
      <PageHeader
        title={`View Category: ${category.name}`}
        description="Review this vendor category. Admin can monitor vendors here; required categories cannot be removed."
        action={
          <button
            className="clients-add"
            type="button"
            onClick={() => navigate(`/admin/vendors?category=${encodeURIComponent(category.name)}`)}
          >
            View Vendors
          </button>
        }
      />
      <section className="client-form__section vendor-detail">
        <div className="vendor-detail__heading">
          <h3>{category.name}</h3>
          <StatusBadge tone={vendorStatusTone(category.status)}>{category.status}</StatusBadge>
        </div>
        {category.required ? (
          <p className="categories-note">
            This is a required Cold Creek Farm category. It cannot be removed or disabled.
          </p>
        ) : (
          <p className="categories-note">
            This is an additional preferred-vendor category. It is not one of the six required
            event selection categories.
          </p>
        )}
        <dl className="vendor-detail__grid">
          <DetailItem label="Category Name" value={category.name} />
          <DetailItem label="Status" value={category.status} />
          <DetailItem label="Type" value={category.required ? 'Required' : 'Additional'} />
          <DetailItem label="Number of Vendors" value={String(category.vendorCount)} />
        </dl>
      </section>
    </div>
  );
}

export default VendorCategoryDetailPage;
