import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import EditProfilePage from '../pages/EditProfilePage';
import JobBoardPage from '../pages/JobBoardPage';
import JobDetailPage from '../pages/JobDetailPage';
import PostJobPage from '../pages/PostJobPage';
import DashboardPage from '../pages/DashboardPage';
import ProtectedRoute from '../components/ProtectedRoute';
import ViewProposalsPage from '../pages/ViewProposalsPage';
import ProviderDashboard from '../pages/ProviderDashboard';
import ProfilePage from '../pages/ProfilePage';
import ComplaintPage from '../pages/ComplaintPage';
import ChatPage from '../pages/ChatPage';
import MessagesPage from '../pages/MessagesPage'; // Imported MessagesPage

export default function AppRouter() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/jobs" element={<JobBoardPage />} /> 
      <Route path="/jobs/:jobId" element={<JobDetailPage />} />

      {/* --- Protected Routes --- */}
      <Route element={<ProtectedRoute />}>
        <Route path="/create-profile" element={<EditProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/jobs/new" element={<PostJobPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-proposals" element={<ProviderDashboard />} />
        <Route path="/jobs/:jobId/proposals" element={<ViewProposalsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/complaint" element={<ComplaintPage />} />
        <Route path="/projects/:projectId/chat" element={<ChatPage />} />
        
        {/* The new Messages route */}
        <Route path="/messages" element={<MessagesPage />} />
      </Route>
    </Routes>
  );
}