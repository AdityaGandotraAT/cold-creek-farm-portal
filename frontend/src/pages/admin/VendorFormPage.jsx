import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import VendorForm from '../../components/admin/vendors/VendorForm.jsx';
import { emptyVendorForm, vendorToForm } from '../../components/admin/vendors/vendorForm.js';
import { addVendor, getVendorById, updateVendor } from '../../data/vendorsStore.js';

function VendorFormPage({ mode }) {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const vendor = mode === 'edit' ? getVendorById(vendorId) : null;
  const isEdit = mode === 'edit';

  function handleCancel() {
    navigate(isEdit && vendor ? `/admin/vendors/${vendor.id}` : '/admin/vendors');
  }

  function handleSubmit(payload) {
    if (isEdit && vendor) {
      updateVendor(vendor.id, payload);
      navigate(`/admin/vendors/${vendor.id}`);
      return;
    }

    const created = addVendor(payload);
    navigate(`/admin/vendors/${created.id}`);
  }

  if (isEdit && !vendor) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/vendors">
          ← Back to Vendors
        </Link>
        <PageHeader title="Edit Vendor" description="This vendor could not be found." />
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
        title={isEdit ? `Edit Vendor: ${vendor.name}` : 'Add Vendor'}
        description={
          isEdit
            ? 'Update this vendor in the Cold Creek Farm master list.'
            : 'Add a vendor to the Cold Creek Farm master list.'
        }
      />
      <VendorForm
        key={vendor?.id || 'new'}
        initialValues={isEdit ? vendorToForm(vendor) : emptyVendorForm}
        submitLabel="Save"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default VendorFormPage;
