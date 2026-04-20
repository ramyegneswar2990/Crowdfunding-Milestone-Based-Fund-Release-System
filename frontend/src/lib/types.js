export const ROLES = {
  ADMIN: "ADMIN",
  CAMPAIGNER: "CAMPAIGNER",
  BACKER: "BACKER",
  VERIFIER: "VERIFIER",
};

export const CATEGORIES = {
  TECHNOLOGY: "TECHNOLOGY",
  EDUCATION: "EDUCATION",
  MEDICAL: "MEDICAL",
  CREATIVE: "CREATIVE",
  SOCIAL: "SOCIAL",
};

export const CAMPAIGN_STATUS = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  ACTIVE: "ACTIVE",
  FUNDED: "FUNDED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

export const MILESTONE_STATUS = {
  LOCKED: "LOCKED",
  ACTIVE: "ACTIVE",
  SUBMITTED: "SUBMITTED",
  VERIFIED: "VERIFIED",
  RELEASED: "RELEASED",
  REJECTED: "REJECTED",
};

export const PLEDGE_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
};

export const ESCROW_STATUS = {
  HOLDING: "HOLDING",
  RELEASING: "RELEASING",
  COMPLETED: "COMPLETED",
};

export const TX_TYPE = {
  PLEDGE_CAPTURE: "PLEDGE_CAPTURE",
  MILESTONE_RELEASE: "MILESTONE_RELEASE",
  REFUND: "REFUND",
};

/**
 * @typedef {{ id:string, name:string, email:string, role:string, avatar?:string, createdAt:string }} User
 * @typedef {{ id:string, campaignerId:string, title:string, tagline:string, description:string, fundingGoal:number, currentFunded:number, status:string, startDate:string, endDate:string, category:string, imageUrl:string, createdAt:string, updatedAt:string, rewards?:Array<{tier:string, minAmount:number, description:string}> }} Campaign
 * @typedef {{ id:string, campaignId:string, title:string, description:string, fundAmount:number, status:string, dueDate:string, verifiedById?:string, verifiedAt?:string, releasedAt?:string, rejectionReason?:string }} Milestone
 * @typedef {{ id:string, campaignId:string, backerId:string, amount:number, rewardSelection?:string, status:string, pledgedAt:string, cancelledAt?:string }} Pledge
 * @typedef {{ campaignId:string, totalAmount:number, releasedAmount:number, remainingAmount:number, status:string }} EscrowHolding
 * @typedef {{ id:string, campaignId:string, milestoneId?:string, amount:number, transactionType:string, transactionStatus:string, createdAt:string }} FundReleaseTransaction
 * @typedef {{ id:string, campaignId:string, action:string, performedById:string, oldStatus?:string, newStatus?:string, remarks?:string, createdAt:string }} ActivityLog
 */
