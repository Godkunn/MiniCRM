import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportsAPI } from '../services/api';
import './Dashboard.css';

interface LeadsByStatus {
  New: { count: number; totalValue: number };
  Contacted: { count: number; totalValue: number };
  Converted: { count: number; totalValue: number };
  Lost: { count: number; totalValue: number };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
  const [leadsData, setLeadsData] = useState<LeadsByStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await reportsAPI.getLeadsByStatus();
        setLeadsData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const pieChartData = leadsData ? [
    { name: 'New', value: leadsData.New.count },
    { name: 'Contacted', value: leadsData.Contacted.count },
    { name: 'Converted', value: leadsData.Converted.count },
    { name: 'Lost', value: leadsData.Lost.count }
  ] : [];

  const barChartData = leadsData ? [
    { status: 'New', count: leadsData.New.count, value: leadsData.New.totalValue },
    { status: 'Contacted', count: leadsData.Contacted.count, value: leadsData.Contacted.totalValue },
    { status: 'Converted', count: leadsData.Converted.count, value: leadsData.Converted.totalValue },
    { status: 'Lost', count: leadsData.Lost.count, value: leadsData.Lost.totalValue }
  ] : [];

  // Custom label renderer for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (!percent) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card new">
          <h3>New Leads</h3>
          <p className="stat-number">{leadsData?.New.count || 0}</p>
          <div className="stat-trend">+12%</div>
        </div>
        <div className="stat-card contacted">
          <h3>Contacted</h3>
          <p className="stat-number">{leadsData?.Contacted.count || 0}</p>
          <div className="stat-trend">+8%</div>
        </div>
        <div className="stat-card converted">
          <h3>Converted</h3>
          <p className="stat-number">{leadsData?.Converted.count || 0}</p>
          <div className="stat-trend">+5%</div>
        </div>
        <div className="stat-card lost">
          <h3>Lost</h3>
          <p className="stat-number">{leadsData?.Lost.count || 0}</p>
          <div className="stat-trend">-3%</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <h3>Leads by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Lead Value by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
              <XAxis dataKey="status" stroke="#90a4ae" />
              <YAxis stroke="#90a4ae" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#263238', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Total Value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;