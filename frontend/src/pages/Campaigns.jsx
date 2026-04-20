import React, { useEffect, useState } from 'react';
import { campaignService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Plus, Eye, Check, X, Send, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Campaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchCampaigns();
  }, [user.role, filter]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      let response;
      if (user.role === 'ADMIN') {
        response = await campaignService.getAll();
      } else if (user.role === 'BACKER') {
        response = await campaignService.getActive();
      } else if (user.role === 'CAMPAIGNER') {
        response = await campaignService.getByCampaigner(user.id);
      } else {
        response = await campaignService.getAll(); // Fallback
      }
      
      let filteredData = response.data;
      if (filter !== 'ALL') {
        filteredData = filteredData.filter(c => c.status === filter);
      }
      setCampaigns(filteredData);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'submit') await campaignService.submit(id);
      if (action === 'approve') await campaignService.approve(id);
      if (action === 'cancel') await campaignService.cancel(id);
      
      toast.success(`Campaign ${action}ed successfully`);
      fetchCampaigns();
    } catch (error) {
      toast.error(`Failed to ${action} campaign`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'FUNDED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-teal-100 text-teal-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-title">
          <h1>Browse Campaigns</h1>
          <p>Discover and manage milestone-based crowdfunding projects</p>
        </div>
        {user.role === 'CAMPAIGNER' && (
          <Link to="/campaigns/create" className="btn btn-primary">
            <Plus className="btn-icon" /> Create New
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search className="search-icon" />
          <input type="text" placeholder="Search campaigns..." />
        </div>
        <div className="filter-options">
          <Filter className="filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="FUNDED">Funded</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="campaign-grid">
        {loading ? (
          <div className="loading-state">Loading Campaigns...</div>
        ) : campaigns.length > 0 ? (
          campaigns.map(campaign => (
            <div key={campaign.id} className="campaign-card">
              <div className="card-image-placeholder">
                <Rocket size={48} className="placeholder-icon" />
                <span className={`status-badge ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <div className="card-content">
                <h3>{campaign.title}</h3>
                <p className="card-description">{campaign.description}</p>
                
                <div className="card-stats">
                  <div className="stat-item">
                    <span>Goal</span>
                    <strong>₹{campaign.fundingGoal?.toLocaleString()}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Raised</span>
                    <strong>₹{campaign.totalPledged?.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${Math.min((campaign.totalPledged / campaign.fundingGoal) * 100, 100)}%` }}
                  ></div>
                </div>

                <div className="card-actions">
                  <Link to={`/campaigns/${campaign.id}`} className="btn btn-outline btn-sm">
                    <Eye className="btn-icon-sm" /> View
                  </Link>

                  {user.role === 'CAMPAIGNER' && campaign.status === 'DRAFT' && (
                    <button onClick={() => handleAction(campaign.id, 'submit')} className="btn btn-primary btn-sm">
                      <Send className="btn-icon-sm" /> Submit
                    </button>
                  )}

                  {user.role === 'ADMIN' && campaign.status === 'PENDING_APPROVAL' && (
                    <div className="admin-actions">
                      <button onClick={() => handleAction(campaign.id, 'approve')} className="btn btn-success btn-sm">
                        <Check className="btn-icon-sm" /> Approve
                      </button>
                      <button onClick={() => handleAction(campaign.id, 'cancel')} className="btn btn-danger btn-sm">
                        <X className="btn-icon-sm" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Rocket size={64} />
            <h2>No campaigns found</h2>
            <p>Try adjusting your filters or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
