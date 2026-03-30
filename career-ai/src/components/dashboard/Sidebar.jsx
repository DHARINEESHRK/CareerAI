import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BrainCircuit, Map, CheckSquare, Sparkles, Crown, Briefcase } from 'lucide-react';

const ProgressIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isPremium = user.isPremium;

  const links = [
    { name: 'Path', to: '/dashboard/path', icon: Map },
    { name: 'Tasks', to: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Progress', to: '/dashboard/progress', icon: ProgressIcon },
    { name: 'Job Matches', to: '/dashboard/jobs', icon: Briefcase },
    { name: 'Generate Path', to: '/dashboard/generate', icon: Sparkles },
  ];

  return (
    <div className="w-64 glass border-r border-slate-800/60 hidden md:flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.6)]">
            <BrainCircuit size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-clip-text">
            CareerAI
          </span>
        </div>
        {isPremium && <Crown size={16} className="text-yellow-400 fill-current" />}
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent hover:border-slate-700/50'
              }`
            }
          >
            <link.icon size={20} />
            {link.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer Area of Sidebar */}
      <div className="px-2 py-4 border-t border-white/5 w-full overflow-hidden">
        {!isPremium ? (
          <div 
            onClick={() => navigate('/dashboard/profile')}
            className="glass-card rounded-lg p-2 flex flex-col items-center justify-center text-center gap-1 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] cursor-pointer group hover:border-indigo-400/40 transition-all active:scale-[0.98]"
          >
            <Sparkles size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
            <p className="text-[9px] text-slate-300 font-black uppercase tracking-tighter truncate w-full">Upgrade Pro</p>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter truncate w-full">₹2k/m</p>
          </div>
        ) : (
          <div className="px-2 py-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 flex flex-col items-center text-center gap-0.5 shadow-lg w-full overflow-hidden">
            <div className="flex items-center justify-center gap-1 w-full overflow-hidden">
               <Crown size={12} className="text-yellow-400 shrink-0" />
               <span className="text-[9px] font-black text-white uppercase tracking-tight truncate">Premium</span>
            </div>
            <p className="text-[8px] text-slate-400 leading-tight truncate w-full">Elite enabled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
