import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { campaignService, milestoneService } from '../services/api';
import { getPledgesAPI, getTransactionsAPI } from '../api/services';

const formatINRCompact = (value = 0) => {
  const amount = Number(value) || 0;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

const formatINR = (value = 0) => `₹${(Number(value) || 0).toLocaleString('en-IN')}`;

const firstName = (user) => {
  const name = user?.name || user?.email || 'User';
  return String(name).split(' ')[0];
};

const StatCard = ({ label, value, primary = false }) => (
  <div className={`rounded-3xl border px-6 py-5 ${primary ? 'bg-primary-gradient border-transparent' : 'bg-card border-border/50'}`}>
    <p className="text-3xl font-extrabold text-foreground">{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{label}</p>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? 'BACKER';

  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [allMilestones, setAllMilestones] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const campaignRes = await campaignService.getAll();
      const campaignList = Array.isArray(campaignRes?.data?.data) ? campaignRes.data.data : [];
      setCampaigns(campaignList);

      if (role === 'BACKER' || role === 'ADMIN') {
        const pledgeRes = await getPledgesAPI();
        setPledges(Array.isArray(pledgeRes?.data?.data) ? pledgeRes.data.data : []);
      } else {
        setPledges([]);
      }

      if (role === 'ADMIN' || role === 'VERIFIER' || role === 'CAMPAIGNER') {
        const milestoneResponses = await Promise.all(
          campaignList.map((campaign) =>
            milestoneService
              .getByCampaign(campaign.id)
              .then((res) => (Array.isArray(res?.data?.data) ? res.data.data : []))
              .catch(() => [])
          )
        );
        const milestonesFlat = milestoneResponses.flat();
        setAllMilestones(milestonesFlat);
      } else {
        setAllMilestones([]);
      }

      if (role === 'ADMIN') {
        const transactionResponses = await Promise.all(
          campaignList.map((campaign) =>
            getTransactionsAPI(campaign.id)
              .then((res) => (Array.isArray(res?.data?.data) ? res.data.data : []))
              .catch(() => [])
          )
        );
        setTransactions(transactionResponses.flat());
      } else {
        setTransactions([]);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const campaignsById = useMemo(
    () => Object.fromEntries(campaigns.map((campaign) => [String(campaign.id), campaign])),
    [campaigns]
  );

  const myCampaigns = useMemo(
    () => campaigns.filter((campaign) => String(campaign.campaignerId) === String(user?.id)),
    [campaigns, user?.id]
  );
  const myPledges = useMemo(
    () => pledges.filter((pledge) => String(pledge.backerId) === String(user?.id) || !pledge.backerId),
    [pledges, user?.id]
  );

  const pendingApprovals = useMemo(
    () => campaigns.filter((campaign) => campaign.status === 'PENDING_APPROVAL'),
    [campaigns]
  );
  const pendingVerification = useMemo(
    () => allMilestones.filter((milestone) => milestone.status === 'SUBMITTED'),
    [allMilestones]
  );
  const recentlyReleased = useMemo(
    () => allMilestones.filter((milestone) => milestone.status === 'RELEASED').slice(0, 6),
    [allMilestones]
  );

  const handleApprove = async (id) => {
    try {
      await campaignService.approve(id);
      toast.success('Campaign approved');
      loadDashboard();
    } catch {
      toast.error('Failed to approve campaign');
    }
  };

  const handleReject = async (id) => {
    try {
      await campaignService.cancel(id);
      toast.success('Campaign rejected');
      loadDashboard();
    } catch {
      toast.error('Failed to reject campaign');
    }
  };

  const handleVerify = async (id) => {
    try {
      await milestoneService.verify(id);
      toast.success('Milestone verified');
      loadDashboard();
    } catch {
      toast.error('Failed to verify milestone');
    }
  };

  const handleRejectMilestone = async (id) => {
    const reason = window.prompt('Enter rejection reason');
    if (!reason || !reason.trim()) {
      toast.error('Reason is required');
      return;
    }
    try {
      await milestoneService.reject(id, { reason: reason.trim() });
      toast.success('Milestone rejected');
      loadDashboard();
    } catch {
      toast.error('Failed to reject milestone');
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-border/40 bg-card p-6">Loading dashboard...</div>;
  }

  if (role === 'ADMIN') {
    const totalEscrow = campaigns.reduce((sum, campaign) => sum + Number(campaign.totalPledged || 0), 0);
    const released = transactions.reduce((sum, tx) => sum + Number(tx.amountReleased ?? tx.amount ?? 0), 0);
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs text-muted-foreground">Admin console</p>
          <h1 className="text-5xl font-extrabold tracking-tight">Platform oversight</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total raised in escrow" value={formatINRCompact(totalEscrow)} />
          <StatCard label="Funds released" value={formatINRCompact(released)} primary />
          <StatCard label="Active campaigns" value={campaigns.filter((c) => c.status === 'ACTIVE').length} />
          <StatCard label="Total users" value={new Set(campaigns.map((c) => c.campaignerId)).size} />
        </div>

        <section className="rounded-3xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 text-3xl font-bold">Pending approvals ({pendingApprovals.length})</h2>
          {pendingApprovals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns awaiting approval.</p>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((campaign) => (
                <div key={campaign.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3">
                  <div>
                    <p className="font-semibold">{campaign.title}</p>
                    <p className="text-xs text-muted-foreground">{campaign.category || 'General'} · Goal {formatINRCompact(campaign.fundingGoal)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full border border-border px-4 py-2 text-sm" onClick={() => navigate(`/campaigns/${campaign.id}`)}>Review</button>
                    <button className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600" onClick={() => handleReject(campaign.id)}>Reject</button>
                    <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-foreground" onClick={() => handleApprove(campaign.id)}>Approve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 text-3xl font-bold">All campaigns</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Campaign</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Goal</th>
                  <th className="px-3 py-2">Funded</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-t border-border/40">
                    <td className="px-3 py-3">{campaign.title}</td>
                    <td className="px-3 py-3">{campaign.status}</td>
                    <td className="px-3 py-3">{formatINRCompact(campaign.fundingGoal)}</td>
                    <td className="px-3 py-3">{formatINRCompact(campaign.totalPledged)}</td>
                    <td className="px-3 py-3">
                      <button className="text-red-600" onClick={() => handleReject(campaign.id)}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  if (role === 'VERIFIER') {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs text-muted-foreground">Verifier console</p>
          <h1 className="text-5xl font-extrabold tracking-tight">Milestones awaiting your sign-off</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Pending verification" value={pendingVerification.length} />
          <StatCard label="Verified - ready to release" value={allMilestones.filter((m) => m.status === 'VERIFIED').length} primary />
          <StatCard label="Released this period" value={recentlyReleased.length} />
        </div>

        <section className="rounded-3xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 text-3xl font-bold">Pending verification</h2>
          {pendingVerification.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones awaiting verification.</p>
          ) : (
            <div className="space-y-3">
              {pendingVerification.map((milestone) => (
                <div key={milestone.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3">
                  <div>
                    <p className="font-semibold">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground">{campaignsById[String(milestone.campaignId)]?.title || 'Campaign'} · {formatINR(milestone.amountToRelease)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full border border-border px-4 py-2 text-sm" onClick={() => navigate(`/milestones/${milestone.campaignId}`)}>View</button>
                    <button className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600" onClick={() => handleRejectMilestone(milestone.id)}>Reject</button>
                    <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-foreground" onClick={() => handleVerify(milestone.id)}>Verify</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 text-3xl font-bold">Recently released</h2>
          <div className="space-y-2">
            {recentlyReleased.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing released yet.</p>
            ) : (
              recentlyReleased.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3">
                  <div>
                    <p className="font-semibold">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground">{campaignsById[String(milestone.campaignId)]?.title || 'Campaign'}</p>
                  </div>
                  <p className="font-semibold">{formatINR(milestone.amountToRelease)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    );
  }

  if (role === 'CAMPAIGNER') {
    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Campaign studio</p>
            <h1 className="text-5xl font-extrabold tracking-tight">Welcome back, {firstName(user)}</h1>
          </div>
          <Link to="/create-campaign" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-foreground">
            New campaign
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total raised" value={formatINRCompact(myCampaigns.reduce((sum, c) => sum + Number(c.totalPledged || 0), 0))} />
          <StatCard label="Active campaigns" value={myCampaigns.filter((c) => c.status === 'ACTIVE').length} primary />
          <StatCard label="Draft campaigns" value={myCampaigns.filter((c) => c.status === 'DRAFT').length} />
        </div>
        <section className="space-y-3">
          {myCampaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-3xl border border-border/60 bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold">{campaign.title}</p>
                  <p className="text-sm text-muted-foreground">{campaign.category || 'General'} · {campaign.status}</p>
                </div>
                <Link to={`/campaigns/${campaign.id}`} className="rounded-full border border-border px-4 py-2 text-sm">View</Link>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary-gradient"
                  style={{ width: `${Math.min((Number(campaign.totalPledged || 0) / Math.max(Number(campaign.fundingGoal || 1), 1)) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatINR(campaign.totalPledged)} / {formatINR(campaign.fundingGoal)}
              </p>
            </div>
          ))}
          {myCampaigns.length === 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-5 text-sm text-muted-foreground">No campaigns yet.</div>
          )}
        </section>
      </div>
    );
  }

  const completedPledges = myPledges.filter((pledge) => pledge.status === 'COMPLETED');
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Backer wallet</p>
          <h1 className="text-5xl font-extrabold tracking-tight">Hi, {firstName(user)}</h1>
          <p className="text-muted-foreground">Track every pledge, watch every milestone.</p>
        </div>
        <Link to="/campaigns" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-foreground">
          Discover campaigns
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total pledged" value={formatINRCompact(completedPledges.reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0))} primary />
        <StatCard label="Campaigns backed" value={new Set(completedPledges.map((pledge) => pledge.campaignId)).size} />
        <StatCard label="Active pledges" value={completedPledges.length} />
      </div>

      <section>
        <h2 className="mb-3 text-4xl font-extrabold">Your pledges</h2>
        <div className="space-y-3">
          {myPledges.map((pledge) => {
            const campaign = campaignsById[String(pledge.campaignId)];
            return (
              <div key={pledge.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card px-4 py-3">
                <div>
                  <p className="font-semibold">{pledge.campaignName || campaign?.title || 'Campaign'}</p>
                  <p className="text-xs text-muted-foreground">{pledge.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{formatINR(pledge.amount)}</p>
                  <button className="rounded-full border border-border px-4 py-2 text-sm" onClick={() => navigate(`/campaigns/${pledge.campaignId}`)}>View</button>
                </div>
              </div>
            );
          })}
          {myPledges.length === 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-5 text-sm text-muted-foreground">No pledges yet.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
