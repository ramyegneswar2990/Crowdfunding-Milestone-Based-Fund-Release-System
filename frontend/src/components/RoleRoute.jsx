import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute — Renders children only when user.role is in the `roles` array.
 * Redirects to /dashboard otherwise.
 *
 * @param {string[]} roles  - Allowed roles, e.g. ['ADMIN', 'VERIFIER']
 * @param {ReactNode} children
 */
const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
