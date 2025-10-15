// client/src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Function to fetch all open jobs
export const getJobs = () => {
  return apiClient.get('/jobs');
};

// --- ADD THIS NEW FUNCTION ---
// Function to fetch a single job by its ID
export const getJobById = (jobId) => {
  return apiClient.get(`/jobs/${jobId}`);
};