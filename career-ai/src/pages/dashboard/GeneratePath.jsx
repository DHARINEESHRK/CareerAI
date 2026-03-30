import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Code, Lightbulb, Target, ShieldAlert, Zap, ChevronDown, CalendarDays } from 'lucide-react';

const GeneratePath = () => {
  const { generatePath, isLoading, paths } = useDashboard();
  const navigate = useNavigate();

  // Get user from local storage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { isPremium: false };

  // Limit check
  const isLimitReached = !user.isPremium && paths.length >= 2;

  const [formData, setFormData] = useState({ domain: '', skills: '', goal: '', completionDeadline: '' });
  const [error, setError] = useState('');
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const domainRef = useRef(null);

  const domainOptions = [
    'Software Engineering',
    'Data Science',
    'UI/UX Design',
    'Product Management',
    'Cybersecurity',
    'Digital Marketing'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLimitReached) return;
    setError('');

    try {
      await generatePath(formData);
      navigate('/dashboard/path');
    } catch (err) {
      setError(err.message || "Failed to generate path. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectDomain = (domain) => {
    if (domain === '__custom__') {
      setIsCustomDomain(true);
      setFormData((prev) => ({ ...prev, domain: customDomain.trim() }));
    } else {
      setIsCustomDomain(false);
      setCustomDomain('');
      setFormData((prev) => ({ ...prev, domain }));
    }
    setIsDomainOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (domainRef.current && !domainRef.current.contains(event.target)) {
        setIsDomainOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCustomDomain) {
      setFormData((prev) => ({ ...prev, domain: customDomain.trim() }));
    }
  }, [customDomain, isCustomDomain]);

  return (
    <div className="w-full flex justify-center py-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl glass-card rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl border-indigo-500/20"
      >
        {/* Background glow specific to this card */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[80px] pointer-events-none z-0"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-800 rounded-xl border border-cyan-500/30">
                <Sparkles size={24} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
                  AI Career Architect
                </h2>
                <p className="text-slate-400">Provide details to generate a customized strategy.</p>
              </div>
            </div>
            
            {isLimitReached && (
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                 <ShieldAlert size={16} className="text-amber-400" />
                 <span className="text-[10px] text-amber-200 font-bold uppercase tracking-widest leading-none">Limit reached (2/2)</span>
              </div>
            )}
          </div>

          {isLimitReached && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-6 mb-10 bg-indigo-600 rounded-2xl border border-white/20 shadow-xl overflow-hidden"
            >
               <h4 className="text-white font-black text-sm uppercase italic tracking-tight flex items-center gap-2 mb-2">
                  <Zap size={18} className="fill-current" /> Upgrade to Pro
               </h4>
               <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-4">
                  Free users are limited to 2 active AI Roadmaps. Upgrade to Pro for unlimited path generation and deep corporate insights.
               </p>
               <button 
                 onClick={() => navigate('/dashboard/profile')}
                 className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
               >
                  Get Unlimited Now
               </button>
            </motion.div>
          )}

          {error && (
            <div className="p-4 mb-6 text-sm text-red-500 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center justify-between">
              <p>{error}</p>
              {error.includes("Upgrade") && (
                <button 
                  onClick={() => navigate('/dashboard/profile')}
                  className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-all border border-red-500/30"
                >
                  Go to Upgrade
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-6 ${isLimitReached ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}>
            {/* Domain Field */}
            <div className="space-y-2 group" ref={domainRef}>
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Code size={16} className="text-indigo-400" /> Interested Domain
              </label>
              <input
                type="hidden"
                name="domain"
                required
                value={formData.domain}
                readOnly
              />

              <button
                type="button"
                onClick={() => setIsDomainOpen((prev) => !prev)}
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-3.5 px-4 text-left text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer group-hover:bg-slate-800/60 flex items-center justify-between"
              >
                <span className={`${formData.domain ? 'text-white' : 'text-slate-500'}`}>
                  {formData.domain || 'Select your primary field...'}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-cyan-400 transition-transform duration-300 ${isDomainOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isDomainOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="mt-2 overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-900/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(34,211,238,0.18)]"
                  >
                    <div className="max-h-64 overflow-y-auto">
                      {domainOptions.map((option, idx) => (
                        <motion.button
                          key={option}
                          type="button"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: idx * 0.03 }}
                          onClick={() => selectDomain(option)}
                          className={`w-full px-4 py-3 text-left text-sm transition-all ${formData.domain === option && !isCustomDomain
                            ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-200'
                            : 'text-slate-200 hover:bg-cyan-500/10 hover:text-white'
                            }`}
                        >
                          {option}
                        </motion.button>
                      ))}

                      <motion.button
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: domainOptions.length * 0.03 }}
                        onClick={() => selectDomain('__custom__')}
                        className={`w-full px-4 py-3 text-left text-sm border-t border-cyan-500/20 transition-all ${isCustomDomain
                          ? 'bg-gradient-to-r from-indigo-500/25 to-fuchsia-500/25 text-fuchsia-200'
                          : 'text-slate-200 hover:bg-indigo-500/15 hover:text-white'
                          }`}
                      >
                        ✨ Custom Domain (Type your own)
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isCustomDomain && (
                  <motion.input
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="Type your custom domain..."
                    className="w-full bg-slate-900/60 border border-fuchsia-500/40 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 transition-all"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Skills Field */}
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-400" /> Current Skills
              </label>
              <input 
                name="skills"
                type="text" 
                required
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. JavaScript, Python, Communication, Figma..."
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all group-hover:bg-slate-800/60"
              />
            </div>

            {/* Goal Field */}
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Target size={16} className="text-rose-400" /> Ultimate Goal
              </label>
              <textarea 
                name="goal"
                required
                value={formData.goal}
                onChange={handleChange}
                rows={3}
                placeholder="What exactly do you want to achieve? E.g., 'Become a Senior Frontend Dev at a FAANG company.'"
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all resize-none group-hover:bg-slate-800/60"
              />
            </div>

            {/* Completion Deadline Field */}
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <CalendarDays size={16} className="text-emerald-400" /> Target Completion Date
              </label>
              <input
                name="completionDeadline"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.completionDeadline}
                onChange={handleChange}
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all group-hover:bg-slate-800/60"
              />
              <p className="text-[11px] text-slate-500 font-medium italic">
                AI will use this deadline to recommend your daily learning hours.
              </p>
            </div>

            <button 
              type="submit"
              disabled={isLoading || isLimitReached}
              className={`w-full py-4 mt-8 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait relative overflow-hidden`}
            >
              {isLoading ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-[slide_1.5s_linear_infinite]"></div>
                  <Loader2 className="animate-spin" size={24} /> 
                  Generating Advanced Strategy...
                </>
              ) : isLimitReached ? (
                <>
                   Upgrade to Generate More
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  Assemble Career Path
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default GeneratePath;
