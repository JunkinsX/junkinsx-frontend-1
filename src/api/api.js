import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'https://junkins.utej.me';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── USER ─────────────────────────────────────────────────────
// ─── USER ─────────────────────────────────────────────────────
export const registerUser  = (data) => api.post('/api/user/register', data);
export const loginUser     = (data) => api.post('/api/user/login', data);
export const getAllUsers = () => api.get('/api/user');

// ─── PIPELINE ──────────────────────────────────────────────────
export const createPipeline        = (data)   => api.post('/api/pipeline/add', data);
export const getPipelinesByUser    = (userId) => api.get(`/api/pipeline?userId=${userId}`);
export const addBundleToPipeline   = (data)   => api.post('/api/pipeline/add-bundle', data);
export const addTasksToPipeline    = (data)   => api.post('/api/pipeline/add-tasks', data);
export const addSecretsToPipeline  = (data)   => api.post('/api/pipeline/add-secrets', data);
export const executePipeline       = (id)     => api.get(`/api/pipeline/execute/${id}`);
export const getPipelinePublicKey  = (id)     => api.get(`/api/pipeline/public-key/${id}`);

// ─── BUNDLE ────────────────────────────────────────────────────
export const createBundle        = (data)   => api.post('/api/bundle/create', data);
export const addBundleToUser     = (data)   => api.post('/api/bundle/add-to-user', data);
export const getBundles          = (userId) => api.get(`/api/bundle?userId=${userId}`);
export const getBundlesByUserId  = (userId) => api.get(`/api/bundle/${userId}`);

// ─── TASK ──────────────────────────────────────────────────────
export const createTask         = (data)       => api.post('/api/task/create', data);
/**
 * Returns tasks already attached to a specific pipeline.
 * Used in the pipeline detail Bundles/Tasks tab to display what's configured.
 */
export const getTasksByPipeline = (pipelineId) => api.get(`/api/task?pipelineId=${pipelineId}`);

// ─── SECRET ────────────────────────────────────────────────────
export const createSecret = (data) => api.post('/api/secret/create', data);
export const getSecret    = (id)   => api.get(`/api/secret/${id}`);

// ─── LOGS ──────────────────────────────────────────────────────
export const clearLogs = (pipelineId) => api.delete(`/api/pipeline/logs/${pipelineId}`);
export const getLogs = (pipelineId) => api.get(`/api/logs/${pipelineId}`);

export default api;
