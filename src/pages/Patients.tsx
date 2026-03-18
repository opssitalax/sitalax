import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, X } from 'lucide-react';

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', age: '', gender: 'Male', address: '', notes: ''
  });

  const fetchPatients = () => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => setPatients(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsAdding(false);
        setFormData({ name: '', phone: '', age: '', gender: 'Male', address: '', notes: '' });
        fetchPatients();
      }
    } catch (error) {
      console.error('Failed to add patient', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Patient
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Add New Patient</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Age</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button type="submit" className="inline-flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700 sm:col-start-2 sm:text-sm">
                  Save Patient
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:col-start-1 sm:mt-0 sm:text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search patients by name or phone..."
          className="ml-2 block w-full border-0 p-0 text-slate-900 placeholder-slate-400 focus:ring-0 sm:text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Age/Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Added On</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-slate-900">{patient.name}</div>
                      <div className="text-xs text-slate-500">{patient.id}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center text-sm text-slate-500">
                    <Phone className="mr-1.5 h-4 w-4" />
                    {patient.phone}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {patient.age} / {patient.gender}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button className="text-emerald-600 hover:text-emerald-900">View</button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  No patients found. Add a patient to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
