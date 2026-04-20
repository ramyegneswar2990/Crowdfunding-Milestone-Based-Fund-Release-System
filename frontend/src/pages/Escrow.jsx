import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import RoleRoute from '../components/RoleRoute';
import {
  getCampaignsAPI,
  getEscrowAPI,
  releaseFundsAPI,
} from '../api/services';
import './Pages.css';
import './FeaturePages.css';

const Escrow = () => {
  const { campaignId: paramId } = useParams();

  const [campaigns, setCampaigns]           = useState([]);
  const [campaignId, setCampaignId]         = useState(paramId ?? '');
  const [escrow, setEscrow]                 = useState(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingEscrow, setLoadingEscrow]   = useState(false);
  const [confirmModal, setConfirmModal]     = useState(null); // { milestoneId, name, amount }
  const [releasing, setReleasing]           = useState(false);

  /* ── Load campaign list once ── */
  useEffect(() => {
    getCampaignsAPI()
      .then(({ data }) => setCampaigns(data))
      .catch(() => toast.error('Failed to load campaigns'))
      .finally(() => setLoadingCampaigns(false));
  }, []);

  /* ── Load escrow data when campaignId changes ── */
  const loadEscrow = useCallback(async (id) => {
    if (!id) return;
    setLoadingEscrow(true);
    setEscrow(null);
    try {
      const { data } = await getEscrowAPI(id);
      setEscrow(data);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to load escrow data');
    } finally {
      setLoadingEscrow(false);
    }
  }, []);

  useEffect(() => {
    if (campaignId) loadEscrow(campaignId);
  }, [campaignId, loadEscrow]);

  const handleCampaignChange = (e) => setCampaignId(e.target.value);

  /* ── Release funds ── */
  const handleRelease = async () => {
    if (!confirmModal) return;
    setReleasing(true);
    try {
      await releaseFundsAPI(confirmModal.milestoneId);
      toast.success(`₹${Number(confirmModal.amount).toLocaleString('en-IN')} released for "${confirmModal.name}"`);
      setConfirmModal(null);
      loadEscrow(campaignId);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to release funds');
    } finally {
      setReleasing(false);
    }
  };

  const totalHeld     = Number(escrow?.totalHeld ?? 0);
  const totalReleased = Number(escrow?.totalReleased ?? 0);
  const currentBal    = Number(escrow?.currentBalance ?? 0);
  const pct = totalHeld > 0 ? Math.min(100, Math.round((totalReleased / totalHeld) * 100)) : 0;
  const verifiedMilestones = (escrow?.milestones ?? []).filter((m) => m.status === 'VERIFIED');

  return (
    <RoleRoute roles={['ADMIN']}>
      <div className="page">

        <div className="page-header">
          <div>
            <h1 className="page-title">Escrow Management</h1>
            <p className="page-sub">Monitor held funds and release payments upon milestone verification.</p>
          </div>
        </div>

        {/* Campaign Selector */}
        <div className="fp-selector-row">
          <label htmlFor="escrow-campaign-select">Select Campaign</label>
          <select
            id="escrow-campaign-select"
            value={campaignId}
            onChange={handleCampaignChange}
            disabled={loadingCampaigns}
          >
            <option value="">— Choose a campaign —</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title ?? c.name}</option>
            ))}
          </select>
        </div>

        {loadingEscrow && <div className="fp-loading">Loading escrow data…</div>}

        {escrow && !loadingEscrow && (
          <>
            {/* Metric cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">🔐</span>
                <div className="stat-body">
                  <span className="stat-value">₹{totalHeld.toLocaleString('en-IN')}</span>
                  <span className="stat-label">Total Held</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✅</span>
                <div className="stat-body">
                  <span className="stat-value">₹{totalReleased.toLocaleString('en-IN')}</span>
                  <span className="stat-label">Total Released</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💰</span>
                <div className="stat-body">
                  <span className="stat-value">₹{currentBal.toLocaleString('en-IN')}</span>
                  <span className="stat-label">Current Balance</span>
                </div>
              </div>
            </div>

            {/* Release progress bar */}
            <div className="fp-progress-wrap">
              <div className="fp-progress-label">
                <span>Funds Released</span>
                <span className="fp-progress-pct">{pct}%</span>
              </div>
              <div className="fp-progress-track">
                <div
                  className="fp-progress-fill"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            {/* Verified milestones table */}
            <p className="fp-section-title">Verified Milestones</p>
            {verifiedMilestones.length === 0 ? (
              <div className="fp-empty">No verified milestones found for this campaign.</div>
            ) : (
              <div className="fp-table-wrapper">
                <table className="fp-table">
                  <thead>
                    <tr>
                      <th>Milestone</th>
                      <th>Target Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifiedMilestones.map((m) => {
                      const canRelease = currentBal >= Number(m.targetAmount ?? 0);
                      return (
                        <tr key={m.id}>
                          <td>{m.name ?? m.title}</td>
                          <td>₹{Number(m.targetAmount ?? 0).toLocaleString('en-IN')}</td>
                          <td><span className="badge badge-green">VERIFIED</span></td>
                          <td>
                            <button
                              id={`release-btn-${m.id}`}
                              className="fp-btn fp-btn-primary fp-btn-sm"
                              disabled={!canRelease}
                              title={!canRelease ? 'Insufficient escrow balance' : `Release ₹${Number(m.targetAmount).toLocaleString('en-IN')}`}
                              onClick={() => setConfirmModal({
                                milestoneId: m.id,
                                name: m.name ?? m.title,
                                amount: m.targetAmount ?? 0,
                              })}
                            >
                              Release Funds
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {!campaignId && !loadingEscrow && (
          <div className="fp-empty">Select a campaign above to view its escrow details.</div>
        )}
      </div>

      {/* Confirm release modal */}
      {confirmModal && (
        <div className="fp-modal-overlay" onClick={() => !releasing && setConfirmModal(null)}>
          <div className="fp-modal fp-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="fp-modal-header">
              <h3>Confirm Fund Release</h3>
            </div>
            <div className="fp-modal-body">
              <p className="fp-confirm-text">
                Release{' '}
                <strong className="fp-confirm-amount">
                  ₹{Number(confirmModal.amount).toLocaleString('en-IN')}
                </strong>{' '}
                for milestone{' '}
                <strong>"{confirmModal.name}"</strong>?
              </p>
              <p className="fp-confirm-sub">This action cannot be undone.</p>
            </div>
            <div className="fp-modal-footer">
              <button
                className="fp-btn fp-btn-ghost"
                onClick={() => setConfirmModal(null)}
                disabled={releasing}
              >
                Cancel
              </button>
              <button
                id="confirm-release-btn"
                className="fp-btn fp-btn-primary"
                onClick={handleRelease}
                disabled={releasing}
              >
                {releasing ? <span className="fp-spinner" /> : 'Yes, Release'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleRoute>
  );
};

export default Escrow;
