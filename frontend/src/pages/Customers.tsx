import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customersAPI } from '../services/api';
import './Customers.css';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, pages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [createLoading, setCreateLoading] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customersAPI.getCustomers(currentPage, limit, searchTerm);
      setCustomers(data.items);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers();
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');

    try {
      await customersAPI.createCustomer(newCustomer);
      setNewCustomer({ name: '', email: '', phone: '', company: '' });
      setShowCreateForm(false);
      fetchCustomers(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create customer');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersAPI.deleteCustomer(id);
        fetchCustomers();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete customer');
      }
    }
  };

  if (loading) return <div className="loading">Loading customers...</div>;

  return (
    <div className="customers">
      <div className="customers-header">
        <h1>Customers</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
          Add New Customer
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateCustomer} className="create-form">
          <h3>Create New Customer</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                required
                placeholder="Customer name"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                required
                placeholder="customer@example.com"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={newCustomer.company}
                onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={createLoading} className="btn-primary">
              {createLoading ? 'Creating...' : 'Create Customer'}
            </button>
            <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="customers-list">
        {customers.length === 0 ? (
          <div className="empty-state">
            <h3>No customers found</h3>
            <p>Get started by adding your first customer</p>
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer._id} className="customer-card">
              <div className="customer-info">
                <h3>{customer.name}</h3>
                <p>{customer.email}</p>
                <p>{customer.phone}</p>
                <p>{customer.company}</p>
                <p className="customer-date">
                  Added: {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="customer-actions">
                <Link to={`/customers/${customer._id}`} className="btn-secondary">
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(customer._id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {pagination.pages}</span>
          <button
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Customers;