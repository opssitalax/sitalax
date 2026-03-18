/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Stethoscope, Receipt, Settings, Bell, Menu, MessageSquare, LogOut } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Billing from './pages/Billing';
import ClinicSettings from './pages/Settings';
import Automations from './pages/Automations';
import PublicBooking from './pages/PublicBooking';
import Login from './pages/Login';
import Signup from './pages/Signup';

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Appointments', href: '/app/appointments', icon: Calendar },
    { name: 'Patients', href: '/app/patients', icon: Users },
    { name: 'Doctors', href: '/app/doctors', icon: Stethoscope },
    { name: 'Billing', href: '/app/billing', icon: Receipt },
    { name: 'Automations', href: '/app/automations', icon: MessageSquare },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Stethoscope className="h-6 w-6 text-emerald-400 mr-2" />
        <span className="text-xl font-bold tracking-tight">Sitalax</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400">{user?.role || 'Staff'}</p>
            </div>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-white p-2" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <h1 className="text-lg font-medium text-slate-900">Clinic Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-slate-500">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/book/:clinicId" element={<PublicBooking />} />
          <Route path="/app/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/settings" element={<ClinicSettings />} />
      </Routes>
    </Layout>
  );
}
