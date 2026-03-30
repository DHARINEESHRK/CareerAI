import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Target, ExternalLink, Globe, Award, Rocket, Code2, Layers, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { generateJobLinks } from '../../utils/jobLinks';
import { DOMAIN_ROLES } from '../../utils/domainRoles';
import { getProjects } from '../../utils/projectRecommendations';

const Jobs = () => {
  const navigate = useNavigate();
  const { activePath, tasks } = useDashboard();
  const [readiness, setReadiness] = useState(0);
   const isPathCompleted = Boolean(activePath?.phases?.length) && activePath.phases.every((phase) => phase.status === 'completed');

  // 1. Calculate Overall Readiness
  useEffect(() => {
    if (tasks.length > 0) {
      const completedCount = tasks.filter(t => t.completed).length;
      setReadiness(Math.min(100, (completedCount / tasks.length) * 100));
    } else {
      setReadiness(0);
    }
  }, [tasks]);

  // 2. Role Matching Intelligence
  const roles = useMemo(() => {
    if (!activePath) return [];

    const domain = (activePath.domain || "Software Engineering").toLowerCase();
    let matchedRoles = DOMAIN_ROLES[domain] || [];
    
    if (matchedRoles.length === 0) {
       const keys = Object.keys(DOMAIN_ROLES);
       const closest = keys.find(k => domain.includes(k) || k.includes(domain));
       matchedRoles = closest ? DOMAIN_ROLES[closest] : ["Software Engineer", "Frontend Developer", "Backend Developer"];
    }

    const completedTasksCount = tasks.filter(t => t.completed).length;
    const taskDelta = tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0;

    return matchedRoles.map((roleName, idx) => {
      // 60/25/15 scoring logic
      const skillScore = idx === 0 ? 82 : 72; 
      const totalScore = Math.round((skillScore * 0.60) + (taskDelta * 0.25) + 15);
      const links = generateJobLinks(roleName);

      return {
        title: roleName,
        score: totalScore,
        links,
        id: idx
      };
    }).sort((a, b) => b.score - a.score).slice(0, 6);
  }, [activePath, tasks]);

  // 3. Project Recommendations (Domain Based)
  const recommendations = useMemo(() => {
     if (!activePath) return [];
     return getProjects(activePath.domain || "");
  }, [activePath]);

  // Fallback if no active path
  if (!activePath) {
    return (
      <div className="flex flex-col w-full min-h-screen p-6 md:p-8 items-center justify-center text-center">
        <Briefcase size={48} className="text-indigo-400 mb-6 animate-pulse" />
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Discovery Engine Restricted</h2>
        <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto mb-8 italic uppercase tracking-widest">
          The Career Engine requires active path data to analyze domain opportunities.
        </p>
        <button 
          onClick={() => navigate('/dashboard/generate')}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95"
        >
           Start My Career Transformation
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* SECTION: Page Header Consistency */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Job Opportunities</h1>
        <p className="text-[12px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Explore the high-fidelity professional roles based on your skills</p>
      </div>

         {isPathCompleted ? (
            <>
               {/* SECTION 1: Smart Recommendation (Small Card) */}
               <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-12 p-8 glass-card border border-indigo-500/30 rounded-[2.5rem] bg-indigo-500/5 hover:bg-indigo-500/10 transition-all flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group shadow-indigo-500/10"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all -rotate-12">
                     <Rocket size={120} className="text-white" />
                  </div>
                  <div className="flex-1 relative z-10">
                     <div className="flex items-center gap-3 mb-4">
                        <span className="px-4 py-1.5 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/20">Elite Match Detected</span>
                        <Award size={16} className="text-indigo-400" />
                     </div>
                     <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">{roles[0]?.title}</h2>
                     <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl italic">
                        "Foundational <strong>{activePath.domain}</strong> skills detected with a sector match score of <strong>{roles[0]?.score}%</strong>. Focus on immediate project milestones to reach Elite compatibility status for global placements."
                     </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10 min-w-[300px]">
                     <button 
                        onClick={() => window.open(roles[0]?.links.linkedin, "_blank")} 
                        className="flex-1 px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all shadow-3xl active:scale-95 flex items-center justify-center gap-2"
                     >
                        View on LinkedIn <ExternalLink size={14} />
                     </button>
                     <button 
                        onClick={() => navigate('/dashboard/tasks')} 
                        className="flex-1 px-8 py-4 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95 flex items-center justify-center gap-2"
                     >
                        Audit Skills <Search size={14} />
                     </button>
                  </div>
               </motion.div>

               {/* SECTION 2: Job Roles Grid (Compact & Pro) */}
               <div className="mb-20">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Briefcase size={20} className="text-indigo-400" />
                     </div>
                     <h3 className="text-[12px] text-slate-500 font-black uppercase tracking-[0.4em]">Sector Placement Opportunities</h3>
                  </div>
            
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {roles.map((job, index) => (
                        <motion.div
                           key={job.id}
                           initial={{ opacity: 0, scale: 0.98 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: index * 0.05 }}
                           className="p-8 glass-card border border-white/5 hover:border-indigo-500/30 rounded-[2.5rem] flex flex-col justify-between transition-all group shadow-xl hover:shadow-indigo-500/5 h-full"
                        >
                           <div className="flex justify-between items-start mb-10">
                              <div className="flex-1 mr-4">
                                 <h4 className="text-xl font-black text-white italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors uppercase leading-[0.9]">{job.title}</h4>
                                 <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block mt-3 underline decoration-indigo-500/20">Matched Industry Role</span>
                              </div>
                              <div className="text-right">
                                 <div className="text-2xl font-black text-white italic leading-none">{job.score}%</div>
                                 <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest mt-1 block">Sector Match</span>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 mt-auto">
                              <button 
                                 onClick={() => window.open(job.links.linkedin, "_blank")} 
                                 className="py-3.5 bg-white/5 border border-white/10 hover:bg-white hover:text-black text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                              >
                                 LinkedIn
                              </button>
                              <button 
                                 onClick={() => window.open(job.links.unstop, "_blank")} 
                                 className="py-3.5 bg-white/5 border border-white/10 hover:bg-indigo-600 hover:text-white text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                              >
                                 Unstop
                              </button>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </div>
            </>
         ) : (
            <div className="mb-16 p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-300 text-xs font-black uppercase tracking-widest">
               Complete all tiers in your active path to unlock recommended jobs.
            </div>
         )}

      {/* SECTION 3: Project Recommendations */}
      <div className="mt-12 pt-20 border-t border-white/5">
         <div className="flex items-center gap-5 mb-12">
            <div className="p-4 bg-emerald-500/10 rounded-2xl">
               <Layers size={21} className="text-emerald-400" />
            </div>
            <div>
               <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Recommended Projects</h2>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Accelerate placement strength with practical challenges.</p>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {recommendations.map((project, pi) => (
               <motion.div
                 key={pi}
                 whileHover={{ y: -8 }}
                 className="p-10 bg-black/40 border border-white/5 hover:border-emerald-500/20 rounded-[3rem] flex flex-col justify-between transition-all group relative overflow-hidden backdrop-blur-xl h-full shadow-2xl"
               >
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.08] transition-all rotate-12">
                    <Code2 size={120} className="text-white" />
                 </div>
                 <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6 flex items-center justify-between">
                       <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full border ${
                         project.difficulty === 'Easy' ? 'text-blue-400 border-blue-500/30' : 
                         project.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-500/30' : 
                         'text-amber-400 border-amber-500/30'
                       }`}>
                          {project.difficulty} Challenge
                       </span>
                       <Award size={14} className="text-emerald-500 opacity-20 group-hover:opacity-100 transition-all" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">{project.title}</h3>
                    <p className="text-xs text-slate-400 font-medium italic leading-relaxed mb-10 flex-1">
                       {project.description}
                    </p>
                    
                    <button 
                      onClick={() => navigate('/dashboard/tasks')}
                      className="w-full py-4.5 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/10 flex items-center justify-center gap-2 active:scale-95 mt-auto"
                    >
                       Start Project <Rocket size={14} />
                    </button>
                 </div>
               </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Jobs;
