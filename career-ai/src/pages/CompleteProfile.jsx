import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Briefcase, Star, Target, Loader2, Sparkles } from 'lucide-react';
import { apiFetch } from '../utils/api';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    domain: '',
    skills: '',
    goal: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name || user.email) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        domain: user.domain || prev.domain,
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || prev.skills),
        goal: user.goal || prev.goal
      }));
    } else {
      // If no user in local storage, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiFetch("/user/profile", {
        method: "POST",
        body: JSON.stringify({
          phone: formData.phone,
          domain: formData.domain,
          skills: formData.skills,
          goal: formData.goal
        })
      });
      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local storage with full user data
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate completion percentage
  const fields = ['phone', 'domain', 'skills', 'goal'];
  const completedFields = fields.filter(f => formData[f].trim() !== '').length;
  const progress = Math.round((completedFields / fields.length) * 100);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[100px] animate-pulse-slow"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl glass-card rounded-2xl p-8 md:p-10 relative overflow-hidden my-12"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Sparkles className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-slate-400">Help us personalize your career journey</p>
          
          {/* Progress Bar */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completion Progress</span>
              <span className="text-xs font-bold text-indigo-400">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              ></motion.div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-500 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <User size={14} className="text-slate-500" /> Full Name
            </label>
            <input 
              type="text" 
              value={formData.name}
              disabled
              className="w-full bg-slate-900/30 border border-slate-800 rounded-xl py-3 px-4 text-slate-500 cursor-not-allowed italic"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Mail size={14} className="text-slate-500" /> Email Address
            </label>
            <input 
              type="email" 
              value={formData.email}
              disabled
              className="w-full bg-slate-900/30 border border-slate-800 rounded-xl py-3 px-4 text-slate-500 cursor-not-allowed italic"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Phone size={14} className="text-indigo-400" /> Phone Number
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Briefcase size={14} className="text-purple-400" /> Interested Domain
            </label>
            <input 
              type="text" 
              name="domain"
              required
              value={formData.domain}
              onChange={handleChange}
              placeholder="e.g. Data Science, Web Dev"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Star size={14} className="text-cyan-400" /> Current Skills
            </label>
            <input 
              type="text" 
              name="skills"
              required
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, Python, AWS (comma separated)"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Target size={14} className="text-rose-400" /> Professional Goal
            </label>
            <textarea 
              name="goal"
              required
              value={formData.goal}
              onChange={handleChange}
              rows={3}
              placeholder="Tell us what you want to achieve..."
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-inner resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading || progress < 50}
            className="w-full py-4 mt-4 md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Finalize My Path
                <Sparkles size={18} className="group-hover:animate-bounce" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
