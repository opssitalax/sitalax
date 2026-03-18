import { useState, useEffect } from 'react';
import { Users, Calendar, Receipt, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingInvoices: 0,
    revenue: 0
  });

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStats(data);
        }
      })
      .catch(console.error);
  }, []);

  const statCards = [
    { name: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Appointments Today', value: stats.todayAppointments, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Pending Invoices', value: stats.pendingInvoices, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Revenue', value: `₹${stats.revenue}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-slate-500">{stat.name}</dt>
                    <dd>
                      <div className="text-2xl font-semibold text-slate-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Recent Appointments</h2>
          <div className="text-sm text-slate-500">Loading appointments...</div>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Revenue Overview</h2>
          <div className="text-sm text-slate-500">Loading chart...</div>
        </div>
      </div>
    </div>
  );
}
