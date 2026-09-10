import { useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/admin/AdminIcons.jsx';
import BookingTable from '../../components/admin/bookings/BookingTable.jsx';
import '../../components/admin/bookings/bookings.css';
import Filter from '../../components/admin/clients/Filter.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import SearchBar from '../../components/admin/clients/SearchBar.jsx';
import '../../components/admin/clients/clients.css';
import { bookingStatusOptions } from '../../data/bookingsMock.js';
import { getBookings, subscribeBookings } from '../../data/bookingsStore.js';

function matchesSearch(booking, query) {
  if (!query) {
    return true;
  }

  const haystack = [booking.name, booking.referenceNumber, booking.venue]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function BookingsPage() {
  const navigate = useNavigate();
  const bookings = useSyncExternalStore(subscribeBookings, getBookings, getBookings);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [eventDate, setEventDate] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

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
        <BookingTable
          bookings={visibleBookings}
          onView={(booking) => navigate(`/admin/bookings/${booking.id}`)}
          onEdit={(booking) => navigate(`/admin/bookings/${booking.id}/edit`)}
        />
      </section>
    </div>
  );
}

export default BookingsPage;
