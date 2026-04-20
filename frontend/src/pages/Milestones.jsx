import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { milestoneService, campaignService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CircleCheck, Clock, CircleAlert, ShieldCheck, CircleX } from 'lucide-react';
import toast from 'react-hot-toast';

const Milestones = () => {
  const { campaignId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [campaignOptions, setCampaignOptions] = useState([]);
  const [loadingCampaignOptions, setLoadingCampaignOptions] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    sequenceNumber: '',
    title: '',
    description: '',
    amountToRelease: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(true);
  const validCampaignId = campaignId && campaignId !== 'undefined' ? campaignId : null;

  useEffect(() => {
    if (!validCampaignId) {
      setMilestones([]);
      setCampaign(null);
      setLoading(false);
      return;
    }
    fetchData(validCampaignId);
  }, [validCampaignId]);

  useEffect(() => {
    if (validCampaignId) return;
    fetchCampaignOptions();
  }, [validCampaignId, user?.id, user?.role]);

  const fetchCampaignOptions = async () => {
    setLoadingCampaignOptions(true);
    try {
      const res = await campaignService.getAll();
      const all = Array.isArray(res?.data?.data) ? res.data.data : [];
      const options = user?.role === 'CAMPAIGNER'
        ? all.filter((c) => String(c.campaignerId) === String(user?.id))
        : all;
      setCampaignOptions(options);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setLoadingCampaignOptions(false);
    }
  };

  const fetchData = async (id) => {
    setLoading(true);
    try {
      const [milestoneRes, campaignRes] = await Promise.all([
        milestoneService.getByCampaign(id),
        campaignService.getById(id)
      ]);
      setMilestones(Array.isArray(milestoneRes?.data?.data) ? milestoneRes.data.data : []);
      setCampaign(campaignRes?.data?.data ?? null);
    } catch (error) {
      toast.error('Failed to load milestone data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, currentStatus) => {
    try {
      if ((action === 'verify' || action === 'reject') && currentStatus !== 'SUBMITTED') {
        toast.error(`Cannot ${action}. Milestone is ${currentStatus}, it must be SUBMITTED first.`);
        return;
      }
      if (action === 'submit') {
        const billReference = window.prompt('Enter 8-digit bill reference number');
        if (!billReference || !billReference.trim()) {
          toast.error('Bill reference is required to submit milestone');
          return;
        }
        const ref = billReference.trim();
        if (!/^\d{8}$/.test(ref)) {
          toast.error('Bill reference must be exactly 8 digits');
          return;
        }
        await milestoneService.submit(id, { billReference: ref });
      }
      if (action === 'verify') await milestoneService.verify(id);
      if (action === 'reject') {
        const reason = window.prompt('Enter rejection reason');
        if (!reason || !reason.trim()) {
          toast.error('Rejection reason is required');
          return;
        }
        await milestoneService.reject(id, { reason: reason.trim() });
      }
      if (action === 'verify') {
        toast.success('Milestone verified and transaction completed');
      } else {
        toast.success(`Milestone ${action}ed successfully`);
      }
      if (validCampaignId) fetchData(validCampaignId);
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const backendError = error?.response?.data?.errors?.[0];
      toast.error(backendError || backendMessage || `Error performing ${action}`);
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!validCampaignId) return;

    const payload = {
      campaignId: Number(validCampaignId),
      sequenceNumber: Number(createForm.sequenceNumber),
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      amountToRelease: Number(createForm.amountToRelease),
      dueDate: createForm.dueDate,
    };

    if (!payload.sequenceNumber || !payload.title || !payload.description || !payload.amountToRelease || !payload.dueDate) {
      toast.error('Please fill all milestone fields');
      return;
    }

    setCreating(true);
    try {
      await milestoneService.create(payload);
      toast.success('Milestone created successfully');
      setCreateForm({
        sequenceNumber: '',
        title: '',
        description: '',
        amountToRelease: '',
        dueDate: '',
      });
      fetchData(validCampaignId);
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const backendError = error?.response?.data?.errors?.[0];
      toast.error(backendError || backendMessage || 'Failed to create milestone');
    } finally {
      setCreating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'LOCKED': return <Clock className="text-gray-400" />;
      case 'ACTIVE': return <Clock className="text-blue-500" />;
      case 'SUBMITTED': return <Clock className="text-amber-500" />;
      case 'VERIFIED': return <ShieldCheck className="text-green-500" />;
      case 'RELEASED': return <CircleCheck className="text-teal-500" />;
      case 'REJECTED': return <CircleX className="text-red-500" />;
      default: return <CircleAlert className="text-gray-400" />;
    }
  };

  if (loading) return <div className="loading-container">Loading Milestones...</div>;
  if (!validCampaignId) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="header-nav">
            <button onClick={() => navigate(-1)} className="btn-back">
              <ArrowLeft size={16} /> Back
            </button>
            <h1>Milestones Tracking</h1>
            <p>Select a campaign to view milestones.</p>
          </div>
        </div>
        <div className="filters-bar">
          <div className="filter-options">
            <select
              defaultValue=""
              onChange={(e) => e.target.value && navigate(`/milestones/${e.target.value}`)}
              disabled={loadingCampaignOptions}
            >
              <option value="">— Choose a campaign —</option>
              {campaignOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!loadingCampaignOptions && campaignOptions.length === 0 && (
          <div className="empty-milestones">
            <p>No campaigns available to show milestones.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-nav">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={16} /> Back to Project
          </button>
          <h1>Milestones Tracking</h1>
          <p>Campaign: {campaign?.title}</p>
        </div>
      </div>

      {user.role === 'CAMPAIGNER' && (
        <form onSubmit={handleCreateMilestone} className="milestone-card" style={{ marginBottom: '1rem' }}>
          <h3>Create Milestone</h3>
          <div className="filters-bar" style={{ display: 'grid', gap: '0.75rem' }}>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Sequence number (1-10)"
              value={createForm.sequenceNumber}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, sequenceNumber: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Milestone title"
              value={createForm.title}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              rows={3}
              placeholder="Milestone description"
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Amount to release"
              value={createForm.amountToRelease}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, amountToRelease: e.target.value }))}
            />
            <input
              type="date"
              value={createForm.dueDate}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>
              {creating ? 'Creating...' : 'Create Milestone'}
            </button>
          </div>
        </form>
      )}

      <div className="milestone-timeline">
        {milestones.length > 0 ? (
          milestones.map((milestone, index) => (
            <div key={milestone.id} className={`milestone-item ${String(milestone.status ?? 'LOCKED').toLowerCase()}`}>
              <div className="milestone-number">{index + 1}</div>
              <div className="milestone-card">
                <div className="milestone-main">
                  <div className="milestone-status-header">
                    <div className="status-label">
                      {getStatusIcon(milestone.status)}
                      <span>{milestone.status}</span>
                    </div>
                    <div className="milestone-amount">₹{Number(milestone.amountToRelease ?? 0).toLocaleString('en-IN')}</div>
                  </div>
                  
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                  {milestone.billReference && <p><strong>Bill:</strong> {milestone.billReference}</p>}
                  <p>Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : '—'}</p>
                  {milestone.status === 'RELEASED' && (
                    <p><strong>Transaction:</strong> COMPLETED</p>
                  )}
                  {milestone.status === 'REJECTED' && milestone.rejectionReason && (
                    <p><strong>Reject reason:</strong> {milestone.rejectionReason}</p>
                  )}
                </div>

                <div className="milestone-actions">
                  {user.role === 'CAMPAIGNER' && milestone.status === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => handleAction(milestone.id, 'submit')}
                      className="btn btn-primary btn-sm"
                    >
                      Submit for Verification
                    </button>
                  )}

                  {user.role === 'VERIFIER' && (
                    <div className="btn-group" style={{ display: 'grid', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {milestone.status === 'SUBMITTED'
                          ? 'Ready for verifier decision'
                          : `Waiting for campaigner submission (current: ${milestone.status})`}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleAction(milestone.id, 'verify', milestone.status)}
                          className="btn btn-success btn-sm"
                          disabled={milestone.status !== 'SUBMITTED'}
                          title={milestone.status !== 'SUBMITTED' ? `Current status is ${milestone.status}` : 'Verify milestone'}
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(milestone.id, 'reject', milestone.status)}
                          className="btn btn-danger btn-sm"
                          disabled={milestone.status !== 'SUBMITTED'}
                          title={milestone.status !== 'SUBMITTED' ? `Current status is ${milestone.status}` : 'Reject milestone'}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-milestones">
            <Clock size={48} />
            <p>No milestones defined for this campaign.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Milestones;
