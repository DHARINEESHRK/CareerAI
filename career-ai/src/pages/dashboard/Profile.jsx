import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Briefcase, Calendar, Star, Edit3, Save, X, Camera, Shield, Loader2, Crown, CheckCircle2, Zap, Target, Award } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { jsPDF } from 'jspdf';

const DEMO_PLAN_NAME = 'Premium';
const DEMO_PLAN_AMOUNT = 199;

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentIntentKey, setPaymentIntentKey] = useState('');
  const [paymentError, setPaymentError] = useState('');
  
  // Get User Data from localStorage
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profilePicture: '',
    phone: '',
    role: 'Explorer',
    domain: '',
    skills: '',
    goal: '',
    joined: '',
    isPremium: false,
    premiumExpiry: null
  });

  const [editData, setEditData] = useState({ ...profileData });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await apiFetch("http://localhost:5000/api/user/profile");
      if (!response) return; 
      
      const data = await response.json();
      if (response.ok) {
        const formattedData = {
          name: data.name,
          email: data.email,
          profilePicture: data.profilePicture || '',
          phone: data.phone || '',
          role: data.role || 'Explorer',
          domain: data.domain || '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          goal: data.goal || '',
          joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
          isPremium: data.isPremium,
          premiumExpiry: data.premiumExpiry
        };
        setProfileData(formattedData);
        setEditData(formattedData);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const downloadInvoicePdf = ({ name, email, paymentId, amount, createdAt }) => {
    const doc = new jsPDF();
    const paidOn = createdAt ? new Date(createdAt) : new Date();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CareerAI Invoice', 20, 24);

    doc.setDrawColor(180, 180, 180);
    doc.line(20, 30, 190, 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`User Name: ${name || 'N/A'}`, 20, 45);
    doc.text(`User Email: ${email || 'N/A'}`, 20, 55);
    doc.text(`Payment ID: ${paymentId}`, 20, 65);
    doc.text(`Amount: ₹${amount}`, 20, 75);
    doc.text('Status: Paid', 20, 85);
    doc.text(`Date & Time: ${paidOn.toLocaleString()}`, 20, 95);

    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text('Thank you for upgrading to CareerAI Premium.', 20, 115);
    doc.text('This is a demo invoice generated for showcase purposes.', 20, 122);

    doc.save(`CareerAI_Invoice_${paymentId}.pdf`);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("http://localhost:5000/api/user/profile", {
        method: "POST",
        body: JSON.stringify({
          phone: editData.phone,
          domain: editData.domain,
          skills: editData.skills,
          goal: editData.goal
        })
      });
      if (!response) return;
      
      const data = await response.json();
      if (response.ok) {
        setProfileData({ ...editData });
        localStorage.setItem('user', JSON.stringify(data));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (isUpgrading) return;
    setPaymentError('');
    setPaymentIntentKey(`demo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
    setIsPaymentModalOpen(true);
  };

  const handleDemoPayNow = async () => {
    if (isUpgrading) return;
    setIsUpgrading(true);
    setPaymentError('');

    try {
      await wait(2000);

      const response = await apiFetch('/subscription/pay-demo', {
        method: 'POST',
        body: JSON.stringify({
          amount: DEMO_PLAN_AMOUNT,
          idempotencyKey: paymentIntentKey,
        }),
      });

      if (!response) return;

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Payment failed. Please try again.');
      }

      const updatedUser = data.user || {};
      localStorage.setItem('user', JSON.stringify(updatedUser));

      const updatedProfile = {
        ...profileData,
        isPremium: true,
        premiumExpiry: updatedUser.premiumExpiry || profileData.premiumExpiry,
      };
      setProfileData(updatedProfile);
      setEditData(updatedProfile);
      setIsPaymentModalOpen(false);

      alert('Payment successful! Premium unlocked. Invoice download has started.');

      downloadInvoicePdf({
        name: updatedUser.name || profileData.name,
        email: updatedUser.email || profileData.email,
        paymentId: data.paymentId,
        amount: data?.payment?.amount || DEMO_PLAN_AMOUNT,
        createdAt: data?.payment?.createdAt,
      });
    } catch (err) {
      console.error('Upgrade failed', err);
      setPaymentError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const getBadgeColor = (index) => {
    const colors = [
      'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    ];
    return colors[index % colors.length];
  };

  const skillsArray = profileData.skills.split(',').map(s => s.trim()).filter(s => s);

  return (
    <div className="w-full pb-10">
      
      {/* Top Banner & Avatar Section */}
      <div className="relative mb-8 pt-8">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-cyan-900/40 rounded-3xl border border-white/5 overflow-hidden">
        </div>

        <div className="relative px-8 pt-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full border-4 border-[#020617] bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/20 overflow-hidden">
                {profileData.profilePicture ? (
                  <img src={profileData.profilePicture} alt={profileData.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={56} className="text-white drop-shadow-md" />
                )}
              </div>
              {profileData.isPremium && (
                <div className="absolute -top-1 -right-1 p-2 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full border-2 border-[#020617] shadow-lg">
                  <Crown size={16} className="text-white" />
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">{profileData.name}</h1>
                {profileData.isPremium && (
                  <span className="px-3 py-1 bg-yellow-400 text-black text-[10px] font-black rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(250,204,21,0.4)]">PRO</span>
                )}
              </div>
              <p className="text-indigo-400 font-medium mt-1 uppercase tracking-widest text-xs font-black opacity-70">{profileData.role}</p>
            </div>
          </div>

          {!isEditing && activeTab === 'Overview' && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-xl text-white font-medium transition-all hover:border-indigo-400 shadow-lg"
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 mb-8 px-4">
        {['Overview', 'Premium Subscription'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 font-medium text-sm transition-all relative ${
              activeTab === tab ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTabProfile" 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400" 
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'Overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="space-y-8 lg:col-span-1">
              <div className="glass-card rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <User size={18} />
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight uppercase">User Identity</h3>
                </div>
                <div className="space-y-6 text-sm">
                  {isEditing ? (
                    <div className="space-y-4">
                       <div>
                          <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Display Name</label>
                          <input type="text" name="name" value={editData.name} onChange={handleChange} className="w-full bg-slate-900 border border-white/5 rounded-lg p-2.5 text-white focus:border-indigo-500 transition-colors" />
                       </div>
                       <div>
                          <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Phone</label>
                          <input type="text" name="phone" value={editData.phone} onChange={handleChange} className="w-full bg-slate-900 border border-white/5 rounded-lg p-2.5 text-white focus:border-indigo-500 transition-colors" />
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="group/field">
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5 block opacity-50 group-hover/field:opacity-100 transition-opacity">Full Name</label>
                        <p className="text-slate-200 font-bold uppercase tracking-tight">{profileData.name}</p>
                      </div>
                      <div className="group/field">
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5 block opacity-50 group-hover/field:opacity-100 transition-opacity">Email Address</label>
                        <p className="text-slate-400 font-medium lowercase flex items-center gap-2"><Mail size={12} className="opacity-50" /> {profileData.email}</p>
                      </div>
                      <div className="group/field">
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5 block opacity-50 group-hover/field:opacity-100 transition-opacity">Contact Anchor</label>
                        <p className="text-slate-400 font-medium italic">{profileData.phone || 'No phone linked'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-indigo-500/5 to-transparent border border-white/5 shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <Shield size={18} className="text-emerald-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Growth Plan</h4>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={12} /> Joined
                        </span>
                        <span className="text-xs font-black text-indigo-400 tracking-tighter">{profileData.joined}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                           <Star size={12} /> Status
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black rounded-md">VERIFIED</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                <div className="flex items-center gap-5 mb-12">
                  <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
                    <Briefcase size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Professional Intelligence</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] opacity-60">Strategic Bio & Career Trajectory</p>
                  </div>
                </div>
                
                <div className="space-y-12">
                  <div className="relative">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-4 block">Primary Domain Focus</label>
                    {isEditing ? (
                      <input type="text" name="domain" value={editData.domain} onChange={handleChange} className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold focus:border-purple-500 transition-all shadow-inner" />
                    ) : (
                      <div className="p-6 rounded-[1.5rem] bg-indigo-500/5 border border-white/5 text-xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        {profileData.domain || 'Field Not Specified'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-4 block">Technical Expertise Matrix</label>
                    {isEditing ? (
                      <input type="text" name="skills" value={editData.skills} onChange={handleChange} placeholder="e.g. React, AI Architecture, Node.js" className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold focus:border-purple-500 transition-all shadow-inner" />
                    ) : (
                      <div className="flex flex-wrap gap-3">
                         {skillsArray.length > 0 ? skillsArray.map((s, i) => (
                           <span key={i} className={`px-5 py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 hover:shadow-lg cursor-default ${getBadgeColor(i).replace('bg-opacity-20', 'bg-opacity-10')}`}>{s}</span>
                         )) : <span className="text-slate-600 text-[10px] font-black italic">Matrix Empty</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-4 block">North Star Strategic Goal</label>
                    {isEditing ? (
                      <textarea name="goal" value={editData.goal} onChange={handleChange} rows={5} className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-5 text-white font-medium resize-none focus:border-purple-500 transition-all shadow-inner" />
                    ) : (
                      <div className="relative">
                         <p className="p-8 rounded-[2rem] bg-slate-950/60 border border-indigo-500/10 text-slate-300 font-medium italic leading-relaxed text-lg shadow-inner">
                           "{profileData.goal || 'Define your destination to generate a tactical roadmap.'}"
                         </p>
                         <div className="absolute top-2 right-4 text-slate-800 font-black text-4xl opacity-20 group-hover:opacity-40 select-none">"</div>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-16 flex items-center justify-end gap-6 pt-10 border-t border-white/5">
                    <button onClick={handleCancel} className="px-8 py-4 font-black text-[10px] text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all flex items-center gap-2">
                       <X size={14} /> Abort Sync
                    </button>
                    <button onClick={handleSave} disabled={isLoading} className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[1.25rem] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transform active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3">
                      {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      {isLoading ? "Synchronizing..." : "Finalize Protocol"}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="premium" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 1.02 }}
            className="max-w-4xl mx-auto"
          >
            <div className={`p-12 rounded-[3.5rem] glass-card border-2 transition-all duration-700 relative overflow-hidden ${profileData.isPremium ? 'border-yellow-500/30' : 'border-white/5'}`}>
               <div className="flex flex-col lg:flex-row gap-16 items-center relative z-10">
                  <div className="flex-1">
                     <div className="flex items-center gap-6 mb-8">
                        <Crown size={56} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Elite <br/> Protocol</h2>
                     </div>
                     <p className="text-slate-400 text-xl mb-12 leading-relaxed font-medium tracking-tight">Break the 2-path boundary and unlock the full inference capability of our deep-tier AI Architect.</p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-12">
                        {["Unlimited Strategic Paths", "Priority NVIDIA Inference", "Real-Time Demand Mapping", "Private Career Ledger", "Elite Performance Visualization", "24/7 Priority Support"].map((f, i) => (
                          <div key={i} className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group/feature">
                             <div className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 group-hover/feature:bg-emerald-500 text-emerald-400 group-hover/feature:text-black transition-all">
                                <CheckCircle2 size={12} />
                             </div>
                             {f}
                          </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="w-full lg:w-[350px] p-12 rounded-[3rem] bg-slate-900/60 border border-white/5 text-center shadow-2xl relative overflow-hidden group/card backdrop-blur-3xl">
                     <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400/50 to-amber-600/50"></div>
                     {profileData.isPremium ? (
                        <>
                           <div className="w-20 h-20 rounded-[2rem] bg-yellow-400/10 flex items-center justify-center mx-auto mb-8 shadow-inner border border-yellow-400/20">
                              <Zap size={40} className="text-yellow-400 shadow-glow" />
                           </div>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 block">Network Status</span>
                           <h4 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">Pro active</h4>
                           <div className="w-12 h-1 bg-yellow-400 mx-auto mb-8 rounded-full"></div>
                           <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">Valid Protocol Until</p>
                           <p className="text-lg font-black text-yellow-400 tracking-tighter">{new Date(profileData.premiumExpiry).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </>
                     ) : (
                        <>
                           <div className="flex flex-col mb-12">
                              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-4">Base Enrollment</span>
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-6xl font-black text-white tracking-tighter">₹2k</span>
                                <span className="text-slate-500 font-bold uppercase text-xs">/ Mo</span>
                              </div>
                           </div>
                           
                           <button 
                             onClick={handleUpgrade} 
                             disabled={isUpgrading} 
                             className="w-full py-6 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-[1.5rem] text-black font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(250,204,21,0.3)] hover:shadow-[0_0_40px_rgba(250,204,21,0.5)] transform active:scale-[0.97] disabled:opacity-50 transition-all relative overflow-hidden group/btn"
                           >
                              <span className="relative z-10 flex items-center justify-center gap-3">
                              {isUpgrading ? 'Processing...' : <>Ascend to Pro <Award size={18} /></>}
                              </span>
                              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                           </button>
                           <p className="mt-8 text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] leading-relaxed">Secured via encrypted <br/> global workforce gateway.</p>
                        </>
                     )}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaymentModalOpen && !profileData.isPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl p-8"
            >
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">Confirm Upgrade</h3>
              <p className="text-slate-400 text-sm mb-6">Complete your demo payment to unlock premium features.</p>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs uppercase tracking-widest font-black">Plan</span>
                  <span className="text-white font-black uppercase tracking-wider">{DEMO_PLAN_NAME}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs uppercase tracking-widest font-black">Price</span>
                  <span className="text-yellow-400 text-2xl font-black tracking-tight">₹{DEMO_PLAN_AMOUNT}</span>
                </div>
              </div>

              {paymentError && (
                <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-200 text-xs font-semibold">
                  {paymentError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => !isUpgrading && setIsPaymentModalOpen(false)}
                  disabled={isUpgrading}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDemoPayNow}
                  disabled={isUpgrading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-black font-black uppercase tracking-wide transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
