import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout.jsx';
import RequireAdmin from './components/admin/RequireAdmin.jsx';
import LoginPage from './pages/LoginPage.jsx';
import BookingsPage from './pages/admin/BookingsPage.jsx';
import BookingFormPage from './pages/admin/BookingFormPage.jsx';
import BookingViewPage from './pages/admin/BookingViewPage.jsx';
import ClientsPage from './pages/admin/ClientsPage.jsx';
import AddClientPage from './pages/admin/AddClientPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import NotificationsPage from './pages/admin/NotificationsPage.jsx';
import SettingsPage from './pages/admin/SettingsPage.jsx';
import VendorCategoriesPage from './pages/admin/VendorCategoriesPage.jsx';
import VendorCategoryDetailPage from './pages/admin/VendorCategoryDetailPage.jsx';
import VendorCategoryFormPage from './pages/admin/VendorCategoryFormPage.jsx';
import VendorSelectionsPage from './pages/admin/VendorSelectionsPage.jsx';
import VendorsPage from './pages/admin/VendorsPage.jsx';
import VendorFormPage from './pages/admin/VendorFormPage.jsx';
import VendorDetailPage from './pages/admin/VendorDetailPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/clients" element={<ClientsPage />} />
          <Route path="/admin/clients/new" element={<AddClientPage />} />
          <Route path="/admin/bookings" element={<BookingsPage />} />
          <Route path="/admin/bookings/new" element={<BookingFormPage mode="add" />} />
          <Route path="/admin/bookings/:bookingId/edit" element={<BookingFormPage mode="edit" />} />
          <Route path="/admin/bookings/:bookingId" element={<BookingViewPage />} />
          <Route path="/admin/vendors" element={<VendorsPage />} />
          <Route path="/admin/vendors/new" element={<VendorFormPage mode="add" />} />
          <Route path="/admin/vendors/:vendorId/edit" element={<VendorFormPage mode="edit" />} />
          <Route path="/admin/vendors/:vendorId" element={<VendorDetailPage />} />
          <Route path="/admin/vendor-categories" element={<VendorCategoriesPage />} />
          <Route
            path="/admin/vendor-categories/new"
            element={<VendorCategoryFormPage mode="add" />}
          />
          <Route
            path="/admin/vendor-categories/:categoryId/edit"
            element={<VendorCategoryFormPage mode="edit" />}
          />
          <Route
            path="/admin/vendor-categories/:categoryId"
            element={<VendorCategoryDetailPage />}
          />
          <Route path="/admin/vendor-selections" element={<VendorSelectionsPage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
