import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Info, Sparkles, Zap, Award } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const Notifications = () => {
  const {
    notifications,
    unreadNotificationCount,
    isNotificationsLoading,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useDashboard();

  useEffect(() => {
    fetchNotifications();
  }, []);
  const unreadCount = unreadNotificationCount;

  const getIcon = (type) => {
    switch (type) {
      case 'task':
        return <Zap size={18} className="text-amber-300" />;
      case 'path':
        return <Sparkles size={18} className="text-indigo-300" />;
      case 'achievement':
        return <Award size={18} className="text-emerald-300" />;
      default:
        return <Info size={18} className="text-cyan-300" />;
    }
  };

  return (
    <div className="w-full pb-20">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
            Notifications Center
          </h1>
          <p className="text-slate-400 text-lg font-medium italic">All your roadmap updates and activity alerts in one place.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
            {unreadCount} unread
          </span>
          {unreadCount > 0 && (
            <button
                onClick={markAllNotificationsRead}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-500/30 transition-all"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {isNotificationsLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium italic animate-pulse">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 rounded-3xl border border-white/10 bg-slate-900/40 text-center"
        >
          <Bell size={34} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg font-medium italic">No notifications yet. You’re all caught up.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n, idx) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                n.read
                  ? 'bg-slate-900/40 border-slate-800 text-slate-300'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-white'
              }`}
            >
              <div className={`p-2 rounded-lg border ${n.read ? 'bg-slate-800/70 border-slate-700' : 'bg-indigo-500/20 border-indigo-400/30'}`}>
                {getIcon(n.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h3 className="text-sm font-black uppercase italic tracking-tight">{n.title}</h3>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${n.read ? 'text-slate-400' : 'text-slate-200'}`}>
                  {n.message}
                </p>
              </div>

              {!n.read && (
                <button
                  onClick={() => markNotificationRead(n._id)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/25 transition-all"
                >
                  <Check size={12} className="inline mr-1" /> Read
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
