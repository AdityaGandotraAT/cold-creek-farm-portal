import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddClientForm from '../../components/admin/clients/AddClientForm.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/clients.css';
import '../../components/admin/clients/addClient.css';

function AddClientPage() {
  const navigate = useNavigate();
  const [created, setCreated] = useState(null);

  function handleCancel() {
    navigate('/admin/clients');
  }

  function handleSubmit(payload) {
    setCreated(payload);
  }

  return (
    <div className="clients-page">
      <Link className="client-form__back" to="/admin/clients">
        ← Back to Clients
      </Link>

      <PageHeader
        title="Add New Client"
        description="Enter the client’s contact details. The account will be created later when the API is connected."
      />

      {created ? (
        <section className="client-form__success" role="status">
          <h3>Client form submitted</h3>
          <p>
            The form for {created.firstName} {created.lastName} was validated
            successfully. It is not saved to the database yet.
          </p>
          <div className="client-form__actions">
            <Link className="clients-add" to="/admin/clients">
              Back to Clients
            </Link>
            <button className="client-form__cancel" type="button" onClick={() => setCreated(null)}>
              Add another
            </button>
          </div>
        </section>
      ) : (
        <AddClientForm onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
    </div>
  );
}

export default AddClientPage;
