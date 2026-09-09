import { Link } from 'react-router-dom';
import { getSession } from '../../auth/session.js';
import AttentionList from '../../components/admin/dashboard/AttentionList.jsx';
import DashboardCard from '../../components/admin/dashboard/DashboardCard.jsx';
import RecentActivity from '../../components/admin/dashboard/RecentActivity.jsx';
import UpcomingEvents from '../../components/admin/dashboard/UpcomingEvents.jsx';
import VendorSelectionOverview from '../../components/admin/dashboard/VendorSelectionOverview.jsx';
import '../../components/admin/dashboard/dashboard.css';
import {
  attentionItems,
  dashboardSummary,
  recentActivity,
  upcomingEvents,
  vendorCategoryOverview,
} from '../../data/dashboardMock.js';
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

  return (
    <div className="dashboard">
      <header className="dashboard__intro">
        <div>
          <p className="dashboard__kicker">{today}</p>
          <h2>
            {greetingForHour(farmHour())}, {greetingName}.
          </h2>
          <p>A snapshot of Cold Creek Farm clients, bookings, and vendor follow-up.</p>
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
