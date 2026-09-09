import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import '../../components/admin/vendor-categories/vendorCategories.css';
import { getVendorCategoryById } from '../../data/vendorCategoriesMock.js';

const copy = {
  add: {
    title: 'Add Category',
    description: 'Add an optional vendor category for future Cold Creek Farm events.',
    message:
      'Category creation will be implemented here. The six required CCF categories will not be changed.',
  },
  edit: {
    title: 'Edit Category',
    description: 'Update this vendor category.',
    message: 'Category editing will be implemented here.',
  },
};

function VendorCategoryFormPage({ mode }) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const category = mode === 'edit' ? getVendorCategoryById(categoryId) : null;
  const page = copy[mode];
  const title = category ? `${page.title}: ${category.name}` : page.title;

  if (mode === 'edit' && !category) {
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
      <PageHeader title={title} description={page.description} />
      <section className="client-form__section">
        <p>{page.message}</p>
        {category?.required ? (
          <p className="categories-note">
            This is a required Cold Creek Farm category. It cannot be removed or disabled.
          </p>
        ) : null}
        <div className="client-form__actions categories-form-actions">
          <button className="client-form__cancel" type="button" onClick={() => navigate('/admin/vendor-categories')}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

export default VendorCategoryFormPage;
