import { create } from "zustand";
import { activity as seedActivity, campaigns as seedCampaigns, escrow as seedEscrow, milestones as seedMilestones, pledges as seedPledges, transactions as seedTransactions, users as seedUsers } from "./seed";
import { CAMPAIGN_STATUS, ESCROW_STATUS, MILESTONE_STATUS, PLEDGE_STATUS, ROLES, TX_TYPE } from "./types";

const byRole = (users, role) => users.find((u) => u.role === role)?.id;
const uid = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const now = () => new Date().toISOString();

const addActivity = (state, log) => ({
  ...state,
  activity: [{ id: uid("act"), createdAt: now(), ...log }, ...state.activity].slice(0, 100),
});

export const useStore = create((set, get) => ({
  currentUserId: byRole(seedUsers, ROLES.BACKER),
  users: seedUsers,
  campaigns: seedCampaigns,
  milestones: seedMilestones,
  pledges: seedPledges,
  escrow: seedEscrow,
  transactions: seedTransactions,
  activity: seedActivity,

  setRole: (role) => set((state) => ({ currentUserId: byRole(state.users, role) || state.currentUserId })),
  setCurrentUser: (id) => set({ currentUserId: id }),

  createCampaign: (payload) =>
    set((state) => {
      const user = state.users.find((u) => u.id === state.currentUserId);
      if (!user || user.role !== ROLES.CAMPAIGNER) return state;
      const campaign = {
        id: uid("cmp"),
        campaignerId: user.id,
        currentFunded: 0,
        status: CAMPAIGN_STATUS.DRAFT,
        createdAt: now(),
        updatedAt: now(),
        imageUrl: payload.imageUrl || "",
        rewards: payload.rewards || [],
        ...payload,
      };
      return addActivity(
        { ...state, campaigns: [campaign, ...state.campaigns] },
        { campaignId: campaign.id, action: "CAMPAIGN_CREATED", performedById: user.id, newStatus: CAMPAIGN_STATUS.DRAFT }
      );
    }),

  submitCampaign: (id) =>
    set((state) => {
      const user = state.users.find((u) => u.id === state.currentUserId);
      const campaigns = state.campaigns.map((c) => (c.id === id ? { ...c, status: CAMPAIGN_STATUS.PENDING_APPROVAL, updatedAt: now() } : c));
      return addActivity({ ...state, campaigns }, { campaignId: id, action: "SUBMIT_CAMPAIGN", performedById: user?.id, newStatus: CAMPAIGN_STATUS.PENDING_APPROVAL });
    }),

  approveCampaign: (id) =>
    set((state) => {
      const user = state.users.find((u) => u.id === state.currentUserId);
      const campaigns = state.campaigns.map((c) => (c.id === id ? { ...c, status: CAMPAIGN_STATUS.ACTIVE, updatedAt: now() } : c));
      return addActivity({ ...state, campaigns }, { campaignId: id, action: "APPROVE_CAMPAIGN", performedById: user?.id, newStatus: CAMPAIGN_STATUS.ACTIVE });
    }),

  rejectCampaign: (id) =>
    set((state) => {
      const user = state.users.find((u) => u.id === state.currentUserId);
      const campaigns = state.campaigns.map((c) => (c.id === id ? { ...c, status: CAMPAIGN_STATUS.FAILED, updatedAt: now() } : c));
      return addActivity({ ...state, campaigns }, { campaignId: id, action: "REJECT_CAMPAIGN", performedById: user?.id, newStatus: CAMPAIGN_STATUS.FAILED });
    }),

  cancelCampaign: (id) =>
    set((state) => {
      const user = state.users.find((u) => u.id === state.currentUserId);
      const campaigns = state.campaigns.map((c) => (c.id === id ? { ...c, status: CAMPAIGN_STATUS.CANCELLED, updatedAt: now() } : c));
      return addActivity({ ...state, campaigns }, { campaignId: id, action: "CANCEL_CAMPAIGN", performedById: user?.id, newStatus: CAMPAIGN_STATUS.CANCELLED });
    }),

  pledge: (campaignId, amount, rewardSelection) =>
    set((state) => {
      const user = state.users.find((u) => u.id === state.currentUserId);
      const campaign = state.campaigns.find((c) => c.id === campaignId);
      if (!campaign || !user || user.role !== ROLES.BACKER || campaign.campaignerId === user.id) return state;

      const pledge = { id: uid("plg"), campaignId, backerId: user.id, amount, rewardSelection, status: PLEDGE_STATUS.COMPLETED, pledgedAt: now() };
      const campaigns = state.campaigns.map((c) => c.id === campaignId ? { ...c, currentFunded: c.currentFunded + amount, status: c.currentFunded + amount >= c.fundingGoal ? CAMPAIGN_STATUS.FUNDED : c.status, updatedAt: now() } : c);
      const esc = state.escrow.find((e) => e.campaignId === campaignId);
      const escrow = esc
        ? state.escrow.map((e) => e.campaignId === campaignId ? { ...e, totalAmount: e.totalAmount + amount, remainingAmount: e.remainingAmount + amount } : e)
        : [...state.escrow, { campaignId, totalAmount: amount, releasedAmount: 0, remainingAmount: amount, status: ESCROW_STATUS.HOLDING }];
      const transactions = [{ id: uid("tx"), campaignId, amount, transactionType: TX_TYPE.PLEDGE_CAPTURE, transactionStatus: "SUCCESS", createdAt: now() }, ...state.transactions];

      return addActivity(
        { ...state, pledges: [pledge, ...state.pledges], campaigns, escrow, transactions },
        { campaignId, action: "PLEDGE_CREATED", performedById: user.id, remarks: `Pledged ₹${amount}` }
      );
    }),

  cancelPledge: (id) =>
    set((state) => {
      const pledge = state.pledges.find((p) => p.id === id);
      if (!pledge || pledge.status !== PLEDGE_STATUS.COMPLETED) return state;
      const pledges = state.pledges.map((p) => (p.id === id ? { ...p, status: PLEDGE_STATUS.CANCELLED, cancelledAt: now() } : p));
      const campaigns = state.campaigns.map((c) => (c.id === pledge.campaignId ? { ...c, currentFunded: Math.max(0, c.currentFunded - pledge.amount), updatedAt: now() } : c));
      const escrow = state.escrow.map((e) =>
        e.campaignId === pledge.campaignId ? { ...e, totalAmount: Math.max(0, e.totalAmount - pledge.amount), remainingAmount: Math.max(0, e.remainingAmount - pledge.amount) } : e
      );
      return addActivity({ ...state, pledges, campaigns, escrow }, { campaignId: pledge.campaignId, action: "PLEDGE_CANCELLED", performedById: pledge.backerId });
    }),

  submitMilestone: (id) =>
    set((state) => {
      const m = state.milestones.find((x) => x.id === id);
      if (!m) return state;
      const milestones = state.milestones.map((x) => (x.id === id ? { ...x, status: MILESTONE_STATUS.SUBMITTED } : x));
      return addActivity({ ...state, milestones }, { campaignId: m.campaignId, action: "MILESTONE_SUBMITTED", performedById: state.currentUserId });
    }),

  verifyMilestone: (id) =>
    set((state) => {
      const m = state.milestones.find((x) => x.id === id);
      if (!m) return state;
      const milestones = state.milestones.map((x) =>
        x.id === id ? { ...x, status: MILESTONE_STATUS.VERIFIED, verifiedById: state.currentUserId, verifiedAt: now(), rejectionReason: undefined } : x
      );
      return addActivity({ ...state, milestones }, { campaignId: m.campaignId, action: "MILESTONE_VERIFIED", performedById: state.currentUserId });
    }),

  rejectMilestone: (id, reason) =>
    set((state) => {
      const m = state.milestones.find((x) => x.id === id);
      if (!m) return state;
      const milestones = state.milestones.map((x) => (x.id === id ? { ...x, status: MILESTONE_STATUS.REJECTED, rejectionReason: reason } : x));
      return addActivity({ ...state, milestones }, { campaignId: m.campaignId, action: "MILESTONE_REJECTED", performedById: state.currentUserId, remarks: reason });
    }),

  releaseMilestone: (id) =>
    set((state) => {
      const m = state.milestones.find((x) => x.id === id);
      if (!m || m.status !== MILESTONE_STATUS.VERIFIED) return state;
      const milestones = state.milestones.map((x) => (x.id === id ? { ...x, status: MILESTONE_STATUS.RELEASED, releasedAt: now() } : x));
      const escrow = state.escrow.map((e) =>
        e.campaignId === m.campaignId
          ? { ...e, releasedAmount: e.releasedAmount + m.fundAmount, remainingAmount: Math.max(0, e.remainingAmount - m.fundAmount), status: ESCROW_STATUS.RELEASING }
          : e
      );
      const transactions = [{ id: uid("tx"), campaignId: m.campaignId, milestoneId: m.id, amount: m.fundAmount, transactionType: TX_TYPE.MILESTONE_RELEASE, transactionStatus: "SUCCESS", createdAt: now() }, ...state.transactions];
      return addActivity({ ...state, milestones, escrow, transactions }, { campaignId: m.campaignId, action: "MILESTONE_RELEASED", performedById: state.currentUserId, remarks: `Released ₹${m.fundAmount}` });
    }),
}));

export const useCurrentUser = () => {
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);
  return users.find((u) => u.id === currentUserId);
};
