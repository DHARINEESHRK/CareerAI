import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import { apiFetch } from '../../utils/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your CareerAI Mentor. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { activePath, tasks } = useDashboard();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiFetch("/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          context: {
            path: activePath,
            tasks: tasks
          }
        })
      });

      if (response && response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "What should I do next?",
    "Am I on track?",
    "Industry trends for my role",
    "How to improve my skills?"
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="w-[90vw] sm:w-[350px] md:w-[400px] max-w-[400px] h-[70vh] sm:h-[550px] max-h-[70vh] bg-[#020617]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">CareerAI Mentor</h3>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-hide"
            >
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-slate-800 border border-white/10'}`}>
                      {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-indigo-400" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl' 
                      : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none font-medium'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                         <Bot size={14} className="text-indigo-400" />
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length === 1 && !isLoading && (
               <div className="px-6 pb-2 flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button 
                      key={s} 
                      onClick={() => handleSend(s)}
                      className="px-3 py-1.5 bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 rounded-full text-[10px] font-bold text-slate-400 hover:text-indigo-300 transition-all uppercase tracking-tighter"
                    >
                      {s}
                    </button>
                  ))}
               </div>
            )}

            {/* Input Area */}
            <div className="p-6 bg-slate-900/50 border-t border-white/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your career..."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all transform active:scale-90 disabled:opacity-50 disabled:bg-slate-800"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
        className="relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 border border-white/30 shadow-indigo-500/40 group overflow-visible pointer-events-auto"
      >
        {!isOpen && (
          <>
            <motion.span
              className="absolute -inset-1 rounded-full bg-gradient-to-br from-indigo-500/35 to-fuchsia-500/35 blur-md"
              animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.25, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute -inset-2 rounded-full border border-indigo-300/30"
              animate={{ scale: [1, 1.18], opacity: [0.45, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute -inset-3 rounded-full border border-fuchsia-300/20"
              animate={{ scale: [1, 1.24], opacity: [0.35, 0] }}
              transition={{ duration: 2.3, repeat: Infinity, ease: 'easeOut', delay: 0.25 }}
            />
          </>
        )}

        <div className="relative z-10 flex items-center justify-center">
          {isOpen ? (
            <X className="text-white" size={22} />
          ) : (
            <>
              <MessageSquare className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" size={22} />
              <motion.div
                animate={{ y: [0, -2, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-[#020617] border border-indigo-300/40 flex items-center justify-center shadow-lg"
              >
                <Sparkles size={12} className="text-cyan-300" />
              </motion.div>
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default Chatbot;
