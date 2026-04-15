import axios from 'axios';

const BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ─── USER ─────────────────────────────────────────────────────
export const registerUser  = (data) => api.post('/api/user/register', data);
export const loginUser     = (data) => api.post('/api/user/login', data);
export const getAllUsers    = ()     => api.get('/api/user');

// ─── PIPELINE ──────────────────────────────────────────────────
export const createPipeline        = (data) => api.post('/api/pipeline/create', data);
export const getPipelinesByUser    = (userId) => api.get(`/api/pipeline?userId=${userId}`);
export const addBundleToPipeline   = (data) => api.post('/api/pipeline/bundle', data);
export const addTasksToPipeline    = (data) => api.post('/api/pipeline/tasks', data);
export const addSecretsToPipeline  = (data) => api.post('/api/pipeline/secrets', data);
export const setSSHKeys            = (data) => api.post('/api/pipeline/keys', data);
export const executePipeline       = (id)   => api.post(`/api/pipeline/execute/${id}`);

// ─── BUNDLE ────────────────────────────────────────────────────
export const createBundle    = (data)   => api.post('/api/bundle/create', data);
export const addBundleToUser = (data)   => api.post('/api/bundle/add-to-user', data);
export const getBundles      = (userId) => api.get(`/api/bundle?userId=${userId}`);

// ─── TASK ──────────────────────────────────────────────────────
export const createTask          = (data)       => api.post('/api/task/create', data);
export const getTasksByPipeline  = (pipelineId) => api.get(`/api/task?pipelineId=${pipelineId}`);

// ─── SECRET ────────────────────────────────────────────────────
export const createSecret = (data) => api.post('/api/secret/create', data);
export const getSecret    = (id)   => api.get(`/api/secret/${id}`);

// ─── LOGS ──────────────────────────────────────────────────────
export const getLogs = (pipelineId) => api.get(`/api/logs/${pipelineId}`);

export default api;
