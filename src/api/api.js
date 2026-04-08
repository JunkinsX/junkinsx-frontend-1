import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // Update this to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPipelines = () => api.get('/pipeline');
export const getPipeline = (id) => api.get(`/pipeline/${id}`);
export const createPipeline = (data) => api.post('/pipeline', data);
export const triggerPipeline = (id) => api.post(`/webhook/${id}`);
export const getJob = (jobId) => api.get(`/job/${jobId}`);

export default api;
