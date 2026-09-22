"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Star, Users, CheckCircle, TrendingUp, Clock, BookOpen } from 'lucide-react';

export function TrainerPerformanceClient({ 
  attendanceStats, 
  feedbackStats,
  trainers 
}: { 
  attendanceStats: any, 
  feedbackStats: any,
  trainers: any[]
}) {
  // Mock aggregation data for demonstration
  const aggregateMetrics = {
    totalSessions: 142,
    totalLearners: 2840,
    averageRating: 4.8,
    completionRate: 94
  };

  const performanceOverTime = [
    { month: 'Jan', rating: 4.5, sessions: 12 },
    { month: 'Feb', rating: 4.6, sessions: 15 },
    { month: 'Mar', rating: 4.6, sessions: 18 },
    { month: 'Apr', rating: 4.7, sessions: 14 },
    { month: 'May', rating: 4.8, sessions: 22 },
    { month: 'Jun', rating: 4.9, sessions: 20 },
  ];

  const ratingDistribution = [
    { name: '5 Stars', value: 65 },
    { name: '4 Stars', value: 25 },
    { name: '3 Stars', value: 7 },
    { name: '2 Stars', value: 2 },
    { name: '1 Star', value: 1 },
  ];
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#9ca3af'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Sessions Delivered</p>
            <h3 className="text-2xl font-bold text-gray-900">{aggregateMetrics.totalSessions}</h3>
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12% this month
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Learners Reached</p>
            <h3 className="text-2xl font-bold text-gray-900">{aggregateMetrics.totalLearners}</h3>
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +8% this month
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Average Rating</p>
            <h3 className="text-2xl font-bold text-gray-900">{aggregateMetrics.averageRating} <span className="text-base font-normal text-gray-500">/ 5.0</span></h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Based on 1.2k reviews</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Completion Rate</p>
            <h3 className="text-2xl font-bold text-gray-900">{aggregateMetrics.completionRate}%</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Learners finishing courses</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">Trainer Performance Over Time</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} domain={[0, 5]} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line yAxisId="left" type="monotone" dataKey="rating" name="Avg Rating" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="sessions" name="Sessions" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Learner Feedback Distribution</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {ratingDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-gray-600">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold">Top Performing Trainers</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 text-sm">Trainer</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-sm text-center">Sessions</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-sm text-center">Avg Rating</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-sm text-center">Feedback Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trainers.slice(0, 5).map((trainer, idx) => (
              <tr key={trainer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-primary-700 flex items-center gap-3">
                  <span className={`w-6 text-center font-bold text-gray-400 ${idx < 3 ? 'text-primary-500' : ''}`}>#{idx + 1}</span>
                  {trainer.name}
                </td>
                <td className="px-6 py-4 text-center text-gray-600">{Math.floor(Math.random() * 50) + 10}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold">
                    <Star className="h-4 w-4 fill-yellow-400" />
                    {(4.2 + Math.random() * 0.8).toFixed(1)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-gray-600">{Math.floor(Math.random() * 500) + 50}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
