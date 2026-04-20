import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const campaignService = {
  getAll: () => api.get('/campaigns'),
  getActive: () => api.get('/campaigns/active'),
  getByCampaigner: (id) => api.get(`/campaigns?campaignerId=${id}`),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  submit: (id) => api.put(`/campaigns/${id}/submit`),
  approve: (id) => api.put(`/campaigns/${id}/approve`),
  cancel: (id) => api.put(`/campaigns/${id}/cancel`),
};

export const milestoneService = {
  getByCampaign: (campaignId) => api.get(`/milestones/campaign/${campaignId}`),
  create: (data) => api.post('/milestones', data),
  submit: (id) => api.put(`/milestones/${id}/submit`),
  verify: (id) => api.put(`/milestones/${id}/verify`),
  reject: (id) => api.put(`/milestones/${id}/reject`),
};

export default api;
