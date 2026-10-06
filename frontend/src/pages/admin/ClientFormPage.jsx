import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ClientForm from '../../components/admin/clients/ClientForm.jsx';
import { clientToForm, emptyClientForm } from '../../components/admin/clients/clientForm.js';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import {
  addClient,
  ensureClient,
  getClientById,
  getClientsState,
  subscribeClients,
  updateClient,
} from '../../data/clientsStore.js';

function ClientFormPage({ mode }) {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const isEdit = mode === 'edit'; 
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useSyncExternalStore(subscribeClients, getClientsState, getClientsState);

  const client = isEdit ? getClientById(clientId) : null;

  useEffect(() => {
    if (!isEdit || client) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError('');

    ensureClient(clientId)
      .catch((err) => {
        if (active) {
          setError(err.message || 'Unable to load client');
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
  }, [clientId, client, isEdit]);

  function handleCancel() {
    navigate(isEdit && client ? `/admin/clients/${client.id}` : '/admin/clients');
  }

  async function handleSubmit(payload) {
    if (isEdit && client) {
      const updated = await updateClient(client.id, payload);
      navigate(`/admin/clients/${updated.id}`, {
        state: {
          clientNotice: 'updated',
          clientName: updated.name,
        },
      });
      return;
    }

    const result = await addClient(payload);
    navigate(`/admin/clients/${result.client.id}`, {
      state: {
        clientNotice: result.emailSent ? 'created' : 'createdEmailFailed',
        clientName: result.client.name,
        username: result.client.email,
        temporaryPassword: result.emailSent ? undefined : result.temporaryPassword,
        emailDetail: result.emailSent ? undefined : result.message,
      },
    });
  }

  if (isEdit && loading) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/clients">
          ← Back to Clients
        </Link>
        <PageHeader title="Edit Client" description="Loading client details..." />
      </div>
    );
  }

  if (isEdit && !client) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/clients">
          ← Back to Clients
        </Link>
        <PageHeader title="Edit Client" description={error || 'This client could not be found.'} />
        <section className="client-form__section">
          <p>{error || 'This client could not be found.'}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="clients-page">
      <Link className="client-form__back" to="/admin/clients">
        ← Back to Clients
      </Link>
      <PageHeader
        title={isEdit ? `Edit Client: ${client.name}` : 'Add New Client'}
        description={
          isEdit
            ? 'Update this client’s contact and account details.'
            : 'Create a new Cold Creek Farm client account.'
        }
      />
      <ClientForm
        key={client?.id || 'new'}
        initialValues={isEdit ? clientToForm(client) : emptyClientForm}
        submitLabel={isEdit ? 'Save Changes' : 'Create Client'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default ClientFormPage;
