import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckCircle2, CircleDashed, Circle, ArrowRight, Layers, TrendingUp, Zap, Flame, ShieldAlert, Sparkles, Trash2, ChevronLeft, ChevronRight, CalendarDays, Clock3 } from 'lucide-react';

const Path = () => {
  const { paths, activePath, setActivePath, isLoading, saveGeneratedPath, deletePath } = useDashboard();
  const navigate = useNavigate();
  const [isSavingPreview, setIsSavingPreview] = useState(false);
  const [isDeletingPath, setIsDeletingPath] = useState(false);
  const pathCarouselRef = useRef(null);

  // Get user from local storage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { isPremium: false };

  // Limit check
  const isLimitReached = !user.isPremium && paths.length >= 2;
  const allTiersCompleted = Boolean(activePath?.phases?.length) && activePath.phases.every((phase) => phase.status === 'completed');

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="text-emerald-400" size={24} />;
      case 'in-progress': return <CircleDashed className="text-cyan-400 animate-spin-slow" size={24} />;
      default: return <Circle className="text-slate-600" size={24} />;
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'completed': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'in-progress': return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 glow glow-cyan-500/30';
      default: return 'bg-slate-800/50 border-slate-700 text-slate-400';
    }
  };

  const getDemandColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const handleFocusTask = async () => {
    if (isSavingPreview) return;

    try {
      if (activePath?.isPreview) {
        setIsSavingPreview(true);
        await saveGeneratedPath();
      }
      navigate('/dashboard/tasks');
    } catch (err) {
      console.error("Failed to save generated roadmap:", err);
    } finally {
      setIsSavingPreview(false);
    }
  };

  const handleDeletePath = async () => {
    if (!activePath?._id || isDeletingPath) return;

    const shouldDelete = window.confirm("Delete this roadmap and all related tasks?");
    if (!shouldDelete) return;

    try {
      setIsDeletingPath(true);
      await deletePath(activePath._id);
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
    } finally {
      setIsDeletingPath(false);
    }
  };

  const scrollPathCards = (direction) => {
    if (!pathCarouselRef.current) return;
    const scrollAmount = 282; // card width + gap
    pathCarouselRef.current.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth',
    });
  };

  if (isLoading && paths.length === 0 && !activePath) {
    return <div className="p-12 text-center text-slate-400 font-medium italic animate-pulse">Synchronizing your AI roadmap...</div>;
  }

  if (paths.length === 0 && !activePath) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center justify-center p-12 min-h-[60vh] flex-col"
      >
        <div className="p-4 rounded-full bg-slate-800 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-6">
          <Compass size={48} className="text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4">No Path Detected</h2>
        <p className="text-slate-400 max-w-lg text-center leading-relaxed text-lg mb-8 italic">
          "The future is unwritten. Tell our AI about your interests to generate a high-fidelity timeline for your career transformation."
        </p>
        <button 
          onClick={() => navigate('/dashboard/generate')}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 shadow-indigo-500/20"
        >
          Generate Path <ArrowRight size={20} className="inline-block" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full pb-20 overflow-x-hidden">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
            Your Career Roadmap
          </h1>
          <p className="text-slate-400 text-lg font-medium italic">High-fidelity trajectory mapped to Industry 4.0 trends.</p>
          {activePath?.completionDeadline && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-[11px] font-black uppercase tracking-widest">
                <CalendarDays size={14} /> Deadline: {new Date(activePath.completionDeadline).toLocaleDateString()}
              </span>
              {Number.isFinite(Number(activePath?.recommendedDailyHours)) && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-[11px] font-black uppercase tracking-widest">
                  <Clock3 size={14} /> {Number(activePath.recommendedDailyHours).toFixed(1)} hrs/day
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Upgrade Banner for Free Users at Limit */}
        {isLimitReached && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-gradient-to-r from-indigo-600 TO-indigo-800 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden group cursor-pointer"
            onClick={() => navigate('/dashboard/profile')}
          >
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={100} className="text-white" />
             </div>
             <div className="relative z-10 flex items-center gap-4">
                <div className="flex flex-col">
                   <span className="text-white font-black text-[10px] uppercase tracking-widest leading-none mb-1">PRO RESTRICTION (2/2)</span>
                   <span className="text-indigo-200 text-sm font-bold italic">Upgrade for unlimited AI paths & premium discovery.</span>
                </div>
                <button className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-transform group-hover:scale-105 active:scale-95">
                   Upgrade
                </button>
             </div>
          </motion.div>
        )}

        {/* Path Cards Carousel */}
        {paths.length > 0 && (
          <div className="relative w-full max-w-[552px] overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-[#020617] to-transparent z-10"></div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#020617] to-transparent z-10"></div>

            {paths.length > 2 && (
              <button
                onClick={() => scrollPathCards(-1)}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all"
                aria-label="Scroll paths left"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <div
              ref={pathCarouselRef}
              className="flex flex-nowrap gap-3 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {paths.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setActivePath(p)}
                  className={`w-[270px] flex-shrink-0 snap-start flex items-center gap-2 px-6 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${
                    activePath?._id === p._id
                      ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-xl shadow-indigo-500/20'
                      : 'bg-slate-900/50 text-slate-400 border-white/5 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <Layers size={14} />
                  <span className="text-left leading-tight truncate">{p.title}</span>
                </button>
              ))}
            </div>

            {paths.length > 2 && (
              <button
                onClick={() => scrollPathCards(1)}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all"
                aria-label="Scroll paths right"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {activePath?._id && (
        <div className="mb-8 flex justify-end">
          <button
            onClick={handleDeletePath}
            disabled={isDeletingPath}
            className="px-8 py-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-black transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-60"
          >
            <Trash2 size={18} />
            {isDeletingPath ? 'Deleting...' : 'Delete Path'}
          </button>
        </div>
      )}

      <div className="relative border-l-2 border-slate-800/50 ml-6 pb-6 space-y-12">
        {activePath?.phases.map((phase, index) => (
          <motion.div 
            key={phase._id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="ml-10 relative group"
          >
            {/* Timeline dot/icon */}
            <span className="absolute -left-[3.25rem] top-4 bg-slate-950 rounded-full border border-white/10 shadow-2xl z-10 transition-transform group-hover:scale-110">
              {getStatusIcon(phase.status)}
            </span>
            
            {/* Line Glow effect on active */}
            {phase.status === 'in-progress' && (
               <div className="absolute -left-[2.1rem] top-10 w-0.5 h-full bg-gradient-to-b from-cyan-400/80 via-indigo-400/50 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.4)] z-0"></div>
            )}

            <div className={`p-10 rounded-[3rem] glass-card transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-2 ${phase.status === 'in-progress' ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 bg-slate-900/10'}`}>
              <div className="lg:flex lg:items-start lg:justify-between gap-10">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <h3 className="text-3xl font-black text-white italic group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{phase.title}</h3>
                    
                    <span className={`text-[9px] px-4 py-1.5 rounded-full border font-black tracking-[0.2em] uppercase flex items-center gap-2 ${getDemandColor(phase.demandLevel)} shadow-xl shadow-current/5`}>
                      {phase.demandLevel === 'High' && <Flame size={12} className="fill-current" />}
                      {phase.demandLevel} Demand
                    </span>

                    <span className={`text-[9px] px-4 py-1.5 rounded-full border font-black tracking-[0.2em] uppercase ${getStatusStyle(phase.status)}`}>
                      {phase.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium italic">"{phase.description}"</p>

                  {/* Trend Insight Section */}
                  {phase.trendInsight && (
                    <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-5 shadow-inner group/trend group-hover:bg-indigo-500/10 transition-all">
                      <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Market Catalyst</h4>
                        <p className="text-slate-400 text-sm leading-relaxed italic">{phase.trendInsight}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-10 lg:mt-0 flex flex-col gap-4 min-w-[180px]">
                  {phase.status === 'in-progress' && (
                   <button 
                    onClick={handleFocusTask}
                    disabled={isSavingPreview}
                    className="w-full px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/20 active:scale-95 text-xs uppercase tracking-widest"
                   >
                    <Zap size={20} className="fill-current" />
                    {isSavingPreview ? 'Saving...' : 'Focus Task'}
                   </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {allTiersCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-14 p-8 rounded-[2.5rem] border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-300 mb-2">Path Completed</p>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tight mb-2">Job Matches Unlocked</h3>
              <p className="text-slate-300 text-base leading-relaxed">You completed every tier in this roadmap. Move to Job Matches to discover roles aligned with your completed path.</p>
            </div>

            <button
              onClick={() => navigate('/dashboard/jobs')}
              className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95"
            >
              View Job Matches <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Bottom link to Progress */}
      <motion.div 
        whileHover={{ x: 15 }}
        onClick={() => navigate('/dashboard/progress')}
        className="mt-20 flex items-center gap-6 text-indigo-400 font-black cursor-pointer group"
      >
         <div className="w-12 h-12 rounded-full border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/10 transition-all shadow-xl">
            <TrendingUp size={24} />
         </div>
         <span className="text-xl italic uppercase tracking-tighter">View Detailed Momentum & Intelligence Matrix</span>
         <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform" />
      </motion.div>
    </div>
  );
};

export default Path;
