import React from 'react';
import { LogOut, User, Sparkles, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import NotificationDropdown from './NotificationDropdown';

const Topbar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const firstName = user?.name?.split(' ')[0] || 'Explorer';

  return (
    <div className="w-full min-w-0 glass flex items-center justify-between px-4 md:px-6 lg:px-8 py-4 border-b border-white/10 sticky top-0 z-30 shadow-md backdrop-blur-xl bg-slate-950/20">
      <div className="flex min-w-0 flex-col pr-3">
        <h2 className="min-w-0 text-lg md:text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2 truncate">
           <Sparkles size={18} className="text-indigo-400" />
           Welcome, {firstName}
        </h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5 truncate">Your Career Journey is Active</p>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        <NotificationDropdown />

        <div 
          onClick={() => navigate('/dashboard/profile')}
          className="flex items-center gap-2 md:gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-slate-800 shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:scale-105 transition-transform overflow-hidden relative">
              <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-all"></div>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-white drop-shadow-md" />
              )}
            </div>
            {user?.isPremium && (
              <div className="absolute -top-1.5 -right-1.5 p-1 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full border border-[#020617] shadow-lg z-10">
                <Crown size={10} className="text-white" />
              </div>
            )}
          </div>
          <div className="hidden xl:block">
            <p className="text-sm font-black text-white italic tracking-tighter group-hover:text-indigo-400 transition-colors uppercase leading-none mb-1">{user?.name || 'Explorer'}</p>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none">
                {user?.isPremium ? 'PRO USER' : 'FREE USER'}
            </p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="text-slate-500 hover:text-rose-400 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-slate-800 px-3 md:px-4 py-2 rounded-xl hover:border-rose-500/30 hover:bg-rose-500/10 active:scale-95 shadow-md shadow-black/20"
        >
          <LogOut size={16} />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;
