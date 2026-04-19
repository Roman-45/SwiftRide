import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, homeForRole, useAuth } from './auth/AuthContext';
import { RequireAuth, RequireRole } from './auth/guards';
import { ToastProvider } from './components/Toast';
import { EmptyState } from './components/EmptyState';
import { Icon } from './components/Icon';
import { getActiveTripForDriver, getActiveTripForPassenger } from './api/client';

import { PassengerLayout } from './layouts/PassengerLayout';
import { DriverLayout } from './layouts/DriverLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PassengerBookingPage } from './pages/PassengerBookingPage';
import { PassengerActiveTripPage } from './pages/PassengerActiveTripPage';
import { PassengerHistoryPage } from './pages/PassengerHistoryPage';
import { PassengerReceiptPage } from './pages/PassengerReceiptPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { DriverActiveTripPage } from './pages/DriverActiveTripPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminTripsPage } from './pages/AdminTripsPage';
import { NotFoundPage } from './pages/NotFoundPage';

function Root() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  return <Navigate to={user ? homeForRole(user.role) : '/login'} replace />;
}

function GuardLogin({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}

function PassengerActiveRedirect() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [none, setNone] = useState(false);
  useEffect(() => {
    if (!user) return;
    getActiveTripForPassenger(user.id)
      .then((t) => { if (t) nav(`/passenger/trip/${t.id}`, { replace: true }); else setNone(true); })
      .catch(() => setNone(true));
  }, [user, nav]);
  if (!none) return null;
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="sr-card">
        <EmptyState
          icon="route"
          title="No active trip"
          body="You're not on a trip right now. Book a ride to get moving."
          action={<Link to="/passenger/book" className="sr-btn sr-btn--primary sr-btn--sm"><Icon name="plus" size={13} /> Book a ride</Link>}
        />
      </div>
    </div>
  );
}

function DriverActiveRedirect() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [none, setNone] = useState(false);
  useEffect(() => {
    if (!user) return;
    getActiveTripForDriver(user.id)
      .then((t) => { if (t) nav(`/driver/trip/${t.id}`, { replace: true }); else setNone(true); })
      .catch(() => setNone(true));
  }, [user, nav]);
  if (!none) return null;
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="sr-card">
        <EmptyState
          icon="car"
          title="No active trip"
          body="Accept a pending request from the dashboard to start driving."
          action={<Link to="/driver" className="sr-btn sr-btn--primary sr-btn--sm"><Icon name="arrow-left" size={13} /> Back to dashboard</Link>}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<GuardLogin><LoginPage /></GuardLogin>} />
            <Route path="/register" element={<GuardLogin><RegisterPage /></GuardLogin>} />

            <Route element={<RequireAuth><RequireRole role="passenger"><PassengerLayout /></RequireRole></RequireAuth>}>
              <Route path="/passenger" element={<Navigate to="/passenger/book" replace />} />
              <Route path="/passenger/book" element={<PassengerBookingPage />} />
              <Route path="/passenger/active" element={<PassengerActiveRedirect />} />
              <Route path="/passenger/trip/:id" element={<PassengerActiveTripPage />} />
              <Route path="/passenger/trip/:id/receipt" element={<PassengerReceiptPage />} />
              <Route path="/passenger/history" element={<PassengerHistoryPage />} />
            </Route>

            <Route element={<RequireAuth><RequireRole role="driver"><DriverLayout /></RequireRole></RequireAuth>}>
              <Route path="/driver" element={<DriverDashboardPage />} />
              <Route path="/driver/trip" element={<DriverActiveRedirect />} />
              <Route path="/driver/trip/:id" element={<DriverActiveTripPage />} />
            </Route>

            <Route element={<RequireAuth><RequireRole role="admin"><AdminLayout /></RequireRole></RequireAuth>}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/trips" element={<AdminTripsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
