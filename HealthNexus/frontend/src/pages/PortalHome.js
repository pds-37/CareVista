import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getPortalPathForRole } from '../auth/roleConfig';

function PortalHome() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return <Navigate replace to={getPortalPathForRole(user.role)} />;
}

export default PortalHome;
