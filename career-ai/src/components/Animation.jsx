import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Code, Palette, BriefcaseMedical, Cpu, BarChart, Database } from 'lucide-react';

const NODES = [
  { id: 1, label: 'Software Engineer', icon: Code, x: -140, y: -120, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 2, label: 'UI/UX Designer', icon: Palette, x: 140, y: -100, color: 'text-pink-400', bg: 'bg-pink-500/20' },
  { id: 3, label: 'AI Researcher', icon: Cpu, x: -160, y: 50, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { id: 4, label: 'Data Scientist', icon: Database, x: 150, y: 70, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  { id: 5, label: 'Medical Tech', icon: BriefcaseMedical, x: -50, y: -180, color: 'text-green-400', bg: 'bg-green-500/20' },
  { id: 6, label: 'Analyst', icon: BarChart, x: 60, y: 160, color: 'text-orange-400', bg: 'bg-orange-500/20' },
];

const Animation = () => {
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      className="relative w-full aspect-square max-w-[600px] flex items-center justify-center mx-auto lg:-translate-y-10"
    >
      {/* Central User Node */}
      <motion.div 
        animate={{ 
          boxShadow: ['0px 0px 40px rgba(139, 92, 246, 0.4)', '0px 0px 80px rgba(139, 92, 246, 0.8)', '0px 0px 40px rgba(139, 92, 246, 0.4)'] 
        }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="relative z-20 flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 border-2 border-purple-500 glow shadow-2xl"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 opacity-20 blur-xl"></div>
        <User size={40} className="text-purple-300 drop-shadow-[0_0_10px_rgba(216,180,254,1)]" />
      </motion.div>

      {/* SVG Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="-250 -250 500 500">
        {NODES.map((node) => {
          const isHovered = hoveredNode === node.id;
          return (
            <motion.line
              key={`line-${node.id}`}
              x1="0"
              y1="0"
              x2={node.x}
              y2={node.y}
              stroke={isHovered ? 'url(#gradient-hover)' : 'url(#gradient-base)'}
              strokeWidth={isHovered ? 3 : 1.5}
              strokeDasharray={isHovered ? 'none' : '4 4'}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: isHovered ? 1 : 0.4 
              }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
              className="drop-shadow-md"
            />
          );
        })}
        <defs>
          <linearGradient id="gradient-base" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="gradient-hover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Orbiting Career Nodes */}
      {NODES.map((node, i) => {
        const Icon = node.icon;
        
        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: 1, 
              x: node.x, 
              y: node.y,
              y: [node.y - 10, node.y + 10, node.y - 10]
            }}
            transition={{ 
              opacity: { duration: 0.8, delay: 1 + i * 0.2 },
              x: { duration: 1, ease: "easeOut", delay: 1 + i * 0.2 },
              y: { 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut", 
                delay: i * 0.5 
              }
            }}
            className="absolute z-30 cursor-pointer"
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <div className="relative group">
              <motion.div 
                whileHover={{ scale: 1.2 }}
                className={`p-4 rounded-full glass-card flex items-center justify-center transition-all duration-300 ${node.bg} border-slate-600/50 hover:border-white/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}
              >
                <Icon size={24} className={`${node.color} drop-shadow-[0_0_8px_currentColor]`} />
              </motion.div>
              
              {/* Tooltip Label */}
              <div 
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap bg-slate-800 text-white border border-slate-600 drop-shadow-xl transition-all duration-300 ${
                  hoveredNode === node.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                {node.label}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Orbit Rings Background */}
      <div className="absolute inset-0 rounded-full border border-slate-700/30 w-[80%] h-[80%] left-[10%] top-[10%] animate-[spin_60s_linear_infinite]"></div>
      <div className="absolute inset-0 rounded-full border border-indigo-900/20 w-[120%] h-[120%] left-[-10%] top-[-10%] animate-[spin_90s_linear_infinite_reverse]"></div>

    </motion.div>
  );
};

export default Animation;
