import { Navigate, Outlet } from 'react-router';
import { useSession } from './SessionContext';

const GuestProtectedRoute = () => {
    const { session } = useSession();
    if (session) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default GuestProtectedRoute;
