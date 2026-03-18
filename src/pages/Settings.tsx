import { useState, useEffect } from 'react';
import { Building2, Users, MessageSquare, Shield, Save } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('clinic');
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setClinic(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clinic)
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  const tabs = [
    { id: 'clinic', name: 'Clinic Profile', icon: Building2 },
    { id: 'staff', name: 'Staff Management', icon: Users },
    { id: 'whatsapp', name: 'WhatsApp API', icon: MessageSquare },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-900 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    activeTab === tab.id ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="p-6 text-center text-slate-500">Loading settings...</div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              {activeTab === 'clinic' && (
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-4">Clinic Information</h2>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="clinic-name" className="block text-sm font-medium text-slate-700">Clinic Name</label>
                      <div className="mt-1">
                        <input type="text" value={clinic?.name || ''} onChange={e => setClinic({...clinic, name: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
                      <div className="mt-1">
                        <input type="text" value={clinic?.phone || ''} onChange={e => setClinic({...clinic, phone: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
                      </div>
                    </div>
                    <div className="sm:col-span-6">
                      <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
                      <div className="mt-1">
                        <input type="text" value={clinic?.address || ''} onChange={e => setClinic({...clinic, address: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
                      </div>
                    </div>
                    <div className="sm:col-span-6">
                      <label htmlFor="review" className="block text-sm font-medium text-slate-700">Google Review Link</label>
                      <div className="mt-1">
                        <input type="url" value={clinic?.googleReviewLink || ''} onChange={e => setClinic({...clinic, googleReviewLink: e.target.value})} placeholder="https://g.page/r/..." className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
                        <p className="text-xs text-slate-500 mt-1">Used in post-visit automations.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-200">
                    <button onClick={handleSave} className="inline-flex justify-center items-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
              {activeTab === 'whatsapp' && (
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-4">WhatsApp Integration</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">Connect your WhatsApp Business API to send automated appointment reminders and invoices.</p>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-slate-700">Provider</label>
                        <select value={clinic?.whatsappProvider || 'none'} onChange={e => setClinic({...clinic, whatsappProvider: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2">
                          <option value="none">None (Mock Mode)</option>
                          <option value="meta">Meta Cloud API (Official)</option>
                          <option value="twilio">Twilio</option>
                        </select>
                      </div>
                      
                      {clinic?.whatsappProvider !== 'none' && (
                        <>
                          <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-slate-700">API Key / Access Token</label>
                            <div className="mt-1">
                              <input type="password" value={clinic?.whatsappApiKey || ''} onChange={e => setClinic({...clinic, whatsappApiKey: e.target.value})} placeholder="Enter your API Key" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
                            </div>
                          </div>
                          <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-slate-700">Sender Phone Number ID</label>
                            <div className="mt-1">
                              <input type="text" value={clinic?.whatsappPhone || ''} onChange={e => setClinic({...clinic, whatsappPhone: e.target.value})} placeholder="e.g. 1023456789" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <button onClick={handleSave} className="inline-flex justify-center items-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {(activeTab === 'staff' || activeTab === 'security') && (
                <div className="p-6 text-center text-slate-500">
                  This section is under development.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
