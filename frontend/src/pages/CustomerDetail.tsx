// frontend/src/pages/CustomerDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customersAPI, leadsAPI } from '../services/api';
import './CustomerDetail.css';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  createdAt: string;
  leads: Lead[];
}

interface Lead {
  _id: string;
  title: string;
  description: string;
  status: string;
  value: number;
  createdAt: string;
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({
    title: '',
    description: '',
    status: 'New',
    value: 0
  });

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const data = await customersAPI.getCustomer(id!);
      setCustomer(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch customer');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leadsAPI.createLead(id!, leadForm);
      setShowLeadForm(false);
      setLeadForm({ title: '', description: '', status: 'New', value: 0 });
      fetchCustomer(); // Refresh customer data
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create lead');
    }
  };

  const handleLeadDelete = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsAPI.deleteLead(id!, leadId);
        fetchCustomer();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete lead');
      }
    }
  };

  if (loading) return <div>Loading customer...</div>;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="customer-detail">
      <div className="customer-header">
        <h1>{customer.name}</h1>
        <Link to="/customers" className="btn-secondary">
          Back to Customers
        </Link>
      </div>

      <div className="customer-info">
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Company:</strong> {customer.company}</p>
        <p><strong>Since:</strong> {new Date(customer.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="leads-section">
        <div className="leads-header">
          <h2>Leads</h2>
          <button onClick={() => setShowLeadForm(!showLeadForm)} className="btn-primary">
            Add Lead
          </button>
        </div>

        {showLeadForm && (
          <form onSubmit={handleLeadSubmit} className="lead-form">
            <h3>Add New Lead</h3>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={leadForm.title}
                onChange={(e) => setLeadForm({ ...leadForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={leadForm.description}
                onChange={(e) => setLeadForm({ ...leadForm, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={leadForm.status}
                onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="form-group">
              <label>Value</label>
              <input
                type="number"
                value={leadForm.value}
                onChange={(e) => setLeadForm({ ...leadForm, value: Number(e.target.value) })}
              />
            </div>
            <button type="submit">Create Lead</button>
            <button type="button" onClick={() => setShowLeadForm(false)}>
              Cancel
            </button>
          </form>
        )}

        <div className="leads-list">
          {customer.leads.map((lead) => (
            <div key={lead._id} className="lead-card">
              <div className="lead-info">
                <h4>{lead.title}</h4>
                <p>{lead.description}</p>
                <div className="lead-meta">
                  <span className={`status status-${lead.status.toLowerCase()}`}>
                    {lead.status}
                  </span>
                  <span className="value">${lead.value}</span>
                  <span className="date">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="lead-actions">
                <button
                  onClick={() => handleLeadDelete(lead._id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;