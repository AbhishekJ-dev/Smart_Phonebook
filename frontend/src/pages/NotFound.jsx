import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-62px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden relative select-none">
      
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Glitchy 404 Number */}
        <motion.div
          animate={{ opacity: [1, 0.8, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-[120px] font-black leading-none tracking-tighter mb-4 select-none"
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 30px rgba(6,182,212,0.3))'
          }}
        >
          404
        </motion.div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/30 shadow-sm">
            <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
          Oops! The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl shadow-md shadow-cyan-500/15 transition-all focus:outline-none"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-sm transition-all focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
