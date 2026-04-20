import api from './axios';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const loginAPI    = (data) => api.post('/auth/login', data);
export const registerAPI = (data) => api.post('/auth/register', data);

// ─── Campaigns ───────────────────────────────────────────────────────────────
export const getCampaignsAPI       = ()     => api.get('/campaigns');
export const getActiveCampaignsAPI = ()     => api.get('/campaigns/active');
export const getCampaignAPI        = (id)   => api.get(`/campaigns/${id}`);
export const createCampaignAPI     = (data) => api.post('/campaigns', data);
export const submitCampaignAPI     = (id)   => api.put(`/campaigns/${id}/submit`);
export const approveCampaignAPI    = (id)   => api.put(`/campaigns/${id}/approve`);
export const cancelCampaignAPI     = (id)   => api.put(`/campaigns/${id}/cancel`);

// ─── Milestones ──────────────────────────────────────────────────────────────
export const getMilestonesAPI    = (campaignId) => api.get(`/milestones/campaign/${campaignId}`);
export const createMilestoneAPI  = (data)       => api.post('/milestones', data);
export const submitMilestoneAPI  = (id)         => api.put(`/milestones/${id}/submit`);
export const verifyMilestoneAPI  = (id)         => api.put(`/milestones/${id}/verify`);
export const rejectMilestoneAPI  = (id)         => api.put(`/milestones/${id}/reject`);

// ─── Pledges ─────────────────────────────────────────────────────────────────
export const createPledgeAPI = (data) => api.post('/pledges', data);
export const cancelPledgeAPI = (id)   => api.put(`/pledges/${id}/cancel`);
export const getPledgesAPI   = ()     => api.get('/pledges');

// ─── Escrow ──────────────────────────────────────────────────────────────────
export const getEscrowAPI = (campaignId) => api.get(`/escrow/campaign/${campaignId}`);

// ─── Releases ────────────────────────────────────────────────────────────────
export const releaseFundsAPI = (milestoneId) => api.post(`/releases/milestone/${milestoneId}`);

// ─── Transactions ─────────────────────────────────────────────────────────────
export const getTransactionsAPI = (campaignId) => api.get(`/transactions/campaign/${campaignId}`);
