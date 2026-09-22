import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/admin/AdminIcons.jsx';
import BookingTable from '../../components/admin/bookings/BookingTable.jsx';
import '../../components/admin/bookings/bookings.css';
import ClientSuccessModal from '../../components/admin/clients/ClientSuccessModal.jsx';
import Filter from '../../components/admin/clients/Filter.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import SearchBar from '../../components/admin/clients/SearchBar.jsx';
import '../../components/admin/clients/clients.css';
import { bookingStatusOptions } from '../../data/bookingsMock.js';
import {
  getBookingsState,
  loadBookings,
  subscribeBookings,
} from '../../data/bookingsStore.js';

function matchesSearch(booking, query) {
  if (!query) {
    return true;
  }

  const haystack = [booking.eventName, booking.name, booking.referenceNumber, booking.venue]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function BookingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookings, loading, error } = useSyncExternalStore(
    subscribeBookings,
    getBookingsState,
    getBookingsState,
  );
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [successNotice, setSuccessNotice] = useState(null);
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const notice = location.state?.bookingNotice;
    const bookingName = location.state?.bookingName;

    if (!notice || !bookingName) {
      return;
    }

    setSuccessNotice({ kind: notice, clientName: bookingName });
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, navigate]);

  const visibleBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        if (!matchesSearch(booking, normalizedQuery)) {
          return false;
        }

        if (status && booking.bookingStatus !== status) {
          return false;
        }

        if (eventDate && booking.eventDate !== eventDate) {
          return false;
        }

        return true;
      }),
    [bookings, normalizedQuery, status, eventDate],
  );

  return (
    <div className="clients-page">
      <PageHeader
        title="Bookings"
        description="Manage and view all Cold Creek Farm event bookings."
        action={
          <button
            className="clients-add"
            type="button"
            onClick={() => navigate('/admin/bookings/new')}
          >
            <Icon name="plus" />
            Add New Booking
          </button>
        }
      />

      <div className="clients-toolbar">
        <SearchBar
          id="booking-search"
          value={query}
          onChange={setQuery}
          placeholder="Search by name, booking number, or venue"
        />
        <Filter id="booking-status-filter" label="Booking Status">
          <select
            id="booking-status-filter"
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
        <Filter id="booking-date-filter" label="Event Date">
          <input
            id="booking-date-filter"
            type="date"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
          />
        </Filter>
      </div>

      <section className="clients-panel">
        {loading ? (
          <div className="clients-empty">
            <p>Loading bookings...</p>
          </div>
        ) : null}
        {!loading && error ? (
          <div className="clients-empty" role="alert">
            <p>{error}</p>
          </div>
        ) : null}
        {!loading && !error ? (
          <BookingTable
            bookings={visibleBookings}
            onView={(booking) =>
              navigate(`/admin/bookings/${booking.id}`, { state: { booking } })
            }
            onEdit={(booking) => navigate(`/admin/bookings/${booking.id}/edit`)}
          />
        ) : null}
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

export default BookingsPage;
