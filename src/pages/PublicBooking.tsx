import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle } from 'lucide-react';

export default function PublicBooking() {
  const [clinicId, setClinicId] = useState('C101'); // Hardcoded for demo
  const [clinic, setClinic] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '', patientPhone: '', doctorId: '', date: '', time: ''
  });

  useEffect(() => {
    fetch(`/api/public/clinics/${clinicId}`)
      .then(res => res.json())
      .then(data => {
        setClinic(data.clinic);
        setDoctors(data.doctors);
        setLoading(false);
      })
      .catch(console.error);
  }, [clinicId]);

  useEffect(() => {
    if (formData.doctorId && formData.date) {
      setLoadingSlots(true);
      fetch(`/api/public/clinics/${clinicId}/doctors/${formData.doctorId}/slots?date=${formData.date}`)
        .then(res => res.json())
        .then(data => {
          setAvailableSlots(data.availableSlots || []);
          setLoadingSlots(false);
          if (formData.time && !data.availableSlots?.includes(formData.time)) {
            setFormData(prev => ({ ...prev, time: '' }));
          }
        })
        .catch(console.error);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.doctorId, formData.date, clinicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/public/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, clinicId })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Failed to book online', error);
      setError('An unexpected error occurred.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  if (!clinic) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Clinic not found</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Booking Confirmed!</h2>
          <p className="mt-2 text-sm text-slate-600">
            You will receive a WhatsApp confirmation shortly.
          </p>
          <button onClick={() => setSuccess(false)} className="mt-8 text-emerald-600 hover:text-emerald-500 font-medium">
            Book another appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          {clinic.name}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {clinic.address} | {clinic.phone}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="text" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Phone Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="tel" value={formData.patientPhone} onChange={e => setFormData({...formData, patientPhone: e.target.value})} className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border" placeholder="+91 9876543210" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Select Doctor</label>
              <select required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md border">
                <option value="">Choose a doctor...</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Date</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Time</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <select required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} disabled={!formData.date || !formData.doctorId || loadingSlots} className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border bg-white disabled:bg-slate-100 disabled:text-slate-400">
                    <option value="">{loadingSlots ? 'Loading...' : 'Select time...'}</option>
                    {availableSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
