import { Outlet } from 'react-router';
import { useSession } from './SessionContext';
import Login from '../pages/auth/login';

const AuthProtectedRoute = () => {
  const { session } = useSession();
  if (!session) {
    return <Login />
  }
  return <Outlet />;
};

export default AuthProtectedRoute;
