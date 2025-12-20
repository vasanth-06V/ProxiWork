import axios from 'axios';

// 1. Determine the API URL
// Priority: Vercel Env Var -> Localhost fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('📡 Connecting API to:', API_URL); 

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token in every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- API Functions ---

// Auth
export const registerUser = (userData) => apiClient.post('/auth/register', userData);
export const loginUser = (userData) => apiClient.post('/auth/login', userData);

// Profiles
export const getMyProfile = () => apiClient.get('/profiles/me');
export const createOrUpdateProfile = (profileData) => apiClient.post('/profiles', profileData);

// Jobs
export const getJobs = () => apiClient.get('/jobs');
export const getJobById = (id) => apiClient.get(`/jobs/${id}`);
export const createJob = (jobData) => apiClient.post('/jobs', jobData);
export const getMyJobs = () => apiClient.get('/jobs/my-jobs');
export const updateJob = (id, jobData) => apiClient.put(`/jobs/${id}`, jobData);
export const deleteJob = (id) => apiClient.delete(`/jobs/${id}`);

// Proposals
export const getProposalsForJob = (jobId) => apiClient.get(`/jobs/${jobId}/proposals`);
export const submitProposal = (jobId, proposalData) => apiClient.post(`/jobs/${jobId}/propose`, proposalData);
export const acceptProposal = (proposalId) => apiClient.post(`/proposals/${proposalId}/accept`);
export const rejectProposal = (proposalId) => apiClient.post(`/proposals/${proposalId}/reject`);
export const getMyProposals = () => apiClient.get('/proposals/my-proposals');

// Work & Completion
export const submitWork = (jobId) => apiClient.post(`/jobs/${jobId}/submit`);
export const completeJob = (jobId) => apiClient.post(`/jobs/${jobId}/complete`);

// Ratings
export const submitRating = (jobId, ratingData) => apiClient.post(`/ratings/job/${jobId}`, ratingData);

// Chat & Messages
export const getMessagesForProject = (projectId) => apiClient.get(`/projects/${projectId}/messages`);
export const getUserProjects = () => apiClient.get('/projects'); // For Messages Page

// Complaints
export const createComplaint = (complaintData) => apiClient.post('/complaints', complaintData);

// File Upload
export const uploadFile = (formData) => {
    return apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Notifications
export const getNotifications = () => apiClient.get('/notifications');
export const markNotificationRead = (notificationId) => apiClient.put(`/notifications/${notificationId}/read`);

export default apiClient;