import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CandidateAnalytics = ({ candidates = [] }) => {
  // Process the candidates data to get counts by status
  const chartData = useMemo(() => {
    // Define all possible statuses in order
    const statusOrder = [
      'submitted',
      'under_review', 
      'written_test',
      'interview',
      'accepted',
      'rejected'
    ];

    // Count applications for each status
    const statusCounts = candidates.reduce((acc, candidate) => {
      const status = candidate.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Create chart data with proper labels and ensure all statuses are included
    return statusOrder.map(status => ({
      status: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: statusCounts[status] || 0,
      statusKey: status
    }));
  }, [candidates]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 dark:text-slate-100">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Applications: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Get the color for the status badge (matching your existing function)
  const getStatusColor = (statusKey) => {
    switch (statusKey) {
      case 'submitted':
        return '#3b82f6'; // blue
      case 'under_review':
        return '#eab308'; // yellow
      case 'written_test':
        return '#6366f1'; // indigo
      case 'interview':
        return '#a855f7'; // purple
      case 'accepted':
        return '#22c55e'; // green
      case 'rejected':
        return '#ef4444'; // red
      default:
        return '#64748b'; // gray
    }
  };

  const totalApplications = candidates.length;
  const maxCount = Math.max(...chartData.map(d => d.count));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalApplications}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Applications</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {chartData.find(d => d.statusKey === 'accepted')?.count || 0}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Accepted</div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {chartData.find(d => d.statusKey === 'under_review')?.count || 0}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Under Review</div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {chartData.find(d => d.statusKey === 'rejected')?.count || 0}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Applications by Status
        </h3>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e2e8f0" 
                className="dark:stroke-slate-600"
              />
              <XAxis 
                dataKey="status" 
                stroke="#64748b"
                className="dark:stroke-slate-400"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#64748b"
                className="dark:stroke-slate-400"
                fontSize={12}
                domain={[0, maxCount + 1]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#1d4ed8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Breakdown - Compact */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Status Breakdown
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {chartData.map((item) => (
            <div key={item.statusKey} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getStatusColor(item.statusKey) }}
                />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {item.status}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.count}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({totalApplications > 0 ? ((item.count / totalApplications) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateAnalytics;