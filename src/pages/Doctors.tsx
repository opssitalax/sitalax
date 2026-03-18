import React, { useState, useEffect } from 'react';
import { Plus, X, Phone, Mail, Clock, IndianRupee } from 'lucide-react';

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialization: '', consultationFee: '', workingHours: 'Mon-Sat 10am-7pm'
  });

  const fetchDoctors = () => {
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsAdding(false);
        setFormData({ name: '', email: '', phone: '', specialization: '', consultationFee: '', workingHours: 'Mon-Sat 10am-7pm' });
        fetchDoctors();
      }
    } catch (error) {
      console.error('Failed to add doctor', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Doctors</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Doctor
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Add New Doctor</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Specialization</label>
                <input required type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Consultation Fee</label>
                  <input required type="number" value={formData.consultationFee} onChange={e => setFormData({...formData, consultationFee: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Working Hours</label>
                  <input required type="text" value={formData.workingHours} onChange={e => setFormData({...formData, workingHours: e.target.value})} placeholder="e.g. Mon-Sat 10am-7pm" className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button type="submit" className="inline-flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700 sm:col-start-2 sm:text-sm">
                  Save Doctor
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:col-start-1 sm:mt-0 sm:text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                  {doctor.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">{doctor.name}</h3>
                  <p className="text-sm text-emerald-600 font-medium">{doctor.specialization}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col space-y-3">
                <div className="flex items-center text-sm text-slate-500">
                  <Phone className="mr-2 h-4 w-4 text-slate-400" />
                  {doctor.phone}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <Mail className="mr-2 h-4 w-4 text-slate-400" />
                  {doctor.email}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="mr-2 h-4 w-4 text-slate-400" />
                  {doctor.workingHours}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <IndianRupee className="mr-2 h-4 w-4 text-slate-400" />
                  ₹{doctor.consultationFee} / consultation
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">ID: {doctor.id}</span>
                <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Edit Profile</button>
              </div>
            </div>
          </div>
        ))}
        {doctors.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500">
            No doctors found. Add a doctor to get started.
          </div>
        )}
      </div>
    </div>
  );
}
