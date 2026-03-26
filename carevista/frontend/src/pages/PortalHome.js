import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function PortalHome() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (user.role === 'admin') {
    return <Navigate replace to="/portal/admin" />;
  }

  if (user.role === 'doctor') {
    return <Navigate replace to="/portal/doctor" />;
  }

  return <Navigate replace to="/portal/patient" />;
}

export default PortalHome;
