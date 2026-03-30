import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info, Sparkles, Zap, Award } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const {
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
    } = useDashboard();

    // Close click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = unreadNotificationCount;

    const getIcon = (type) => {
        switch (type) {
            case 'task': return <Zap size={16} className="text-amber-400" />;
            case 'path': return <Sparkles size={16} className="text-indigo-400" />;
            case 'achievement': return <Award size={16} className="text-emerald-400" />;
            default: return <Info size={16} className="text-cyan-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-slate-900 border border-white/5 hover:border-indigo-500/30 transition-all hover:scale-105 active:scale-95"
            >
                <Bell size={20} className={unreadCount > 0 ? "text-indigo-400 animate-wiggle" : "text-slate-400"} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#020617] shadow-lg shadow-indigo-500/20">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-80 sm:w-96 rounded-[1.5rem] border border-indigo-500/20 shadow-[0_24px_70px_rgba(2,6,23,0.85)] overflow-hidden z-[100] origin-top-right backdrop-blur-xl bg-slate-950/95"
                    >
                        <div className="p-5 border-b border-indigo-500/20 flex items-center justify-between bg-slate-900/95">
                            <div>
                                <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Alerts Center</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time engagement feedback</p>
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllNotificationsRead}
                                    className="text-[10px] font-black text-indigo-300 hover:text-indigo-200 uppercase tracking-widest underline decoration-indigo-500/50"
                                >
                                    Mark All Read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[420px] overflow-y-auto custom-scrollbar bg-slate-950/95">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Bell size={32} className="mx-auto text-slate-700 mb-4 opacity-20" />
                                    <p className="text-xs text-slate-500 italic font-medium">No alerts for your active roadmap yet.</p>
                                </div>
                            ) : (
                                notifications.map((n, idx) => (
                                    <div 
                                        key={n._id}
                                        className={`p-5 border-b border-slate-800/80 transition-all hover:bg-slate-900/90 flex gap-4 items-start relative overflow-hidden group ${!n.read ? 'bg-indigo-500/10' : 'bg-slate-950/60'}`}
                                    >
                                        {!n.read && <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
                                        
                                        <div className={`p-2 rounded-lg border ${!n.read ? 'bg-indigo-500/15 border-indigo-400/30' : 'bg-slate-800/70 border-slate-700/70'}`}>
                                            {getIcon(n.type)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between gap-2">
                                                <h4 className={`text-xs font-black uppercase italic tracking-tight ${!n.read ? 'text-white' : 'text-slate-300'}`}>{n.title}</h4>
                                                <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap">
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] leading-relaxed mt-1 font-semibold ${!n.read ? 'text-slate-200 italic' : 'text-slate-400 italic'}`}>
                                                {n.message}
                                            </p>
                                            
                                            {!n.read && (
                                                <button 
                                                    onClick={() => markNotificationRead(n._id)}
                                                    className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 uppercase tracking-widest transition-all"
                                                >
                                                    <Check size={10} /> Mark read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-slate-900/95 border-t border-slate-800 text-center">
                            <button className="text-[10px] font-black text-slate-300 hover:text-white uppercase tracking-widest transition-colors">
                                View Full Activity Log
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
