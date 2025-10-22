// client/src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Function to fetch all open jobs
export const getJobs = () => {
  return apiClient.get('/jobs');
};

// Function to fetch a single job by its ID
export const getJobById = (jobId) => {
  return apiClient.get(`/jobs/${jobId}`);
};

// Function to submit a proposal for a job
export const submitProposal = (jobId, proposalData) => {
  return apiClient.post(`/jobs/${jobId}/propose`, proposalData);
};

// Function to create a new job posting
export const createJob = (jobData) => {
  return apiClient.post('/jobs', jobData);
};

// Function to get jobs for the logged-in client
export const getMyJobs = () => {
  return apiClient.get('/jobs/my-jobs');
};

// Function to update a job
export const updateJob = (jobId, jobData) => {
  return apiClient.put(`/jobs/${jobId}`, jobData);
};

// Function to delete a job
export const deleteJob = (jobId) => {
  return apiClient.delete(`/jobs/${jobId}`);
};

// Function to get all proposals for a specific job
export const getProposalsForJob = (jobId) => {
  return apiClient.get(`/jobs/${jobId}/proposals`);
};

// Function to accept a proposal
export const acceptProposal = (proposalId) => {
  return apiClient.post(`/proposals/${proposalId}/accept`);
};

// Function to get proposals for the logged-in provider
export const getMyProposals = () => {
  return apiClient.get('/proposals/my-proposals');
};

// Function to get the profile for the logged-in user
export const getMyProfile = () => {
  return apiClient.get('/profiles/me');
};

// Function to submit a complaint
export const submitComplaint = (complaintData) => {
  return apiClient.post('/complaints', complaintData);
};

// Function to get chat history for a project
export const getMessagesForProject = (projectId) => {
  return apiClient.get(`/projects/${projectId}/messages`);
};

// Function to reject a proposal
export const rejectProposal = (proposalId) => {
  return apiClient.post(`/proposals/${proposalId}/reject`);
};

// Function for provider to submit work
export const submitWork = (jobId) => {
  return apiClient.post(`/jobs/${jobId}/submit`);
};

// Function for client to complete the job (release payment simulation)
export const completeJob = (jobId) => {
  return apiClient.post(`/jobs/${jobId}/complete`);
};

// Function for client to submit a rating
export const submitRating = (jobId, ratingData) => {
  return apiClient.post(`/ratings/job/${jobId}`, ratingData);
};