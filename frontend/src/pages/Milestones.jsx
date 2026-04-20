import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { milestoneService, campaignService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CircleCheck, Clock, CircleAlert, ShieldCheck, CircleX, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Milestones = () => {
  const { campaignId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [campaignId]);

  const fetchData = async () => {
    try {
      const [milestoneRes, campaignRes] = await Promise.all([
        milestoneService.getByCampaign(campaignId),
        campaignService.getById(campaignId)
      ]);
      setMilestones(milestoneRes.data);
      setCampaign(campaignRes.data);
    } catch (error) {
      toast.error('Failed to load milestone data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'submit') await milestoneService.submit(id);
      if (action === 'verify') await milestoneService.verify(id);
      if (action === 'reject') await milestoneService.reject(id);
      if (action === 'release') {
         // Assuming ADMIN action for release funds maps to a campaign/milestone logic
         // For now using placeholder logic as per req
         toast.success('Funds released successfully!');
         fetchData();
         return;
      }
      
      toast.success(`Milestone ${action}ed successfully`);
      fetchData();
    } catch (error) {
      toast.error(`Error performing ${action}`);
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

      <div className="milestone-timeline">
        {milestones.length > 0 ? (
          milestones.map((milestone, index) => (
            <div key={milestone.id} className={`milestone-item ${milestone.status.toLowerCase()}`}>
              <div className="milestone-number">{index + 1}</div>
              <div className="milestone-card">
                <div className="milestone-main">
                  <div className="milestone-status-header">
                    <div className="status-label">
                      {getStatusIcon(milestone.status)}
                      <span>{milestone.status}</span>
                    </div>
                    <div className="milestone-amount">₹{milestone.targetAmount?.toLocaleString()}</div>
                  </div>
                  
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>

                <div className="milestone-actions">
                  {user.role === 'CAMPAIGNER' && milestone.status === 'ACTIVE' && (
                    <button 
                      onClick={() => handleAction(milestone.id, 'submit')}
                      className="btn btn-primary btn-sm"
                    >
                      Submit for Verification
                    </button>
                  )}

                  {user.role === 'VERIFIER' && milestone.status === 'SUBMITTED' && (
                    <div className="btn-group">
                      <button 
                        onClick={() => handleAction(milestone.id, 'verify')}
                        className="btn btn-success btn-sm"
                      >
                        Verify
                      </button>
                      <button 
                        onClick={() => handleAction(milestone.id, 'reject')}
                        className="btn btn-danger btn-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {user.role === 'ADMIN' && milestone.status === 'VERIFIED' && (
                    <button 
                      onClick={() => handleAction(milestone.id, 'release')}
                      className="btn btn-info btn-sm"
                    >
                      <DollarSign size={14} /> Release Funds
                    </button>
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
