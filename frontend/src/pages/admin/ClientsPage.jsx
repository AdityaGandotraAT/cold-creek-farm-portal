import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/admin/AdminIcons.jsx';
import ClientSuccessModal from '../../components/admin/clients/ClientSuccessModal.jsx';
import ClientTable from '../../components/admin/clients/ClientTable.jsx';
import Filter from '../../components/admin/clients/Filter.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import SearchBar from '../../components/admin/clients/SearchBar.jsx';
import '../../components/admin/clients/clients.css';
import { bookingStatusOptions } from '../../data/clientsMock.js';
import {
  getClientsState,
  loadClients,
  subscribeClients,
} from '../../data/clientsStore.js';

function matchesSearch(client, query) {
  if (!query) {
    return true;
  }

  const haystack = [client.name, client.email, client.referenceNumber]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function ClientsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clients, loading, error } = useSyncExternalStore(
    subscribeClients,
    getClientsState,
    getClientsState,
  );
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [successNotice, setSuccessNotice] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    const notice = location.state?.clientNotice;
    const clientName = location.state?.clientName;

    if (!notice || !clientName) {
      return;
    }

    setSuccessNotice({ kind: notice, clientName });
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, navigate]);

  const normalizedQuery = query.trim().toLowerCase();

  const visibleClients = useMemo(
    () =>
      clients.filter((client) => {
        if (!matchesSearch(client, normalizedQuery)) {
          return false;
        }

        if (status && client.bookingStatus !== status) {
          return false;
        }

        if (eventDate && client.eventDate !== eventDate) {
          return false;
        }

        return true;
      }),
    [clients, normalizedQuery, status, eventDate],
  );

  return (
    <div className="clients-page">
      <PageHeader
        title="Clients"
        description="Manage client accounts and their event information."
        action={
          <button
            className="clients-add"
            type="button"
            onClick={() => navigate('/admin/clients/new')}
          >
            <Icon name="plus" />
            Add New Client
          </button>
        }
      />

      <div className="clients-toolbar">
        <SearchBar value={query} onChange={setQuery} />
        <Filter id="client-status-filter" label="Booking Status">
          <select
            id="client-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All</option>
            {bookingStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Filter>
        <Filter id="client-date-filter" label="Event Date">
          <input
            id="client-date-filter"
            type="date"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
          />
        </Filter>
      </div>

      <section className="clients-panel">
        {loading ? <div className="clients-empty"><p>Loading clients...</p></div> : null}
        {!loading && error ? (
          <div className="clients-empty" role="alert">
            <p>{error}</p>
          </div>
        ) : null}
        {!loading && !error ? <ClientTable clients={visibleClients} /> : null}
      </section>

      {successNotice ? (
        <ClientSuccessModal
          kind={successNotice.kind}
          clientName={successNotice.clientName}
          showBackLink={false}
          onClose={() => setSuccessNotice(null)}
        />
      ) : null}
    </div>
  );
}

export default ClientsPage;
