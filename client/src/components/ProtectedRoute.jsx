// client/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        // You can replace this with a nice Spinner component if you have one
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    // If user is not logged in, redirect to Login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user IS logged in, render the child route (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;