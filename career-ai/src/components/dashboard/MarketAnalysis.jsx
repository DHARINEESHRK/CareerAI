import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { DollarSign, TrendingUp, Users, ArrowUpRight, Zap, Target, Globe } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const FALLBACK_MARKET_TRENDS = {
  trendingRoles: [
    { role: 'AI Engineer', growth: '+32%', demand: 'High' },
    { role: 'Data Scientist', growth: '+25%', demand: 'High' },
    { role: 'Cloud Architect', growth: '+20%', demand: 'High' },
    { role: 'ML Ops Engineer', growth: '+18%', demand: 'Medium' },
  ],
  avgSalary: '$95,000',
  demandScore: 70,
};

const MarketAnalysis = () => {
  const { marketTrends: rawMarketTrends, isLoading } = useDashboard();

  // Use backend data when available, otherwise fall back to mock data
  const marketTrends = rawMarketTrends || FALLBACK_MARKET_TRENDS;

  // Safely access trendingRoles with fallback
  const trendingRoles = Array.isArray(marketTrends.trendingRoles)
    ? marketTrends.trendingRoles
    : FALLBACK_MARKET_TRENDS.trendingRoles;

  // Transform data for charts
  const roleData = trendingRoles.map(r => ({
    name: (r.role || 'Unknown').split(' ').slice(0, 2).join(' '),
    growth: parseInt(String(r.growth || '0').replace('+', '').replace('%', '')) || 0,
    demand: r.demand === "High" ? 80 : 60
  }));

  const avgSalaryStr = marketTrends.avgSalary || '$95,000';
  const parsedSalary = parseFloat(avgSalaryStr.replace(/[^0-9.]/g, '')) || 95000;

  const salaryData = [
    { name: 'Junior', salary: parsedSalary * 0.6 || 65000 },
    { name: 'Mid', salary: parsedSalary * 0.9 || 95000 },
    { name: 'Senior', salary: parsedSalary * 1.4 || 145000 },
    { name: 'Principal', salary: parsedSalary * 1.8 || 185000 },
  ];

  const demandScore = marketTrends.demandScore ?? FALLBACK_MARKET_TRENDS.demandScore;

  return (
    <div className="w-full mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* Salary Insights Analytics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-10 rounded-[3rem] glass-card border border-white/5 bg-slate-900/10 backdrop-blur-3xl shadow-2xl overflow-hidden group relative"
      >
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
            <DollarSign size={150} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                    <Target size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Earnings Trajectory</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Industry Alpha: {marketTrends.avgSalary}</p>
                 </div>
              </div>
              <Zap size={24} className="text-emerald-500/30 group-hover:text-emerald-400 transition-colors animate-pulse" />
            </div>

            <div className="h-[280px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 900, textTransform: 'uppercase' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                  />
                  <Bar dataKey="salary" fill="url(#salaryGradient)" radius={[12, 12, 0, 0]} barSize={40} />
                  <defs>
                    <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
      </motion.div>

      {/* Domain Growth Momentum */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-10 rounded-[3rem] glass-card border border-white/5 bg-slate-900/10 backdrop-blur-3xl shadow-2xl group overflow-hidden relative"
      >
        <div className="absolute bottom-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
            <Globe size={150} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-xl shadow-cyan-500/10">
                    <TrendingUp size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Growth Optimization</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Sector Heat: {demandScore} / 100 Index</p>
                 </div>
              </div>
              <ArrowUpRight size={24} className="text-cyan-500/30 group-hover:text-cyan-400 transition-colors" />
            </div>

            <div className="h-[280px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={roleData}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 900, textTransform: 'uppercase' }} />
                  <Tooltip 
                    contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                  />
                  <Area type="monotone" dataKey="growth" stroke="#06b6d4" strokeWidth={4} fill="url(#growthGradient)" />
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>
      </motion.div>

      {/* Analytic Insight Cards (Replacing Job Cards) */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-6">
             <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400">
                <Users size={28} />
             </div>
             <div>
                <h4 className="text-white font-black text-sm uppercase italic tracking-tight">Workforce Saturation</h4>
                <p className="text-slate-500 text-xs font-medium italic mt-1 leading-relaxed">
                    Sector stability remains high with a <span className="text-indigo-300 font-black">94% retention rate</span> across tier-1 engineering hubs.
                </p>
             </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-6">
             <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <TrendingUp size={28} />
             </div>
             <div>
                <h4 className="text-white font-black text-sm uppercase italic tracking-tight">Skills Premium</h4>
                <p className="text-slate-500 text-xs font-medium italic mt-1 leading-relaxed">
                    Advanced AI integration mastery yields a <span className="text-emerald-400 font-black">+22% salary multiplier</span> in current market cycles.
                </p>
             </div>
          </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
