import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import VendorDetail from '../../components/admin/vendors/VendorDetail.jsx';
import '../../components/admin/vendors/vendors.css';
import { ensureVendor, getVendorById } from '../../data/vendorsStore.js';

function VendorDetailPage() {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(() => getVendorById(vendorId));
  const [loading, setLoading] = useState(!vendor);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    ensureVendor(vendorId)
      .then((record) => {
        if (active) {
          setVendor(record);
          setError('');
        }
      })
      .catch((err) => {
        if (active && !vendor) {
          setError(err.message || 'Unable to load vendor');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [vendorId]);

  if (loading && !vendor) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/vendors">
          ← Back to Vendors
        </Link>
        <PageHeader title="View Vendor" description="Loading vendor details..." />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/vendors">
          ← Back to Vendors
        </Link>
        <PageHeader title="View Vendor" description={error || 'This vendor could not be found.'} />
        <section className="client-form__section">
          <p>{error || 'This vendor could not be found.'}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="clients-page">
      <Link className="client-form__back" to="/admin/vendors">
        ← Back to Vendors
      </Link>
      <PageHeader
        title={`View Vendor: ${vendor.name}`}
        description="The same details Cold Creek Farm shares on the vendor list."
        action={
          <button
            className="clients-add"
            type="button"
            onClick={() => navigate(`/admin/vendors/${vendor.id}/edit`)}
          >
            Edit
          </button>
        }
      />
      <VendorDetail vendor={vendor} />
    </div>
  );
}

export default VendorDetailPage;
