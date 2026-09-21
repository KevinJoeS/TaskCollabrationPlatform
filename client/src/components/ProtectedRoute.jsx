import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FullPageLoader } from './ui/Misc';
import { ErrorState } from './ui/States';

export default function ProtectedRoute({ children }) {
  const { user, loading, bootError, retry, signedOut } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (bootError)
    return (
      <div className="full-loader">
        <ErrorState error={bootError} onRetry={retry} />
      </div>
    );
  if (user) return children;
  if (signedOut) return <Navigate to="/" replace />;
  return <Navigate to="/login" state={{ from: location }} replace />;
}

/** Login and register are pointless once signed in. */
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const from = useLocation().state?.from;
  if (loading) return <FullPageLoader />;
  return user ? <Navigate to={from ? `${from.pathname}${from.search || ''}` : '/dashboard'} replace /> : children;
}
