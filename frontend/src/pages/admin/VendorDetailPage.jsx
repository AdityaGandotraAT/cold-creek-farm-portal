import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import VendorDetail from '../../components/admin/vendors/VendorDetail.jsx';
import '../../components/admin/vendors/vendors.css';
import { getVendorById } from '../../data/vendorsStore.js';

function VendorDetailPage() {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const vendor = getVendorById(vendorId);

  if (!vendor) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/vendors">
          ← Back to Vendors
        </Link>
        <PageHeader title="View Vendor" description="This vendor could not be found." />
        <section className="client-form__section">
          <p>This vendor could not be found.</p>
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
        description="Review this vendor in the Cold Creek Farm master list."
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
