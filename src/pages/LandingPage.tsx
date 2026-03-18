import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, MessageSquare, LayoutDashboard, ArrowRight, CheckCircle2, 
  TrendingUp, Clock, Users, Shield, Smartphone, Zap, ChevronRight, Star
} from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/public/prebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Sticky Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-emerald-600 p-2 rounded-xl shadow-sm">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">SitaLax</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('features')} className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Features</button>
            <button onClick={() => scrollToSection('roi')} className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">ROI</button>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors">
              Clinic Login
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/20 transition-all active:scale-95"
            >
              Request Access
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full overflow-hidden -z-10 flex justify-center">
            <div className="w-[800px] h-[400px] bg-emerald-400/20 blur-[100px] rounded-full"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-sm font-bold mb-8 shadow-sm">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Stop losing patients to missed calls</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                Automate your clinic's bookings via <span className="text-emerald-600 relative whitespace-nowrap">
                  WhatsApp
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="transparent"/>
                  </svg>
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
                Let patients book 24/7 through an AI WhatsApp bot. Reduce no-shows by 40% with automated reminders. Manage everything from one powerful dashboard.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-1"
                >
                  Pre-book / Request Access
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  to="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-full text-lg font-bold hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-1"
                >
                  Try Interactive Demo
                </Link>
              </div>
              <p className="mt-6 text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> No credit card required. Secure & HIPAA compliant architecture.
              </p>
            </motion.div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="border-y border-slate-200 bg-white py-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Built for modern healthcare practices</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale">
              {/* Placeholder logos for visual trust */}
              <div className="flex items-center gap-2 text-xl font-black text-slate-800"><Calendar className="w-6 h-6"/> DentalPlus</div>
              <div className="flex items-center gap-2 text-xl font-black text-slate-800"><Users className="w-6 h-6"/> CareClinic</div>
              <div className="flex items-center gap-2 text-xl font-black text-slate-800"><TrendingUp className="w-6 h-6"/> PhysioPro</div>
              <div className="flex items-center gap-2 text-xl font-black text-slate-800"><Shield className="w-6 h-6"/> DermaCare</div>
            </div>
          </div>
        </section>

        {/* THE PROBLEM SECTION */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                  You are losing patients because they hate calling.
                </h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  60% of patients prefer texting over calling. When your front desk is busy, calls go to voicemail, and patients book with your competitor instead.
                </p>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="bg-red-500/20 p-2 rounded-lg mt-1"><Clock className="w-5 h-5 text-red-400" /></div>
                    <div>
                      <h4 className="font-bold text-lg">Missed After-Hours Bookings</h4>
                      <p className="text-slate-400">Patients want to book at 9 PM. Your clinic is closed.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-red-500/20 p-2 rounded-lg mt-1"><Users className="w-5 h-5 text-red-400" /></div>
                    <div>
                      <h4 className="font-bold text-lg">High No-Show Rates</h4>
                      <p className="text-slate-400">Manual phone reminders take hours and are often ignored.</p>
                    </div>
                  </li>
                </ul>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-emerald-400">The SitaLax Solution</h3>
                <div className="space-y-6">
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <span className="font-bold text-lg">24/7 WhatsApp Bot</span>
                    </div>
                    <p className="text-slate-400">Never miss a booking. The bot handles scheduling automatically.</p>
                  </div>
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <span className="font-bold text-lg">Automated Reminders</span>
                    </div>
                    <p className="text-slate-400">Send WhatsApp reminders 24hrs before. Cut no-shows by 40%.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">How SitaLax Works</h2>
              <p className="text-xl text-slate-600">A seamless experience for both your patients and your staff.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-emerald-200 z-0"></div>

              {[
                { step: 1, title: "Patient Texts You", desc: "Patient sends a WhatsApp message to your clinic's dedicated number.", icon: Smartphone },
                { step: 2, title: "Bot Handles Booking", desc: "Our AI bot shows available slots and confirms the appointment instantly.", icon: MessageSquare },
                { step: 3, title: "Syncs to Dashboard", desc: "The appointment appears on your dashboard. Reminders are scheduled automatically.", icon: LayoutDashboard }
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className="relative z-10 text-center">
                  <div className="w-24 h-24 mx-auto bg-white border-4 border-emerald-100 rounded-full flex items-center justify-center shadow-xl shadow-emerald-100 mb-6">
                    <item.icon className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
                    <div className="text-emerald-600 font-black text-sm tracking-widest uppercase mb-2">Step {item.step}</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Everything you need to run your clinic</h2>
              <p className="text-xl text-slate-600">Replace 3 different software tools with one unified platform.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: MessageSquare, title: "WhatsApp Bot", desc: "Fully automated conversational booking flow right inside WhatsApp." },
                { icon: Clock, title: "Smart Reminders", desc: "Automated 24h reminders and 6-month recall messages." },
                { icon: LayoutDashboard, title: "Clinic Dashboard", desc: "Beautiful daily calendar view for all your doctors and staff." },
                { icon: Users, title: "Patient Records", desc: "Keep track of patient history, notes, and past visits securely." },
                { icon: TrendingUp, title: "Billing & Invoices", desc: "Generate professional invoices and track your daily revenue." },
                { icon: Shield, title: "Role Management", desc: "Separate logins for Owners, Doctors, and Receptionists." }
              ].map((feature, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all group">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all text-slate-700">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI / STATS SECTION */}
        <section id="roi" className="py-24 bg-emerald-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-emerald-700 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                  The ROI is immediate.
                </h2>
                <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
                  Clinics switching to SitaLax see a massive drop in administrative work and a direct increase in booked appointments.
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-emerald-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-1"
                >
                  Request Early Access
                </button>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-emerald-700/50 backdrop-blur-sm border border-emerald-500/30 p-8 rounded-3xl">
                  <div className="text-5xl font-black text-white mb-2">+24</div>
                  <div className="text-emerald-100 font-medium">Extra appointments generated per month on average</div>
                </div>
                <div className="bg-emerald-700/50 backdrop-blur-sm border border-emerald-500/30 p-8 rounded-3xl">
                  <div className="text-5xl font-black text-white mb-2">-40%</div>
                  <div className="text-emerald-100 font-medium">Reduction in patient no-shows via WhatsApp reminders</div>
                </div>
                <div className="bg-emerald-700/50 backdrop-blur-sm border border-emerald-500/30 p-8 rounded-3xl">
                  <div className="text-5xl font-black text-white mb-2">15 hrs</div>
                  <div className="text-emerald-100 font-medium">Saved per week on manual phone calls and scheduling</div>
                </div>
                <div className="bg-emerald-700/50 backdrop-blur-sm border border-emerald-500/30 p-8 rounded-3xl">
                  <div className="text-5xl font-black text-white mb-2">100%</div>
                  <div className="text-emerald-100 font-medium">Automated booking flow, working 24/7 for your clinic</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Trusted by Clinic Owners</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex gap-1 text-amber-400 mb-6">
                  <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-xl text-slate-700 italic mb-8 leading-relaxed">
                  "Before SitaLax, my receptionist spent 3 hours a day just calling patients to confirm appointments. Now, the WhatsApp bot does it automatically. Our no-shows dropped to almost zero."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">DR</div>
                  <div>
                    <div className="font-bold text-slate-900">Dr. Rajesh Sharma</div>
                    <div className="text-sm text-slate-500">Lead Dentist, Smile Care</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex gap-1 text-amber-400 mb-6">
                  <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-xl text-slate-700 italic mb-8 leading-relaxed">
                  "The 24/7 booking feature is a game changer. I wake up in the morning and see 3-4 new appointments booked overnight while the clinic was closed. Highly recommended!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">AK</div>
                  <div>
                    <div className="font-bold text-slate-900">Dr. Anita Kumar</div>
                    <div className="text-sm text-slate-500">Physiotherapist, CareClinic</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Ready to modernize your clinic?</h2>
            <p className="text-xl text-slate-600 mb-10">
              Join our exclusive early access program. Spots are limited as we onboard clinics with high-touch support.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-1"
              >
                Request Early Access
              </button>
              <Link 
                to="/login"
                className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-10 py-5 rounded-full font-bold text-lg hover:bg-emerald-100 transition-all"
              >
                View Live Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">SitaLax</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
              The all-in-one practice management and WhatsApp automation platform for modern clinics.
            </p>
            <div className="flex gap-4">
              <a href="mailto:Opssitalax@gmail.com" className="text-slate-400 hover:text-white transition-colors">Opssitalax@gmail.com</a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Product</h4>
            <ul className="space-y-4">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-400 transition-colors">Features</button></li>
              <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-400 transition-colors">How it Works</button></li>
              <li><button onClick={() => scrollToSection('roi')} className="hover:text-emerald-400 transition-colors">Pricing & ROI</button></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Interactive Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4">
              <li><button onClick={() => setIsModalOpen(true)} className="hover:text-emerald-400 transition-colors">Request Access</button></li>
              <li><a href="mailto:Opssitalax@gmail.com" className="hover:text-emerald-400 transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} SitaLax. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built for healthcare professionals.</p>
        </div>
      </footer>

      {/* Pre-book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-extrabold text-slate-900">Request Access</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8">
              {status === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h4 className="text-2xl font-extrabold text-slate-900 mb-3">Request Received!</h4>
                  <p className="text-slate-600 mb-8 text-lg">
                    Thank you! Our team will contact you shortly at <strong className="text-slate-900">{formData.email}</strong> to set up your account.
                  </p>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-slate-900 text-white px-4 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <p className="text-slate-600 mb-6 font-medium">
                    Leave your details below. We are currently onboarding clinics manually to ensure a perfect setup.
                  </p>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                      placeholder="Dr. Sarah Smith"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Clinic Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.clinicName}
                      onChange={e => setFormData({...formData, clinicName: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                      placeholder="Smile Care Dental"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                      placeholder="sarah@smilecare.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Expected Patient Volume (Optional)</label>
                    <select 
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                    >
                      <option value="">Select volume...</option>
                      <option value="1-50 patients/week">1-50 patients/week</option>
                      <option value="51-200 patients/week">51-200 patients/week</option>
                      <option value="200+ patients/week">200+ patients/week</option>
                    </select>
                  </div>

                  {status === 'error' && (
                    <div className="text-sm font-medium text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                      <Shield className="w-5 h-5 flex-shrink-0" />
                      Something went wrong. Please try again later or email us directly.
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-emerald-600 text-white px-4 py-4 rounded-xl font-extrabold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? 'Submitting...' : (
                      <>Submit Request <ChevronRight className="w-5 h-5" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
