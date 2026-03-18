import { useState, useEffect } from 'react';
import { Users, Calendar, Receipt, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingInvoices: 0,
    revenue: 0,
    recentAppointments: [] as any[],
    revenueChart: [] as any[]
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
          {stats.recentAppointments && stats.recentAppointments.length > 0 ? (
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-slate-200">
                {stats.recentAppointments.map((apt: any) => (
                  <li key={apt.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{apt.patientName}</p>
                        <p className="truncate text-sm text-slate-500">{apt.date} at {apt.time}</p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No recent appointments found.</div>
          )}
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Revenue Overview (Last 7 Days)</h2>
          {stats.revenueChart && stats.revenueChart.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No revenue data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
