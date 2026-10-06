import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import VendorForm from '../../components/admin/vendors/VendorForm.jsx';
import { emptyVendorForm, vendorToForm } from '../../components/admin/vendors/vendorForm.js';
import { addVendor, ensureVendor, getVendorById, updateVendor } from '../../data/vendorsStore.js';

function VendorFormPage({ mode }) {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(() => (mode === 'edit' ? getVendorById(vendorId) : null));
  const [loading, setLoading] = useState(mode === 'edit' && !vendor);
  const [error, setError] = useState('');
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isEdit) {
      return undefined;
    }

    let active = true;
    ensureVendor(vendorId)
      .then((record) => {
        if (active) {
          setVendor(record);
          setError('');
        }
      })
      .catch((err) => {
        if (active) {
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
  }, [isEdit, vendorId]);

  function handleCancel() {
    navigate(isEdit && vendor ? `/admin/vendors/${vendor.id}` : '/admin/vendors');
  }

  async function handleSubmit(payload) {
    if (isEdit && vendor) {
      const updated = await updateVendor(vendor.id, payload);
      navigate(`/admin/vendors/${updated.id}`);
      return;
    }

    const created = await addVendor(payload);
    navigate(`/admin/vendors/${created.id}`);
  }

  if (isEdit && loading) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/vendors">
          ← Back to Vendors
        </Link>
        <PageHeader title="Edit Vendor" description="Loading vendor details..." />
      </div>
    );
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
            ? 'Update this vendor using the same details as the Cold Creek Farm vendor list.'
            : 'Add a vendor using the same details as the Cold Creek Farm vendor list.'
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
