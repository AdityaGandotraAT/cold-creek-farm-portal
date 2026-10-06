import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import CategoryForm from '../../components/admin/vendor-categories/CategoryForm.jsx';
import {
  categoryToForm,
  emptyCategoryForm,
} from '../../components/admin/vendor-categories/categoryForm.js';
import '../../components/admin/vendor-categories/vendorCategories.css';
import {
  addVendorCategory,
  ensureVendorCategory,
  getVendorCategoryById,
  updateVendorCategory,
} from '../../data/vendorCategoriesStore.js';

function VendorCategoryFormPage({ mode }) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const isEdit = mode === 'edit';
  const [category, setCategory] = useState(() =>
    isEdit ? getVendorCategoryById(categoryId) : null,
  );
  const [loading, setLoading] = useState(isEdit && !category);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) {
      return undefined;
    }

    let active = true;
    ensureVendorCategory(categoryId)
      .then((record) => {
        if (active) {
          setCategory(record);
          setError('');
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Unable to load category');
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
  }, [isEdit, categoryId]);

  function handleCancel() {
    navigate(isEdit && category ? `/admin/vendor-categories/${category.id}` : '/admin/vendor-categories');
  }

  async function handleSubmit(payload) {
    if (isEdit && category) {
      const updated = await updateVendorCategory(category.id, payload);
      navigate(`/admin/vendor-categories/${updated.id}`);
      return;
    }

    const created = await addVendorCategory(payload);
    navigate(`/admin/vendor-categories/${created.id}`);
  }

  if (isEdit && loading) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/vendor-categories">
          ← Back to Categories
        </Link>
        <PageHeader title="Edit Category" description="Loading category details..." />
      </div>
    );
  }

  if (isEdit && !category) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/vendor-categories">
          ← Back to Categories
        </Link>
        <PageHeader title="Edit Category" description="This category could not be found." />
        <section className="client-form__section">
          <p>{error || 'This category could not be found.'}</p>
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
        title={isEdit ? `Edit Category: ${category.name}` : 'Add Category'}
        description={
          isEdit
            ? 'Update this vendor category.'
            : 'Add an optional vendor category for the preferred vendor list.'
        }
      />
      <CategoryForm
        key={category?.id || 'new'}
        initialValues={isEdit ? categoryToForm(category) : emptyCategoryForm}
        required={Boolean(category?.required)}
        submitLabel="Save"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default VendorCategoryFormPage;
