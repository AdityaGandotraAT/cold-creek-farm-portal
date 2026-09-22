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
  getVendorCategoryById,
  updateVendorCategory,
} from '../../data/vendorCategoriesStore.js';

function VendorCategoryFormPage({ mode }) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const isEdit = mode === 'edit';
  const category = isEdit ? getVendorCategoryById(categoryId) : null;

  function handleCancel() {
    navigate(isEdit && category ? `/admin/vendor-categories/${category.id}` : '/admin/vendor-categories');
  }

  function handleSubmit(payload) {
    if (isEdit && category) {
      const updated = updateVendorCategory(category.id, payload);
      navigate(`/admin/vendor-categories/${updated.id}`);
      return;
    }

    const created = addVendorCategory(payload);
    navigate(`/admin/vendor-categories/${created.id}`);
  }

  if (isEdit && !category) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/vendor-categories">
          ← Back to Categories
        </Link>
        <PageHeader title="Edit Category" description="This category could not be found." />
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
