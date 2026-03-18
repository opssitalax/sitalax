import React, { useState, useEffect } from 'react';
import { Save, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';

function AutomationItem({ def, existing, onSave }: { key?: string, def: any, existing: any, onSave: (type: string, enabled: boolean, template: string, delayHours: number) => void }) {
  const [enabled, setEnabled] = useState(existing ? existing.enabled === 1 : true);
  const [template, setTemplate] = useState(existing ? existing.messageTemplate : def.defaultTemplate);

  // Update state if existing data changes (e.g., after fetch)
  useEffect(() => {
    if (existing) {
      setEnabled(existing.enabled === 1);
      setTemplate(existing.messageTemplate);
    }
  }, [existing]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900">{def.title}</h3>
            <p className="text-sm text-slate-500">{def.desc}</p>
          </div>
        </div>
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-3 text-sm font-medium text-slate-700">{enabled ? 'Active' : 'Disabled'}</span>
          </label>
        </div>
      </div>
      <div className="p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Message Template</label>
        <textarea
          rows={3}
          className="w-full rounded-md border-slate-300 border p-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          disabled={!enabled}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onSave(def.type, enabled, template, 0)}
            className="inline-flex items-center justify-center rounded-md bg-white border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Save className="-ml-1 mr-2 h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Automations() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultAutomations = [
    { type: 'confirmation', title: 'Booking Confirmation', desc: 'Sent immediately when an appointment is booked.', defaultTemplate: 'Hi {patientName}, your appointment is confirmed for {date} at {time}. Reply YES to confirm.' },
    { type: 'reminder', title: '24h Reminder', desc: 'Sent 24 hours before the appointment time.', defaultTemplate: 'Hi {patientName}, reminder for your appointment tomorrow at {time}.' },
    { type: 'post_visit_review', title: 'Post-Visit Review Request', desc: 'Sent after an appointment is marked as Completed.', defaultTemplate: 'Hi {patientName}, thank you for visiting us today! Please leave a review here: {reviewLink}' },
    { type: 'no_show_reschedule', title: 'No-Show Follow-up', desc: 'Sent after an appointment is marked as No Show.', defaultTemplate: 'Hi {patientName}, we missed you today. Please reply to this message to reschedule your appointment.' },
    { type: 'recall_6_months', title: '6-Month Recall', desc: 'Sent 6 months after a completed appointment.', defaultTemplate: 'Hi {patientName}, it has been 6 months since your last visit. Time for a checkup!' }
  ];

  const fetchAutomations = () => {
    fetch('/api/automations')
      .then(res => res.json())
      .then(data => {
        setAutomations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleSave = async (type: string, enabled: boolean, template: string, delayHours: number) => {
    try {
      await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, enabled, messageTemplate: template, delayHours })
      });
      fetchAutomations();
    } catch (error) {
      console.error('Failed to save automation', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">WhatsApp Automations</h1>
        <div className="flex items-center text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <CheckCircle className="w-4 h-4 mr-1.5" />
          WhatsApp API Connected
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Use variables like <strong>{'{patientName}'}</strong>, <strong>{'{date}'}</strong>, <strong>{'{time}'}</strong>, and <strong>{'{reviewLink}'}</strong> in your templates. They will be automatically replaced when the message is sent.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {defaultAutomations.map((def) => {
          const existing = automations.find(a => a.type === def.type);
          return (
            <AutomationItem 
              key={def.type} 
              def={def} 
              existing={existing} 
              onSave={handleSave} 
            />
          );
        })}
      </div>
    </div>
  );
}
