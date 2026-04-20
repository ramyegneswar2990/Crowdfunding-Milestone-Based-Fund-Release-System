import heroImg from "../assets/hero.png";
import {
  CATEGORIES,
  CAMPAIGN_STATUS,
  ESCROW_STATUS,
  MILESTONE_STATUS,
  PLEDGE_STATUS,
  ROLES,
  TX_TYPE,
} from "./types";

const now = new Date();
const iso = (days) => new Date(now.getTime() + days * 86400000).toISOString();

export const users = [
  { id: "u-admin", name: "Aanya Sharma", email: "aanya@fundflow.dev", role: ROLES.ADMIN, createdAt: iso(-120) },
  { id: "u-c1", name: "Rahul Verma", email: "rahul@fundflow.dev", role: ROLES.CAMPAIGNER, createdAt: iso(-105) },
  { id: "u-c2", name: "Priya Iyer", email: "priya@fundflow.dev", role: ROLES.CAMPAIGNER, createdAt: iso(-90) },
  { id: "u-c3", name: "Karan Mehta", email: "karan@fundflow.dev", role: ROLES.CAMPAIGNER, createdAt: iso(-85) },
  { id: "u-b1", name: "Neha Gupta", email: "neha@fundflow.dev", role: ROLES.BACKER, createdAt: iso(-70) },
  { id: "u-b2", name: "Arjun Rao", email: "arjun@fundflow.dev", role: ROLES.BACKER, createdAt: iso(-67) },
  { id: "u-b3", name: "Sara Khan", email: "sara@fundflow.dev", role: ROLES.BACKER, createdAt: iso(-64) },
  { id: "u-v1", name: "Dr. Vikram Joshi", email: "vikram@fundflow.dev", role: ROLES.VERIFIER, createdAt: iso(-100) },
];

export const campaigns = [
  { id: "c1", campaignerId: "u-c1", title: "SolarWorks", tagline: "Off-grid solar kits for rural homes", description: "Deploy modular solar kits and local maintenance hubs to electrify villages.", fundingGoal: 1500000, currentFunded: 1180000, status: CAMPAIGN_STATUS.ACTIVE, startDate: iso(-18), endDate: iso(21), category: CATEGORIES.TECHNOLOGY, imageUrl: heroImg, createdAt: iso(-25), updatedAt: iso(-1), rewards: [{ tier: "Supporter", minAmount: 500, description: "Digital thank-you wall" }, { tier: "Patron", minAmount: 5000, description: "Impact report + updates" }, { tier: "Champion", minAmount: 25000, description: "Site visit invite" }] },
  { id: "c2", campaignerId: "u-c2", title: "LearnBridge", tagline: "Tablets for 1,000 students", description: "Distribute education tablets and content packs in underserved districts.", fundingGoal: 800000, currentFunded: 820000, status: CAMPAIGN_STATUS.FUNDED, startDate: iso(-30), endDate: iso(-1), category: CATEGORIES.EDUCATION, imageUrl: heroImg, createdAt: iso(-38), updatedAt: iso(-1), rewards: [{ tier: "Friend", minAmount: 1000, description: "Impact postcard" }, { tier: "Mentor", minAmount: 10000, description: "Sponsor certificate" }] },
  { id: "c3", campaignerId: "u-c3", title: "MediCare Mobile Clinic", tagline: "Healthcare on wheels", description: "Set up a mobile primary-care van for rural health screenings.", fundingGoal: 2200000, currentFunded: 540000, status: CAMPAIGN_STATUS.ACTIVE, startDate: iso(-10), endDate: iso(33), category: CATEGORIES.MEDICAL, imageUrl: heroImg, createdAt: iso(-16), updatedAt: iso(-2) },
  { id: "c4", campaignerId: "u-c2", title: "Echoes of the Coast", tagline: "Indie documentary on coastal voices", description: "Film and edit a documentary on livelihoods impacted by climate change.", fundingGoal: 600000, currentFunded: 380000, status: CAMPAIGN_STATUS.ACTIVE, startDate: iso(-7), endDate: iso(27), category: CATEGORIES.CREATIVE, imageUrl: heroImg, createdAt: iso(-11), updatedAt: iso(-1) },
  { id: "c5", campaignerId: "u-c1", title: "GreenCity Tree Plantation", tagline: "Plant 25,000 native trees", description: "Urban plantation with monitored survivability and volunteer mapping.", fundingGoal: 450000, currentFunded: 120000, status: CAMPAIGN_STATUS.PENDING_APPROVAL, startDate: iso(2), endDate: iso(42), category: CATEGORIES.SOCIAL, imageUrl: heroImg, createdAt: iso(-4), updatedAt: iso(-1) },
  { id: "c6", campaignerId: "u-c3", title: "Code Camp for Girls", tagline: "Bootcamp scholarships for girls", description: "Scholarship-backed coding camp with mentorship and internships.", fundingGoal: 750000, currentFunded: 0, status: CAMPAIGN_STATUS.DRAFT, startDate: iso(5), endDate: iso(50), category: CATEGORIES.EDUCATION, imageUrl: heroImg, createdAt: iso(-2), updatedAt: iso(-1) },
];

export const milestones = [
  { id: "m1", campaignId: "c2", title: "Device Procurement", description: "Bulk purchase tablets.", fundAmount: 250000, status: MILESTONE_STATUS.RELEASED, dueDate: iso(-15), verifiedById: "u-v1", verifiedAt: iso(-16), releasedAt: iso(-15) },
  { id: "m2", campaignId: "c2", title: "Distribution Phase 1", description: "Deliver to 400 students.", fundAmount: 200000, status: MILESTONE_STATUS.RELEASED, dueDate: iso(-8), verifiedById: "u-v1", verifiedAt: iso(-9), releasedAt: iso(-8) },
  { id: "m3", campaignId: "c2", title: "Distribution Phase 2", description: "Deliver remaining units.", fundAmount: 200000, status: MILESTONE_STATUS.SUBMITTED, dueDate: iso(2) },
  { id: "m4", campaignId: "c1", title: "Pilot Installations", description: "Install first 100 kits.", fundAmount: 300000, status: MILESTONE_STATUS.ACTIVE, dueDate: iso(10) },
  { id: "m5", campaignId: "c1", title: "Ops Team Training", description: "Train local teams.", fundAmount: 220000, status: MILESTONE_STATUS.LOCKED, dueDate: iso(24) },
  { id: "m6", campaignId: "c1", title: "Scale Rollout", description: "Expand across villages.", fundAmount: 450000, status: MILESTONE_STATUS.LOCKED, dueDate: iso(34) },
  { id: "m7", campaignId: "c3", title: "Van Purchase", description: "Purchase and outfit van.", fundAmount: 500000, status: MILESTONE_STATUS.VERIFIED, dueDate: iso(8), verifiedById: "u-v1", verifiedAt: iso(-1) },
  { id: "m8", campaignId: "c3", title: "Staff Hiring", description: "Hire nurse and medic.", fundAmount: 320000, status: MILESTONE_STATUS.SUBMITTED, dueDate: iso(17) },
  { id: "m9", campaignId: "c3", title: "First Health Camp", description: "Run first 5 village camps.", fundAmount: 300000, status: MILESTONE_STATUS.REJECTED, dueDate: iso(26), rejectionReason: "Need better attendance records." },
  { id: "m10", campaignId: "c4", title: "Research & Script", description: "Storyboarding and interviews.", fundAmount: 150000, status: MILESTONE_STATUS.ACTIVE, dueDate: iso(11) },
  { id: "m11", campaignId: "c4", title: "Principal Photography", description: "On-ground shooting.", fundAmount: 170000, status: MILESTONE_STATUS.LOCKED, dueDate: iso(20) },
  { id: "m12", campaignId: "c4", title: "Post Production", description: "Edit, sound, color.", fundAmount: 180000, status: MILESTONE_STATUS.LOCKED, dueDate: iso(30) },
  { id: "m13", campaignId: "c6", title: "Curriculum Design", description: "Finalize modules.", fundAmount: 100000, status: MILESTONE_STATUS.LOCKED, dueDate: iso(15) },
  { id: "m14", campaignId: "c6", title: "Mentor Onboarding", description: "Onboard mentors.", fundAmount: 120000, status: MILESTONE_STATUS.LOCKED, dueDate: iso(24) },
];

export const pledges = [
  { id: "p1", campaignId: "c1", backerId: "u-b1", amount: 25000, rewardSelection: "Champion", status: PLEDGE_STATUS.COMPLETED, pledgedAt: iso(-5) },
  { id: "p2", campaignId: "c1", backerId: "u-b2", amount: 5000, rewardSelection: "Patron", status: PLEDGE_STATUS.COMPLETED, pledgedAt: iso(-4) },
  { id: "p3", campaignId: "c1", backerId: "u-b3", amount: 500, rewardSelection: "Supporter", status: PLEDGE_STATUS.COMPLETED, pledgedAt: iso(-3) },
  { id: "p4", campaignId: "c2", backerId: "u-b1", amount: 10000, rewardSelection: "Mentor", status: PLEDGE_STATUS.COMPLETED, pledgedAt: iso(-20) },
  { id: "p5", campaignId: "c2", backerId: "u-b3", amount: 1000, rewardSelection: "Friend", status: PLEDGE_STATUS.COMPLETED, pledgedAt: iso(-17) },
  { id: "p6", campaignId: "c3", backerId: "u-b2", amount: 7000, status: PLEDGE_STATUS.PENDING, pledgedAt: iso(-1) },
  { id: "p7", campaignId: "c3", backerId: "u-b1", amount: 15000, status: PLEDGE_STATUS.COMPLETED, pledgedAt: iso(-2) },
  { id: "p8", campaignId: "c4", backerId: "u-b3", amount: 2000, status: PLEDGE_STATUS.COMPLETED, pledgedAt: iso(-2) },
  { id: "p9", campaignId: "c4", backerId: "u-b2", amount: 1500, status: PLEDGE_STATUS.CANCELLED, pledgedAt: iso(-6), cancelledAt: iso(-1) },
  { id: "p10", campaignId: "c5", backerId: "u-b1", amount: 3000, status: PLEDGE_STATUS.REFUNDED, pledgedAt: iso(-12) },
];

export const escrow = [
  { campaignId: "c1", totalAmount: 1180000, releasedAmount: 0, remainingAmount: 1180000, status: ESCROW_STATUS.HOLDING },
  { campaignId: "c2", totalAmount: 820000, releasedAmount: 450000, remainingAmount: 370000, status: ESCROW_STATUS.RELEASING },
  { campaignId: "c3", totalAmount: 540000, releasedAmount: 0, remainingAmount: 540000, status: ESCROW_STATUS.HOLDING },
  { campaignId: "c4", totalAmount: 380000, releasedAmount: 0, remainingAmount: 380000, status: ESCROW_STATUS.HOLDING },
];

export const transactions = [
  { id: "t1", campaignId: "c2", milestoneId: "m1", amount: 250000, transactionType: TX_TYPE.MILESTONE_RELEASE, transactionStatus: "SUCCESS", createdAt: iso(-15) },
  { id: "t2", campaignId: "c2", milestoneId: "m2", amount: 200000, transactionType: TX_TYPE.MILESTONE_RELEASE, transactionStatus: "SUCCESS", createdAt: iso(-8) },
  { id: "t3", campaignId: "c1", amount: 25000, transactionType: TX_TYPE.PLEDGE_CAPTURE, transactionStatus: "SUCCESS", createdAt: iso(-5) },
];

export const activity = [
  { id: "a1", campaignId: "c5", action: "SUBMITTED_FOR_APPROVAL", performedById: "u-c1", oldStatus: CAMPAIGN_STATUS.DRAFT, newStatus: CAMPAIGN_STATUS.PENDING_APPROVAL, remarks: "Waiting for admin review", createdAt: iso(-1) },
  { id: "a2", campaignId: "c2", action: "MILESTONE_RELEASED", performedById: "u-admin", remarks: "Funds released for Distribution Phase 1", createdAt: iso(-8) },
  { id: "a3", campaignId: "c3", action: "MILESTONE_REJECTED", performedById: "u-v1", remarks: "Need detailed attendance logs", createdAt: iso(-1) },
];
