import { Link } from 'react-router-dom';
import { useAuth, homeForRole } from '../auth/AuthContext';

export function NotFoundPage() {
  const { user } = useAuth();
  const target = user ? homeForRole(user.role) : '/login';
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="text-center max-w-md">
        <div className="sr-eyebrow mb-2">404 · Route not found</div>
        <h1 className="sr-display" style={{ fontSize: 'clamp(40px, 7vw, 64px)' }}>
          Looks like a <span className="sr-italic">detour</span>.
        </h1>
        <p className="sr-body mt-3">That page doesn't exist. Back to your dashboard?</p>
        <Link to={target} className="sr-btn sr-btn--primary sr-btn--lg mt-5 inline-flex">Take me home</Link>
      </div>
    </div>
  );
}
