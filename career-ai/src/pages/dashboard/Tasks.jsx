import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import { useNavigate } from 'react-router-dom';
import { LayoutList, Check, Calendar, ArrowRight, Layers, Award, BrainCircuit, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const Tasks = () => {
  const { tasks, toggleTask, activePhase, isLoading, activePath, saveGeneratedPath, paths, setActivePath } = useDashboard();
  const navigate = useNavigate();
  const [isPreparingTasks, setIsPreparingTasks] = useState(false);
  const pathTilesRef = useRef(null);

  const scrollPathTiles = (direction) => {
    if (!pathTilesRef.current) return;
    const scrollAmount = 320;
    pathTilesRef.current.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const persistPreviewIfNeeded = async () => {
      if (!activePath?.isPreview) return;
      try {
        setIsPreparingTasks(true);
        await saveGeneratedPath();
      } catch (err) {
        console.error("Failed to prepare tasks for preview path:", err);
      } finally {
        setIsPreparingTasks(false);
      }
    };

    persistPreviewIfNeeded();
  }, [activePath, saveGeneratedPath]);

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
      case 'medium': return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
      case 'hard': return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
      default: return 'text-slate-400 border-slate-500/30 bg-slate-500/5';
    }
  };

  if ((isLoading || isPreparingTasks) && tasks.length === 0) {
    return <div className="p-12 text-center text-slate-400">Preparing your objectives...</div>;
  }

  if (tasks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center justify-center p-12 min-h-[60vh] flex-col"
      >
        <div className="p-4 rounded-full bg-slate-800 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)] mb-6">
          <LayoutList size={48} className="text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">No Active Tasks</h2>
        <p className="text-slate-400 max-w-lg text-center leading-relaxed text-lg mb-8">
          Your current phase is locked or has no tasks. Generate your career path first to get started!
        </p>
        <button 
          onClick={() => navigate('/dashboard/generate')}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-white flex items-center gap-3 transition-transform hover:scale-105 shadow-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
        >
          Generate Path <ArrowRight size={20} />
        </button>
      </motion.div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100) || 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full overflow-hidden pb-20">
      {paths.length > 1 && (
        <div className="mb-8 w-full overflow-hidden relative">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-[#020617] to-transparent z-10"></div>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#020617] to-transparent z-10"></div>

          {paths.length > 2 && (
            <button
              onClick={() => scrollPathTiles(-1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all"
              aria-label="Scroll tiles left"
            >
              <ChevronLeft size={14} />
            </button>
          )}

          <div ref={pathTilesRef} className="flex w-full flex-nowrap gap-3 overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {paths.map((p) => (
              <button
                key={p._id}
                onClick={() => setActivePath(p)}
                className={`flex-shrink-0 max-w-full flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                  activePath?._id === p._id
                    ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/40 text-slate-400 border-white/10 hover:text-slate-200 hover:border-slate-500 hover:bg-slate-900/70'
                }`}
              >
                <Layers size={13} />
                <span className="leading-tight text-left max-w-[320px] truncate">{p.title}</span>
              </button>
            ))}
          </div>

          {paths.length > 2 && (
            <button
              onClick={() => scrollPathTiles(1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all"
              aria-label="Scroll tiles right"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}

      <div className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-10 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <BrainCircuit size={20} />
             </div>
             <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest truncate">
              ACTIVE PHASE: {activePhase?.title || 'Unknown'}
            </h4>
          </div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 mb-4 tracking-tight">
            Elite Training & Tasks
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            {activePhase?.description || 'Focus on these specific actions to complete the current phase of your roadmap.'}
          </p>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="p-7 rounded-[2rem] glass-card border-2 border-white/5 w-full max-w-full xl:w-[380px] xl:flex-none shadow-2xl relative overflow-hidden group/progress bg-slate-900/40">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/progress:opacity-20 transition-all scale-150 rotate-12">
            <Award size={64} className="text-indigo-400" />
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Current Mastery</span>
            <span className="text-2xl font-black text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-4 bg-slate-950/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.5, ease: 'circOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 relative"
            >
               <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_3s_linear_infinite]"></div>
            </motion.div>
          </div>
           <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Activity size={14} />
               <span className="break-words">PHASE {activePhase?.order || 1} STATUS: {activePhase?.status.replace('-', ' ')}</span>
             </div>
             <span className="shrink-0 text-xs font-black text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded-md border border-indigo-500/10">{completedCount}/{tasks.length} COMPLETE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 w-full min-w-0">
        <AnimatePresence mode='popLayout'>
          {tasks.map((task, index) => (
            <motion.div 
              key={task._id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`w-full min-w-0 p-6 md:p-7 rounded-[1.5rem] glass-card transition-all duration-300 flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-5 md:gap-6 group/task hover:shadow-2xl border-2 ${
                task.completed 
                  ? 'bg-emerald-950/10 border-emerald-500/20' 
                  : 'bg-slate-900/20 border-white/5 hover:border-indigo-500/30'
              }`}
            >
              <button 
                onClick={() => toggleTask(task._id)}
                disabled={task.completed}
                className={`flex-shrink-0 w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 shadow-lg active:scale-90 ${
                  task.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-slate-950 rotate-[360deg]' 
                    : 'bg-slate-950 border-white/10 group-hover/task:border-indigo-400 group-hover/task:shadow-indigo-500/10'
                }`}
              >
                {task.completed ? <Check strokeWidth={4} size={22} /> : (
                   <div className="w-2 h-2 rounded-full bg-slate-700 group-hover/task:bg-indigo-400 transition-colors"></div>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-1.5 flex-wrap min-w-0">
                   <h4 className={`flex-1 min-w-[220px] text-xl font-bold transition-all duration-300 break-words ${
                    task.completed ? 'text-slate-500 line-through' : 'text-slate-100 group-hover/task:text-indigo-200'
                  }`}>
                    {task.title}
                  </h4>
                  
                  {/* Task Difficulty Badge */}
                  {task.difficulty && (
                    <span className={`shrink-0 text-[9px] px-2.5 py-0.5 rounded-full border font-black uppercase tracking-tighter ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty}
                    </span>
                  )}
                </div>
                
                {task.dueDate && (
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                    <Calendar size={13} className="text-slate-600" />
                    <span>Target Date: {formatDate(task.dueDate)}</span>
                  </div>
                )}
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {progressPercent === 100 && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="mt-16 p-10 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent border border-emerald-500/30 text-center relative overflow-hidden shadow-2xl"
         >
           {/* Celebration background elements */}
           <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>
           <Award size={64} className="text-emerald-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
           <h3 className="text-3xl font-black text-emerald-300 mb-3 tracking-tight">Objective Mastery Complete!</h3>
           <p className="text-slate-300 text-lg max-w-md mx-auto mb-8 font-medium">Extraordinary work. You've conquered every challenge in this phase. Your journey continues to higher peaks now.</p>
           <button 
             onClick={() => navigate('/dashboard/path')}
             className="px-10 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-all shadow-2xl shadow-emerald-500/30 scale-100 hover:scale-105 active:scale-95"
           >
             Proceed to Next Tier
           </button>
         </motion.div>
      )}
    </div>
  );
};

export default Tasks;
