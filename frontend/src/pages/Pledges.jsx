import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import RoleRoute from '../components/RoleRoute';
import { useLocation } from 'react-router-dom';
import {
  getActiveCampaignsAPI,
  createPledgeAPI,
  getPledgesAPI,
  cancelPledgeAPI,
} from '../api/services';
import './FeaturePages.css';

const STATUS_CLASS = {
  COMPLETED: 'badge-green',
  CANCELLED: 'badge-red',
  ACTIVE:    'badge-blue',
  PENDING:   'badge-yellow',
};

const isCampaignLive = (endDate) =>
  !endDate || new Date(endDate) > new Date();

const Pledges = () => {
  // ── Pre-selected campaign passed from CampaignDetail → "Pledge" button ──
  const location          = useLocation();
  const defaultCampaignId = location.state?.campaignId ?? null;
  const autoOpened        = useRef(false);  // guard — open modal only once on mount

  const [campaigns, setCampaigns]     = useState([]);
  const [pledges, setPledges]         = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  // Modal
  const [modalOpen, setModalOpen]               = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [amount, setAmount]                     = useState('');
  const [amountError, setAmountError]           = useState('');
  const [submitting, setSubmitting]             = useState(false);

  const fetchCampaigns = useCallback(async () => {
    const { data } = await getActiveCampaignsAPI();
    setCampaigns(data);
  }, []);

  const fetchPledges = useCallback(async () => {
    const { data } = await getPledgesAPI();
    setPledges(data);
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingInit(true);
      try {
        await Promise.all([fetchCampaigns(), fetchPledges()]);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoadingInit(false);
      }
    })();
  }, [fetchCampaigns, fetchPledges]);

  // ── Auto-open pledge modal when arriving from CampaignDetail ─────────────
  useEffect(() => {
    if (!defaultCampaignId || campaigns.length === 0 || autoOpened.current) return;
    const target = campaigns.find((c) => c.id === Number(defaultCampaignId));
    if (target) {
      autoOpened.current = true;
      openModal(target);
    }
  // openModal is a stable closure — intentionally excluded from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns, defaultCampaignId]);

  /* ── Modal helpers ── */
  const openModal = (campaign) => {
    setSelectedCampaign(campaign);
    setAmount('');
    setAmountError('');
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setSelectedCampaign(null); };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    setAmountError(Number(val) < 500 ? 'Minimum pledge amount is ₹500' : '');
  };

  const handlePledge = async (e) => {
    e.preventDefault();
    if (Number(amount) < 500) { setAmountError('Minimum pledge amount is ₹500'); return; }
    setSubmitting(true);
    try {
      await createPledgeAPI({ campaignId: selectedCampaign.id, amount: Number(amount) });
      toast.success('Pledge successful!');
      closeModal();
      fetchPledges();
    } catch (err) {
      if (err?.response?.status === 403) {
        toast.error('You cannot pledge to your own campaign');
      } else {
        toast.error(err?.response?.data?.message ?? 'Failed to create pledge');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (pledgeId) => {
    try {
      await cancelPledgeAPI(pledgeId);
      toast.success('Pledge cancelled successfully');
      fetchPledges();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to cancel pledge');
    }
  };

  if (loadingInit) return <div className="fp-loading-full">Loading…</div>;

  return (
    <RoleRoute roles={['BACKER']}>
      <div className="page">

        {/* ── Section A: Active Campaigns ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Active Campaigns</h1>
            <p className="page-sub">Browse campaigns and make your contribution count.</p>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="fp-empty">No active campaigns at the moment. Check back soon!</div>
        ) : (
          <div className="campaign-grid">
            {campaigns.map((c) => (
              <div key={c.id} className="campaign-card">
                <div className="campaign-card-header">
                  <h3 className="campaign-card-title">{c.title ?? c.name}</h3>
                  <span className="badge badge-green">ACTIVE</span>
                </div>
                {c.description && (
                  <p className="campaign-card-desc">{c.description}</p>
                )}
                <div className="campaign-card-meta">
                  <span>Goal: <strong>₹{Number(c.goalAmount ?? c.targetAmount ?? 0).toLocaleString('en-IN')}</strong></span>
                  {c.endDate && (
                    <span>Ends: {new Date(c.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>
                <button
                  id={`pledge-btn-${c.id}`}
                  className="fp-btn fp-btn-primary"
                  onClick={() => openModal(c)}
                >
                  ♥ Pledge
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Section C: My Pledges ── */}
        <div className="fp-divider" />
        <div className="page-header">
          <div>
            <h2 className="page-title" style={{ fontSize: '1.35rem' }}>My Pledges</h2>
            <p className="page-sub">Track all your contributions below.</p>
          </div>
        </div>

        {pledges.length === 0 ? (
          <div className="fp-empty">You haven't pledged to any campaign yet.</div>
        ) : (
          <div className="fp-table-wrapper">
            <table className="fp-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pledges.map((p) => {
                  const endDate = p.campaign?.endDate ?? p.campaignEndDate;
                  const canCancel = p.status === 'COMPLETED' && isCampaignLive(endDate);
                  return (
                    <tr key={p.id}>
                      <td>{p.campaignName ?? p.campaign?.name ?? '—'}</td>
                      <td>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${STATUS_CLASS[p.status] ?? 'badge-gray'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {canCancel && (
                          <button
                            id={`cancel-pledge-${p.id}`}
                            className="fp-btn fp-btn-danger fp-btn-sm"
                            onClick={() => handleCancel(p.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section B: Pledge Modal ── */}
      {modalOpen && (
        <div className="fp-modal-overlay" onClick={closeModal}>
          <div className="fp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fp-modal-header">
              <h3>Pledge to "{selectedCampaign?.title ?? selectedCampaign?.name}"</h3>
              <button className="fp-modal-close" onClick={closeModal} aria-label="Close">✕</button>
            </div>
            <form className="fp-modal-body" onSubmit={handlePledge} noValidate>
              <div className="fp-field">
                <label htmlFor="pledge-amount">Amount (₹)</label>
                <input
                  id="pledge-amount"
                  type="number"
                  min={500}
                  step={1}
                  placeholder="Minimum ₹500"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                  autoFocus
                />
                {amountError && <span className="fp-field-error">{amountError}</span>}
              </div>
              <div className="fp-modal-footer">
                <button type="button" className="fp-btn fp-btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  id="confirm-pledge-btn"
                  type="submit"
                  className="fp-btn fp-btn-primary"
                  disabled={submitting || !!amountError || !amount}
                >
                  {submitting ? <span className="fp-spinner" /> : 'Confirm Pledge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RoleRoute>
  );
};

export default Pledges;
