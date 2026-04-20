import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { campaignService } from '../services/api';
import { LayoutDashboard, Rocket, Heart, CircleCheck, Clock, CircleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user.role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let response;
      switch (user.role) {
        case 'ADMIN':
          response = await campaignService.getAll();
          // Assuming the backend returns the full list, we calculate stats here for demo
          // In a real app, there'd be a specific stats endpoint
          const campaigns = response.data;
          setData({
            totalCampaigns: campaigns.length,
            pendingApprovals: campaigns.filter(c => c.status === 'PENDING_APPROVAL').length,
            totalPledges: campaigns.reduce((acc, c) => acc + (c.totalPledged || 0), 0)
          });
          break;
        case 'CAMPAIGNER':
          response = await campaignService.getByCampaigner(user.id);
          setData(response.data);
          break;
        case 'BACKER':
          response = await campaignService.getActive();
          setData(response.data);
          break;
        case 'VERIFIER':
          // Verifier view usually shows milestones
          // For now, let's just fetch active campaigns to show something
          response = await campaignService.getActive();
          setData(response.data);
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'badge-secondary';
      case 'PENDING_APPROVAL': return 'badge-warning';
      case 'ACTIVE': return 'badge-success';
      case 'FUNDED': return 'badge-info';
      case 'COMPLETED': return 'badge-primary';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading) return <div className="dashboard-loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-info">
          <LayoutDashboard className="header-icon" />
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user.username}. You are logged in as {user.role}.</p>
          </div>
        </div>
        {user.role === 'CAMPAIGNER' && (
          <Link to="/campaigns/create" className="btn btn-primary">
            <Rocket className="btn-icon" /> Create Campaign
          </Link>
        )}
      </header>

      {user.role === 'ADMIN' && data && (
        <div className="stats-grid">
          <div className="stat-card">
            <Rocket className="stat-icon text-primary" />
            <div className="stat-info">
              <h3>{data.totalCampaigns}</h3>
              <p>Total Campaigns</p>
            </div>
          </div>
          <div className="stat-card">
            <Clock className="stat-icon text-warning" />
            <div className="stat-info">
              <h3>{data.pendingApprovals}</h3>
              <p>Pending Approvals</p>
            </div>
          </div>
          <div className="stat-card">
            <Heart className="stat-icon text-danger" />
            <div className="stat-info">
              <h3>₹{data.totalPledges.toLocaleString()}</h3>
              <p>Total Funds Raised</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="content-card">
          <div className="card-header">
            <h2>{user.role === 'CAMPAIGNER' ? 'My Campaigns' : 'Recent Activity'}</h2>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Goal</th>
                  <th>Pledged</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.length > 0 ? (
                  data.map(campaign => (
                    <tr key={campaign.id}>
                      <td>
                        <div className="campaign-info-cell">
                          <strong>{campaign.title}</strong>
                          <span>Ends {new Date(campaign.endDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>₹{campaign.fundingGoal?.toLocaleString()}</td>
                      <td>₹{campaign.totalPledged?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/campaigns/${campaign.id}`} className="btn-link">View Details</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No campaigns found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
