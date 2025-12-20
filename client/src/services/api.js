import axios from 'axios';

// 1. Determine the API URL
// If running on Vercel, this uses the Environment Variable.
// If running locally, it falls back to localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('📡 Connecting API to:', API_URL); // Check your console to see which one it picks!

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ---- REQUEST INTERCEPTOR (JWT) ----
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

// ---------- AUTH ----------
export const registerUser = (userData) =>
    apiClient.post('/auth/register', userData);

export const loginUser = (userData) =>
    apiClient.post('/auth/login', userData);

// ---------- PROFILES ----------
export const getMyProfile = () =>
    apiClient.get('/profiles/me');

export const createOrUpdateProfile = (profileData) =>
    apiClient.post('/profiles', profileData);

// ---------- JOBS ----------
export const getJobs = () =>
    apiClient.get('/jobs');

export const getJobById = (jobId) =>
    apiClient.get(`/jobs/${jobId}`);

export const createJob = (jobData) =>
    apiClient.post('/jobs', jobData);

export const getMyJobs = () =>
    apiClient.get('/jobs/my-jobs');

export const updateJob = (jobId, jobData) =>
    apiClient.put(`/jobs/${jobId}`, jobData);

export const deleteJob = (jobId) =>
    apiClient.delete(`/jobs/${jobId}`);

// ---------- PROPOSALS ----------
export const submitProposal = (jobId, proposalData) =>
    apiClient.post(`/jobs/${jobId}/propose`, proposalData);

export const getProposalsForJob = (jobId) =>
    apiClient.get(`/jobs/${jobId}/proposals`);

export const acceptProposal = (proposalId) =>
    apiClient.post(`/proposals/${proposalId}/accept`);

export const rejectProposal = (proposalId) =>
    apiClient.post(`/proposals/${proposalId}/reject`);

export const getMyProposals = () =>
    apiClient.get('/proposals/my-proposals');

// ---------- WORK & COMPLETION ----------
export const submitWork = (jobId) =>
    apiClient.post(`/jobs/${jobId}/submit`);

export const completeJob = (jobId) =>
    apiClient.post(`/jobs/${jobId}/complete`);

export const submitRating = (jobId, ratingData) =>
    apiClient.post(`/ratings/job/${jobId}`, ratingData);

// ---------- CHAT & PROJECTS ----------
export const getMessagesForProject = (projectId) =>
    apiClient.get(`/projects/${projectId}/messages`);

export const getUserProjects = () =>
    apiClient.get('/projects');

// ---------- COMPLAINTS ----------
export const submitComplaint = (complaintData) =>
    apiClient.post('/complaints', complaintData);

// ---------- FILE UPLOAD ----------
export const uploadFile = (formData) =>
    apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ---------- NOTIFICATIONS ----------
export const getNotifications = () =>
    apiClient.get('/notifications');

export const markNotificationRead = (notificationId) =>
    apiClient.put(`/notifications/${notificationId}/read`);

// Submit a complaint
export const createComplaint = (complaintData) => {
    return apiClient.post('/complaints', complaintData);
};

export default apiClient;
