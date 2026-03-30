import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass px-6 py-3 rounded-2xl shadow-xl shadow-black/20 pointer-events-auto border-t border-b border-t-white/10 border-b-black/50 overflow-hidden relative">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer z-10">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl group-hover:shadow-[0_0_15px_rgba(139,92,246,0.6)] transition-shadow duration-300">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-cyan-400 transition-colors duration-300">
            CareerAI
          </span>
        </Link>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4 z-10">
          <Link to="/login" className="hidden sm:block text-slate-300 hover:text-white px-4 py-2 font-medium transition-colors hover:text-shadow-sm">
            Login
          </Link>
          <Link to="/signup" className="relative inline-flex h-10 items-center justify-center px-6 py-2 overflow-hidden font-medium text-white bg-slate-800 rounded-full group hover:bg-slate-700 transition-colors border border-slate-600 hover:border-indigo-400">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full group-hover:w-56 group-hover:h-56 -z-10"></span>
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative">Sign Up</span>
          </Link>
        </div>

      </div>
    </motion.header>
  );
};

export default Navbar;
