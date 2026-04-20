import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '../services/api';
import { Rocket, Target, Calendar, AlignLeft, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingGoal: 50000,
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!formData.description || formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
    
    if (formData.fundingGoal < 50000 || formData.fundingGoal > 5000000) {
      newErrors.fundingGoal = 'Funding goal must be between ₹50,000 and ₹50,00,000';
    }

    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7 || diffDays > 60) {
        newErrors.dates = 'Campaign duration must be between 7 and 60 days';
      }
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await campaignService.create(formData);
      toast.success('Campaign created successfully in DRAFT!');
      navigate(`/campaigns/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-card">
        <div className="form-header">
          <div className="form-icon-circle">
            <Rocket className="form-icon" />
          </div>
          <h1>Launch Your Project</h1>
          <p>Fill in the details below to create your crowdfunding campaign.</p>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-section">
            <div className="form-group">
              <label>Campaign Title</label>
              <div className="input-with-icon">
                <Target className="input-field-icon" />
                <input
                  type="text"
                  placeholder="e.g. Eco-Friendly Water Purification System"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={errors.title ? 'input-error' : ''}
                />
              </div>
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Description</label>
              <div className="textarea-with-icon">
                <AlignLeft className="input-field-icon" />
                <textarea
                  placeholder="Explain your project, goals and why people should fund it..."
                  rows="5"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={errors.description ? 'input-error' : ''}
                ></textarea>
              </div>
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Funding Goal (₹)</label>
              <div className="input-with-icon">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  value={formData.fundingGoal}
                  onChange={(e) => setFormData({...formData, fundingGoal: parseInt(e.target.value)})}
                  className={errors.fundingGoal ? 'input-error' : ''}
                />
              </div>
              {errors.fundingGoal && <span className="error-text">{errors.fundingGoal}</span>}
            </div>

            <div className="info-box flex-1">
              <Info size={16} />
              <p>Minimum: ₹50,000 | Maximum: ₹50,00,000</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <div className="input-with-icon">
                <Calendar className="input-field-icon" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className={errors.startDate ? 'input-error' : ''}
                />
              </div>
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label>End Date</label>
              <div className="input-with-icon">
                <Calendar className="input-field-icon" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className={errors.endDate ? 'input-error' : ''}
                />
              </div>
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          </div>
          
          {errors.dates && <div className="alert alert-danger">{errors.dates}</div>}

          <div className="form-footer">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
