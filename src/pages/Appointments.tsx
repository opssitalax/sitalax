import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, X } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', date: '', time: ''
  });

  const fetchData = () => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]));
      
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => setPatients(Array.isArray(data) ? data : []))
      .catch(() => setPatients([]));
      
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(Array.isArray(data) ? data : []))
      .catch(() => setDoctors([]));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsBooking(false);
        setFormData({ patientId: '', doctorId: '', date: '', time: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to book appointment', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'Booked': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'No Show': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Appointments</h1>
        <button onClick={() => setIsBooking(true)} className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
          <CalendarIcon className="-ml-1 mr-2 h-5 w-5" />
          Book Appointment
        </button>
      </div>

      {isBooking && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Book Appointment</h3>
              <button onClick={() => setIsBooking(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Patient</label>
                <select required value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
                  <option value="">Select a patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Doctor</label>
                <select required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
                  <option value="">Select a doctor...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Time</label>
                  <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button type="submit" className="inline-flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700 sm:col-start-2 sm:text-sm">
                  Book Now
                </button>
                <button type="button" onClick={() => setIsBooking(false)} className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:col-start-1 sm:mt-0 sm:text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs font-medium text-slate-500">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg font-bold text-slate-900">{new Date(apt.date).getDate()}</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900">{apt.patientName}</h3>
                  <div className="mt-1 flex items-center text-xs text-slate-500 space-x-2">
                    <span className="flex items-center"><Clock className="mr-1 h-3 w-3" /> {apt.time}</span>
                    <span className="flex items-center"><User className="mr-1 h-3 w-3" /> {apt.doctorName}</span>
                    {apt.source === 'Online' && (
                      <span className="flex items-center bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-medium border border-blue-100">
                        Online Booking
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
                <div className="flex space-x-2">
                  <button onClick={() => updateStatus(apt.id, 'Confirmed')} className="text-emerald-600 hover:text-emerald-900" title="Confirm"><CheckCircle className="h-5 w-5" /></button>
                  <button onClick={() => updateStatus(apt.id, 'No Show')} className="text-orange-600 hover:text-orange-900" title="Mark No Show"><XCircle className="h-5 w-5" /></button>
                  <button onClick={() => updateStatus(apt.id, 'Cancelled')} className="text-red-600 hover:text-red-900" title="Cancel"><X className="h-5 w-5" /></button>
                </div>
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <div className="text-center py-10 text-slate-500">No appointments found.</div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-fit">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Calendar</h2>
          <div className="text-sm text-slate-500 text-center py-10 border border-dashed border-slate-300 rounded-lg">
            Calendar View Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}
