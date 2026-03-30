import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex flex-col items-start justify-center text-left max-w-2xl pt-0 pb-12"
    >
      <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full glass border-indigo-500/30 text-indigo-300 font-medium text-sm">
        <Sparkles size={16} className="text-purple-400" />
        <span>AI-Powered Career Intelligence</span>
      </div>

      <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
        Discover Your <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 pb-2">
          Perfect Career
        </span> <br />
        Path
      </h1>

      <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl font-light leading-relaxed">
        AI-powered guidance specifically tailored to your unique skills, passions, and future market trends. Step into the future of work.
      </p>

      <div className="flex items-center w-full sm:w-auto">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.4)] overflow-hidden transition-all duration-300"
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
          <span className="relative z-10">Get Started</span>
          <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </motion.button>
      </div>

      {/* Trust Badges / Stats */}
      <div className="mt-12 flex items-center gap-8 border-t border-slate-800 pt-8 w-full sm:w-auto">
        <div>
          <h4 className="text-2xl font-bold text-white">50k+</h4>
          <p className="text-sm text-slate-500 font-medium">Careers Analyzed</p>
        </div>
        <div className="w-px h-12 bg-slate-800"></div>
        <div>
          <h4 className="text-2xl font-bold text-white">99%</h4>
          <p className="text-sm text-slate-500 font-medium">Match Accuracy</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Hero;
