import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { campaignService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Target, Users, ArrowLeft, Send, CircleCheck, CircleX, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const CampaignDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await campaignService.getById(id);
      setCampaign(response.data);
    } catch (error) {
      toast.error('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      if (action === 'submit') await campaignService.submit(id);
      if (action === 'approve') await campaignService.approve(id);
      if (action === 'cancel') await campaignService.cancel(id);
      
      toast.success(`Campaign ${action}ed successfully`);
      fetchCampaign();
    } catch (error) {
      toast.error(`Error performing ${action}`);
    }
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (!campaign) return <div className="error-container">Campaign not found</div>;

  const progress = Math.min((campaign.totalPledged / campaign.fundingGoal) * 100, 100);

  return (
    <div className="detail-page-container">
      <div className="back-nav">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> Back to Campaigns
        </button>
      </div>

      <div className="detail-grid">
        <div className="main-info">
          <div className="campaign-badge-row">
            <span className={`status-pill ${campaign.status.toLowerCase()}`}>
              {campaign.status}
            </span>
            <span className="campaign-id">ID: #{campaign.id}</span>
          </div>
          
          <h1>{campaign.title}</h1>
          <p className="description">{campaign.description}</p>

          <div className="detail-actions">
            {user.role === 'CAMPAIGNER' && campaign.status === 'DRAFT' && (
              <button 
                onClick={() => handleAction('submit')}
                className="btn btn-primary btn-lg"
              >
                <Send size={18} /> Submit for Approval
              </button>
            )}

            {user.role === 'ADMIN' && campaign.status === 'PENDING_APPROVAL' && (
              <div className="admin-btn-group">
                <button 
                  onClick={() => handleAction('approve')}
                  className="btn btn-success btn-lg"
                >
                  <CircleCheck size={18} /> Approve Campaign
                </button>
                <button 
                  onClick={() => handleAction('cancel')}
                  className="btn btn-danger btn-lg"
                >
                  <CircleX size={18} /> Reject/Cancel
                </button>
              </div>
            )}
          </div>

          <div className="links-section">
            <Link to={`/campaigns/${id}/milestones`} className="link-card">
              <div className="link-icon"><Target /></div>
              <div className="link-text">
                <h3>View Milestones</h3>
                <p>Track project progress and fund releases</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="sidebar-info">
          <div className="funding-card">
            <h2>Funding Progress</h2>
            <div className="raised-amount">
              <span>Raised</span>
              <strong>₹{campaign.totalPledged?.toLocaleString()}</strong>
            </div>
            <div className="progress-bar-large">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="goal-amount">
              Goal: ₹{campaign.fundingGoal?.toLocaleString()}
              <span>{Math.round(progress)}%</span>
            </div>

            <div className="countdown">
              <Calendar size={18} />
              <span>Ends on {new Date(campaign.endDate).toLocaleDateString()}</span>
            </div>

            {user.role === 'BACKER' && campaign.status === 'ACTIVE' && (
              <button className="btn btn-primary btn-block btn-lg mt-4">
                Pledge to this Campaign
              </button>
            )}
          </div>

          <div className="info-list">
            <div className="info-item">
              <Info size={16} />
              <div>
                <strong>Creator ID</strong>
                <span>{campaign.campaignerId}</span>
              </div>
            </div>
            <div className="info-item">
              <Users size={16} />
              <div>
                <strong>Created On</strong>
                <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
