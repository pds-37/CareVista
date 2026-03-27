import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getPortalPathForRole } from '../auth/roleConfig';

function ProtectedRoute({ roles = [], children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="section section-centered">
        <div className="loading-spinner" aria-label="Loading account" />
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate replace to={getPortalPathForRole(user.role)} />;
  }

  return children;
}

export default ProtectedRoute;
