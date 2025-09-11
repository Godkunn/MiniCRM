import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(res => res.data),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }).then(res => res.data),
  verifyToken: () =>
    api.get('/auth/verify').then(res => res.data),
};

export const customersAPI = {
  getCustomers: (page: number = 1, limit: number = 10, search: string = '') =>
    api.get(`/customers?page=${page}&limit=${limit}&search=${search}`).then(res => res.data),
  getCustomer: (id: string) =>
    api.get(`/customers/${id}`).then(res => res.data),
  createCustomer: (data: any) =>
    api.post('/customers', data).then(res => res.data),
  updateCustomer: (id: string, data: any) =>
    api.put(`/customers/${id}`, data).then(res => res.data),
  deleteCustomer: (id: string) =>
    api.delete(`/customers/${id}`).then(res => res.data),
};

export const leadsAPI = {
  getLeads: (customerId: string, page: number = 1, limit: number = 10, status: string = '') =>
    api.get(`/customers/${customerId}/leads?page=${page}&limit=${limit}&status=${status}`).then(res => res.data),
  getLead: (customerId: string, leadId: string) =>
    api.get(`/customers/${customerId}/leads/${leadId}`).then(res => res.data),
  createLead: (customerId: string, data: any) =>
    api.post(`/customers/${customerId}/leads`, data).then(res => res.data),
  updateLead: (customerId: string, leadId: string, data: any) =>
    api.put(`/customers/${customerId}/leads/${leadId}`, data).then(res => res.data),
  deleteLead: (customerId: string, leadId: string) =>
    api.delete(`/customers/${customerId}/leads/${leadId}`).then(res => res.data),
};

export const reportsAPI = {
  getLeadsByStatus: () =>
    api.get('/reports/leads-by-status').then(res => res.data),
};

export default api;