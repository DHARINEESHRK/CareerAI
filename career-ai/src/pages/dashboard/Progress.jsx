import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import MarketAnalysis from '../../components/dashboard/MarketAnalysis';
import { Activity, BarChart3, TrendingUp, Zap, Target, Award, CheckCircle2 } from 'lucide-react';

const Progress = () => {
  const { marketTrends, tasks, progressData, isLoading } = useDashboard();

  // DERIVED DATA: Personal Completion Mastery
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks/tasks.length) * 100) : 0;

  // DERIVED DATA: Weekly Performance (Last 7 Days from progressData)
  const last7DaysTasks = progressData?.weekly ? progressData.weekly[3] : 0; // Get most recent week
  const momentumScore = progressData?.momentum || 0;

  const getMomentumColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-cyan-400';
    if (score >= 50) return 'from-amber-500 to-orange-400';
    return 'from-rose-500 to-red-400';
  };

  const getMomentumLabel = (score) => {
    if (score >= 80) return '🔥 Elite Velocity';
    if (score >= 50) return '⚡ Rising Momentum';
    return '📉 Low Activity';
  };

  if (isLoading && !progressData) return <div className="p-12 text-center text-slate-400">Syncing workforce data...</div>;

  return (
    <div className="w-full pb-20">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 mb-2">
            Intelligence Core
          </h1>
          <p className="text-slate-400 text-lg uppercase tracking-[0.2em] font-black text-xs opacity-80">Real-Time Performance Analytics</p>
        </div>

        {/* 7-DAY PERSONAL VELOCITY HUB */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-[2.5rem] glass-card border border-white/5 bg-slate-900/40 min-w-[350px] relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all rotate-12 scale-150">
             <TrendingUp size={80} />
          </div>
          
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Velocity Tracker</span>
             </div>
             <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${momentumScore >= 80 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                {getMomentumLabel(momentumScore)}
             </span>
          </div>

          <div className="space-y-6">
             <div className="flex items-end justify-between">
                <div>
                  <span className="text-5xl font-black text-white leading-none block">{momentumScore}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 block tracking-tighter">Performance Index</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400 leading-none block">{last7DaysTasks}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 block tracking-tighter">Tasks This Week</span>
                </div>
             </div>

             <div className="h-4 bg-slate-950/80 rounded-full overflow-hidden border border-white/5 shadow-inner p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${momentumScore}%` }}
                  transition={{ duration: 1.5, ease: 'circOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${getMomentumColor(momentumScore)} shadow-[0_0_15px_rgba(16,185,129,0.2)]`}
                ></motion.div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* WEEKLY SUMMARY ENHANCEMENT */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 p-8 rounded-[2rem] bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/20 flex items-center gap-6"
      >
        <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
          <Award size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Weekly Performance Summary</h3>
          <p className="text-slate-400">
            You completed <span className="text-indigo-300 font-black">{last7DaysTasks} tasks</span> this week — 
            {last7DaysTasks >= 5 ? " that's an above-average performance! You're outstripping industry benchmarks." : " keep focused on your daily targets to hit elite velocity."}
          </p>
        </div>
      </motion.div>

      {/* MARKET INTELLIGENCE HUB */}
      <section className="mt-20">
        <div className="flex items-center gap-4 mb-10">
           <div className="p-4 rounded-[1.5rem] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BarChart3 size={28} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Market Positioning Matrix</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Industry Standards & Real-Time Earning Potential</p>
           </div>
        </div>
        <MarketAnalysis />
      </section>

      {/* ANALYTICS INSIGHTS */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12">
         <motion.div 
           whileHover={{ y: -10 }}
           className="p-10 rounded-[3.5rem] bg-slate-950/40 border border-indigo-500/10 group relative overflow-hidden backdrop-blur-xl"
         >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
               <CheckCircle2 size={100} />
            </div>
            <Target size={40} className="text-indigo-400 mb-8 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Objective Mastery</h3>
            <p className="text-slate-400 leading-relaxed text-lg">
              You have successfully finalized <span className="text-indigo-400 font-black">{progressPercent}%</span> of your targeted objectives. 
              {progressPercent > 70 ? " Your profile is currently hitting 'High Suitability' for tier-1 tech recruitment." : " Accelerate your daily output to reach your 100% phase target."}
            </p>
         </motion.div>

         <motion.div 
           whileHover={{ y: -10 }}
           className="p-10 rounded-[3.5rem] bg-slate-950/40 border border-purple-500/10 group relative overflow-hidden backdrop-blur-xl"
         >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
               <TrendingUp size={100} />
            </div>
            <Zap size={40} className="text-purple-400 mb-8 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Career Momentum</h3>
            <p className="text-slate-400 leading-relaxed text-lg">
              Your velocity index of <span className="text-purple-400 font-black">{momentumScore}</span> aligns with the performance of 
              <span className="text-purple-300 font-bold"> top-tier developers</span> globally. Maintaining this streak is crucial for exponential skill growth.
            </p>
         </motion.div>
      </div>
    </div>
  );
};

export default Progress;
