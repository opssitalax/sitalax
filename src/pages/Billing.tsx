import React, { useState, useEffect } from 'react';
import { Receipt, Download, Search, Plus, X } from 'lucide-react';

export default function Billing() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', consultationFee: '', procedureFee: '', medicineFee: '', discount: '', tax: '', paymentMethod: 'Cash'
  });

  const fetchData = () => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setInvoices([]));
      
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => setPatients(Array.isArray(data) ? data : []))
      .catch(() => setPatients([]));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsCreating(false);
        setFormData({ patientId: '', consultationFee: '', procedureFee: '', medicineFee: '', discount: '', tax: '', paymentMethod: 'Cash' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create invoice', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <button onClick={() => setIsCreating(true)} className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Create Invoice
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Create Invoice</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Patient</label>
                <select required value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
                  <option value="">Select a patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Consultation Fee</label>
                  <input type="number" value={formData.consultationFee} onChange={e => setFormData({...formData, consultationFee: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Procedure Fee</label>
                  <input type="number" value={formData.procedureFee} onChange={e => setFormData({...formData, procedureFee: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Medicine Fee</label>
                  <input type="number" value={formData.medicineFee} onChange={e => setFormData({...formData, medicineFee: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Discount</label>
                  <input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tax (%)</label>
                  <input type="number" value={formData.tax} onChange={e => setFormData({...formData, tax: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Payment Method</label>
                  <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </select>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button type="submit" className="inline-flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700 sm:col-start-2 sm:text-sm">
                  Create Invoice
                </button>
                <button type="button" onClick={() => setIsCreating(false)} className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:col-start-1 sm:mt-0 sm:text-sm">
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
          placeholder="Search invoices by patient name or ID..."
          className="ml-2 block w-full border-0 p-0 text-slate-900 placeholder-slate-400 focus:ring-0 sm:text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Invoice ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{invoice.id}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{invoice.patientName}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">₹{invoice.total}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button className="text-slate-400 hover:text-slate-500"><Download className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
