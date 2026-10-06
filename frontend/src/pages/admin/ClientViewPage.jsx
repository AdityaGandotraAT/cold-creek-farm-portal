import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ClientDetail from '../../components/admin/clients/ClientDetail.jsx';
import ClientDeleteModal from '../../components/admin/clients/ClientDeleteModal.jsx';
import ClientSuccessModal from '../../components/admin/clients/ClientSuccessModal.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import '../../components/admin/vendors/vendors.css';
import {
  deleteClient,
  ensureClient,
  getClientById,
  resendWelcomeEmail,
} from '../../data/clientsStore.js';

function ClientViewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientId } = useParams();
  const [client, setClient] = useState(
    () => location.state?.client || getClientById(clientId),
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!client);
  const [successNotice, setSuccessNotice] = useState(() => {
    if (location.state?.clientNotice && location.state?.clientName) {
      return {
        kind: location.state.clientNotice,
        clientName: location.state.clientName,
        username: location.state.username,
        temporaryPassword: location.state.temporaryPassword,
        detail: location.state.emailDetail,
      };
    }
    return null;
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      if (!clientId) {
        setError('Invalid client');
        setLoading(false);
        return;
      }

      if (!client) {
        setLoading(true);
      }

      try {
        const record = await ensureClient(clientId);
        if (active) {
          setClient(record);
          setError('');
        }
      } catch (err) {
        if (active && !client) {
          setError(err.message || 'Unable to load client');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [clientId]);

  async function handleDeleteConfirm() {
    if (!client || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const removed = await deleteClient(client.id);
      navigate('/admin/clients', {
        state: {
          clientNotice: 'deleted',
          clientName: removed.name,
        },
      });
    } catch (err) {
      setDeleteError(err.message || 'Unable to delete client');
      setIsDeleting(false);
    }
  }

  async function handleResendWelcome() {
    if (!client || isResending) {
      return;
    }

    setIsResending(true);
    setResendError('');

    try {
      const result = await resendWelcomeEmail(client.id);
      setClient(result.client);
      setSuccessNotice({
        kind: result.emailSent ? 'welcomeResent' : 'createdEmailFailed',
        clientName: result.client.name,
        username: result.client.email,
        temporaryPassword: result.emailSent ? undefined : result.temporaryPassword,
        detail: result.emailSent ? undefined : result.message,
      });
    } catch (err) {
      setResendError(err.message || 'Unable to resend welcome email');
    } finally {
      setIsResending(false);
    }
  }

  if (loading && !client) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/clients">
          ← Back to Clients
        </Link>
        <PageHeader title="View Client" description="Loading client details..." />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="clients-page">
        <Link className="client-form__back" to="/admin/clients">
          ← Back to Clients
        </Link>
        <PageHeader title="View Client" description={error || 'This client could not be found.'} />
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
        title={`View Client: ${client.name}`}
        description="Review this client’s contact and account details."
        action={
          <div className="clients-header__actions">
            {client.userId ? (
              <button
                className="client-form__cancel"
                type="button"
                onClick={handleResendWelcome}
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Resend welcome email'}
              </button>
            ) : null}
            <Link className="clients-add" to={`/admin/clients/${client.id}/edit`}>
              Edit
            </Link>
            <button className="clients-delete" type="button" onClick={() => setDeleteOpen(true)}>
              Delete
            </button>
          </div>
        }
      />
      {deleteError ? (
        <p className="client-form__error" role="alert">
          {deleteError}
        </p>
      ) : null}
      {resendError ? (
        <p className="client-form__error" role="alert">
          {resendError}
        </p>
      ) : null}
      <ClientDetail client={client} />

      {successNotice ? (
        <ClientSuccessModal
          kind={successNotice.kind}
          clientName={successNotice.clientName}
          username={successNotice.username}
          temporaryPassword={successNotice.temporaryPassword}
          detail={successNotice.detail}
          onClose={() => setSuccessNotice(null)}
        />
      ) : null}
      {deleteOpen ? (
        <ClientDeleteModal
          clientName={client.name}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            if (!isDeleting) {
              setDeleteOpen(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}

export default ClientViewPage;
