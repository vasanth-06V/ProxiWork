// client/src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// --- THIS IS THE NEW, CRUCIAL PART ---
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
// --- END OF NEW PART ---


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