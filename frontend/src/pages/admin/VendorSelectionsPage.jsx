import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../components/admin/bookings/bookings.css';
import Filter from '../../components/admin/clients/Filter.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import SearchBar from '../../components/admin/clients/SearchBar.jsx';
import '../../components/admin/clients/clients.css';
import SelectionTable from '../../components/admin/vendor-selections/SelectionTable.jsx';
import '../../components/admin/vendor-selections/vendorSelections.css';
import '../../components/admin/vendor-categories/vendorCategories.css';
import { REQUIRED_VENDOR_CATEGORIES } from '../../data/bookingsMock.js';
import {
  getBookingsState,
  loadBookings,
  subscribeBookings,
} from '../../data/bookingsStore.js';
import { getVendorSelectionLock } from '../../data/vendorSelectionLock.js';

function matchesSearch(booking, query) {
  if (!query) {
    return true;
  }

  const haystack = [booking.name, booking.referenceNumber]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function VendorSelectionsPage() {
  const navigate = useNavigate();
  const { bookings, loading, error } = useSyncExternalStore(
    subscribeBookings,
    getBookingsState,
    getBookingsState,
  );
  const [query, setQuery] = useState('');
  const [progress, setProgress] = useState('');
  const [lockStatus, setLockStatus] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    loadBookings();
  }, []);

  const visibleBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        if (!matchesSearch(booking, normalizedQuery)) {
          return false;
        }

        const selectedCount = Number(booking.selectedCount) || 0;
        if (progress === 'complete' && selectedCount < REQUIRED_VENDOR_CATEGORIES) {
          return false;
        }
        if (progress === 'incomplete' && selectedCount >= REQUIRED_VENDOR_CATEGORIES) {
          return false;
        }
        if (progress === 'not-started' && selectedCount > 0) {
          return false;
        }

        if (lockStatus) {
          const lock = getVendorSelectionLock(booking.eventDate);
          if (lock.status !== lockStatus) {
            return false;
          }
        }

        return true;
      }),
    [bookings, normalizedQuery, progress, lockStatus],
  );

  return (
    <div className="clients-page">
      <PageHeader
        title="Vendor Selections"
        description="Monitor required vendor selections across Cold Creek Farm bookings. Clients make selections separately."
      />

      <p className="categories-note selections-note">
        Each booking needs Florist, Photographers, Catering, DJs, Rentals, and Wedding Officiants.
        Use View Booking to review category-level selections and lock status.
      </p>

      <div className="clients-toolbar selections-toolbar">
        <SearchBar
          id="selection-search"
          value={query}
          onChange={setQuery}
          placeholder="Search by client or reference"
        />
        <Filter id="selection-progress-filter" label="Progress">
          <select
            id="selection-progress-filter"
            value={progress}
            onChange={(event) => setProgress(event.target.value)}
          >
            <option value="">All</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
            <option value="not-started">Not started</option>
          </select>
        </Filter>
        <Filter id="selection-lock-filter" label="Lock">
          <select
            id="selection-lock-filter"
            value={lockStatus}
            onChange={(event) => setLockStatus(event.target.value)}
          >
            <option value="">All</option>
            <option value="Open">Open</option>
            <option value="Locked">Locked</option>
          </select>
        </Filter>
      </div>

      {error ? (
        <p className="client-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="clients-panel">
        {loading && bookings.length === 0 ? (
          <p className="selections-loading">Loading vendor selections...</p>
        ) : (
          <SelectionTable
            bookings={visibleBookings}
            onView={(booking) => navigate(`/admin/bookings/${booking.id}`)}
          />
        )}
      </section>
    </div>
  );
}

export default VendorSelectionsPage;
