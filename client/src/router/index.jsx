// client/src/router/index.jsx
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import CreateProfilePage from '../pages/CreateProfilePage';
import JobBoardPage from '../pages/JobBoardPage';
import JobDetailPage from '../pages/JobDetailPage'; // add this
import PostJobPage from '../pages/PostJobPage';
import DashboardPage from '../pages/DashboardPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/jobs" element={<JobBoardPage />} /> 
      <Route path="/jobs/:jobId" element={<JobDetailPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/create-profile" element={<CreateProfilePage />} />
        <Route path="/jobs/new" element={<PostJobPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}