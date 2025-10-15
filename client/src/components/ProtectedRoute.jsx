// client/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth(); // <-- 1. GET THE LOADING STATE

  // 2. If we are still loading, show a simple loading message
  if (loading) {
    return <div>Loading...</div>; 
  }

  // 3. If loading is finished AND there's a user, show the page
  if (user) {
    return <Outlet />;
  }

  // 4. If loading is finished AND there's no user, redirect to login
  return <Navigate to="/login" replace />; 
}