"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function TrainerDashboardCharts({ stats }: { stats: any }) {
  const statusData = [
    { name: "Active", value: stats?.active || 0 },
    { name: "Pending", value: stats?.pending || 0 },
    { name: "Inactive", value: stats?.inactive || 0 },
    { name: "Suspended", value: stats?.suspended || 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Trainers by Status</h3>
        <div className="h-[300px]">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
      
      {/* Additional charts (State, NADI Site, Specialisation) can be added here */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Trainer Assignments</h3>
        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
          <p className="mb-2">Assigned to Courses: <span className="font-bold text-gray-900">{stats?.assignedToCourses || 0}</span></p>
          <p>Assigned to NADI Sites: <span className="font-bold text-gray-900">{stats?.assignedToNadi || 0}</span></p>
        </div>
      </div>
    </div>
  );
}
