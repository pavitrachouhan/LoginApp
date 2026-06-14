import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Users, Laptop, Calendar, AlertCircle, TrendingUp, Plus, UserPlus, FileText } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState({ summary: { employees: 0, availableAssets: 0, pendingLeaves: 0 }, departmentDistribution: [] });
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/dashboard');
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Enterprise Overview</h1>
        <p className="text-slate-500">Welcome back. Here is the pulse of your organization today.</p>
      </div>
      
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-4">
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm">
          <UserPlus size={18} /> Add Employee
        </button>
        <button className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium shadow-sm">
          <Plus size={18} /> New Asset
        </button>
        <button className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium shadow-sm">
          <FileText size={18} /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users />} title="Total Employees" value={data.summary.employees || 0} color="bg-blue-500" />
        <StatCard icon={<Laptop />} title="Available Assets" value={data.summary.availableAssets || 0} color="bg-emerald-500" />
        <StatCard icon={<Calendar />} title="Pending Leaves" value={data.summary.pendingLeaves || 0} color="bg-amber-500" />
        <StatCard icon={<AlertCircle />} title="System Health" value="Optimal" color="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-6 text-slate-800">Workforce Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department_name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-6 text-slate-800">Asset Status</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Available', value: Number(data.summary.availableAssets || 0) },
                    { name: 'Allocated', value: Math.max(0, Number(data.summary.employees || 0) - Number(data.summary.availableAssets || 0)) }
                  ]}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Notifications / Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Enterprise Activity
          </h2>
          <button className="text-sm text-blue-600 font-medium hover:underline">View all</button>
        </div>
        <div className="p-6 space-y-6">
          <ActivityItem status="success" message="System backup completed successfully." time="2 mins ago" />
          <ActivityItem status="info" message="New laptop (ASSET-102) added to inventory." time="1 hour ago" />
          <ActivityItem status="warning" message="3 leave applications pending approval." time="3 hours ago" />
          <ActivityItem status="success" message="Payroll processing for Q3 initiated." time="5 hours ago" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-5 hover:shadow-md transition-all">
    <div className={`${color} p-4 rounded-2xl text-white shadow-lg shadow-blue-500/10`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

const ActivityItem = ({ status, message, time }) => (
  <div className="flex items-start justify-between">
    <div className="flex items-start space-x-4">
      <div className={`mt-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${status === 'success' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
      <p className="text-sm text-slate-600 font-medium">{message}</p>
    </div>
    <span className="text-xs text-slate-400 whitespace-nowrap">{time}</span>
  </div>
);

export default Dashboard;