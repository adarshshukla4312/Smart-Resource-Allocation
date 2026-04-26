/**
 * API Client — attaches Firebase Auth token to all backend requests.
 * Used for operations that go through the Cloud Run monolith.
 */
import { auth } from './firebase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function apiRequest(path, options = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Tasks API ───
export const tasksApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/v1/tasks${qs ? `?${qs}` : ''}`);
  },
  get: (taskId) => apiRequest(`/v1/tasks/${taskId}`),
  create: (taskData) => apiRequest('/v1/tasks', { method: 'POST', body: JSON.stringify(taskData) }),
  update: (taskId, updates) => apiRequest(`/v1/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  apply: (taskId, matchScore) => apiRequest(`/v1/tasks/${taskId}/apply`, { method: 'POST', body: JSON.stringify({ matchScore }) }),
  submitProof: (taskId, proofMedia) => apiRequest(`/v1/tasks/${taskId}/proof`, { method: 'POST', body: JSON.stringify({ proofMedia }) }),
  getApplications: (taskId) => apiRequest(`/v1/tasks/${taskId}/applications`),
};

// ─── Users API ───
export const usersApi = {
  register: (profileData) => apiRequest('/v1/users/register', { method: 'POST', body: JSON.stringify(profileData) }),
  getMe: () => apiRequest('/v1/users/me'),
  updateMe: (updates) => apiRequest('/v1/users/me', { method: 'PATCH', body: JSON.stringify(updates) }),
  getUser: (uid) => apiRequest(`/v1/users/${uid}`),
};

// ─── Match API ───
export const matchApi = {
  getFeed: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return apiRequest(`/v1/match/feed${qs ? `?${qs}` : ''}`);
  },
  getScore: (taskId) => apiRequest(`/v1/match/score/${taskId}`),
};

// ─── Admin API ───
export const adminApi = {
  approve: (taskId) => apiRequest(`/v1/admin/${taskId}/approve`, { method: 'POST' }),
  reject: (taskId, reason) => apiRequest(`/v1/admin/${taskId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  override: (taskId, overrides) => apiRequest(`/v1/admin/${taskId}/override`, { method: 'POST', body: JSON.stringify(overrides) }),
  addComment: (taskId, text) => apiRequest(`/v1/admin/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
  acceptApp: (appId) => apiRequest(`/v1/admin/applications/${appId}/accept`, { method: 'POST' }),
  rejectApp: (appId, reason) => apiRequest(`/v1/admin/applications/${appId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  verifyProof: (appId, approved) => apiRequest(`/v1/admin/applications/${appId}/verify-proof`, { method: 'POST', body: JSON.stringify({ approved }) }),
  completeTask: (taskId) => apiRequest(`/v1/admin/${taskId}/complete`, { method: 'POST' }),
  getStats: () => apiRequest('/v1/admin/stats'),
};
