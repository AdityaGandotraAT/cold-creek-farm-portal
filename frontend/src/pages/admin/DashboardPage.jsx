import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../../auth/session.js';
import AttentionList from '../../components/admin/dashboard/AttentionList.jsx';
import DashboardCard from '../../components/admin/dashboard/DashboardCard.jsx';
import RecentActivity from '../../components/admin/dashboard/RecentActivity.jsx';
import UpcomingEvents from '../../components/admin/dashboard/UpcomingEvents.jsx';
import VendorSelectionOverview from '../../components/admin/dashboard/VendorSelectionOverview.jsx';
import '../../components/admin/dashboard/dashboard.css';
import { getBookingsState, loadBookings, subscribeBookings } from '../../data/bookingsStore.js';
import { getClientsState, loadClients, subscribeClients } from '../../data/clientsStore.js';
import { dashboardFromRecords } from '../../data/dashboardFromRecords.js';
import { farmHour, formatFarmToday } from '../../data/farmTime.js';

function greetingForHour(hour) {
  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

function DashboardPage() {
  const session = getSession();
  const firstName = session?.user?.firstName;
  const greetingName = !firstName || firstName === 'Portal' ? 'Admin' : firstName;
  const today = formatFarmToday();
  const { bookings, loading: bookingsLoading, error: bookingsError } = useSyncExternalStore(
    subscribeBookings,
    getBookingsState,
    getBookingsState,
  );
  const { clients, loading: clientsLoading, error: clientsError } = useSyncExternalStore(
    subscribeClients,
    getClientsState,
    getClientsState,
  );

  useEffect(() => {
    loadBookings();
    loadClients();
  }, []);

  const {
    dashboardSummary,
    upcomingEvents,
    vendorCategoryOverview,
    attentionItems,
    recentActivity,
  } = useMemo(() => dashboardFromRecords({ bookings, clients }), [bookings, clients]);

  const loading = bookingsLoading || clientsLoading;
  const error = bookingsError || clientsError;

  return (
    <div className="dashboard">
      <header className="dashboard__intro">
        <div>
          <p className="dashboard__kicker">Cold Creek Farm · Admin · {today}</p>
          <h2>
            {greetingForHour(farmHour())}, {greetingName}.
          </h2>
          <p>A snapshot of clients, bookings, and vendor follow-up.</p>
        </div>
        <div className="dashboard__shortcuts">
          <Link className="dashboard__shortcut" to="/admin/clients">
            Clients
          </Link>
          <Link className="dashboard__shortcut" to="/admin/bookings">
            Bookings
          </Link>
          <Link className="dashboard__shortcut dashboard__shortcut--primary" to="/admin/vendors">
            Vendors
          </Link>
        </div>
      </header>

      {error ? (
        <p className="dashboard-empty" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? <p className="dashboard-empty">Loading current records…</p> : null}

      <section className="dashboard__cards" aria-label="Summary">
        {dashboardSummary.map((card) => (
          <DashboardCard
            key={card.id}
            label={card.label}
            value={card.value}
            icon={card.icon}
            hint={card.hint}
            to={card.to}
            tone={card.tone}
          />
        ))}
      </section>

      <UpcomingEvents events={upcomingEvents} />

      <div className="dashboard__split">
        <VendorSelectionOverview categories={vendorCategoryOverview} />
        <AttentionList items={attentionItems} />
      </div>

      <RecentActivity items={recentActivity} />
    </div>
  );
}

export default DashboardPage;
