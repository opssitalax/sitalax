import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Building, User, Lock, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clinicName: '', clinicPhone: '', clinicAddress: '',
    doctorName: '', email: '', password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        navigate('/app');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Create your clinic
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          
          {/* Step Indicators */}
          <div className="flex items-center justify-center mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>1</div>
            <div className="w-16 h-1 bg-slate-200 mx-2"><div className={`h-full bg-emerald-500 transition-all ${step === 2 ? 'w-full' : 'w-0'}`}></div></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
          </div>

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleNext}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Clinic Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-400" />
                  </div>
                  <input required type="text" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border" placeholder="Smile Care Dental" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Clinic Phone</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input required type="tel" value={formData.clinicPhone} onChange={e => setFormData({...formData, clinicPhone: e.target.value})} className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Clinic Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input required type="text" value={formData.clinicAddress} onChange={e => setFormData({...formData, clinicAddress: e.target.value})} className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border" placeholder="123 Main St, City" />
                </div>
              </div>

              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                Continue to Account Setup
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Your Name (Primary Doctor)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input required type="text" value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border" placeholder="Dr. Sarah Smith" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border" placeholder="sarah@smilecare.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border" placeholder="••••••••" />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                  Back
                </button>
                <button type="submit" disabled={loading} className="w-2/3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
