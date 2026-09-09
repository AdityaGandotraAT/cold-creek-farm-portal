import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/admin/AdminIcons.jsx';
import ClientTable from '../../components/admin/clients/ClientTable.jsx';
import Filter from '../../components/admin/clients/Filter.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import PlaceholderModal from '../../components/admin/clients/PlaceholderModal.jsx';
import SearchBar from '../../components/admin/clients/SearchBar.jsx';
import '../../components/admin/clients/clients.css';
import { bookingStatusOptions, clients as mockClients } from '../../data/clientsMock.js';

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
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [modal, setModal] = useState(null);

  const normalizedQuery = query.trim().toLowerCase();

  const visibleClients = useMemo(
    () =>
      mockClients.filter((client) => {
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
    [normalizedQuery, status, eventDate],
  );

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modal]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setModal(null);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
        <ClientTable
          clients={visibleClients}
          onView={(client) =>
            setModal({
              title: `View ${client.name}`,
              message: 'Client details will be implemented here.',
            })
          }
          onEdit={(client) =>
            setModal({
              title: `Edit ${client.name}`,
              message: 'Client editing will be implemented here.',
            })
          }
        />
      </section>

      {modal ? (
        <PlaceholderModal
          title={modal.title}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}

export default ClientsPage;
