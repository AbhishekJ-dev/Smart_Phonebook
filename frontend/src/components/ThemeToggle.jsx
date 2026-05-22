import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';

export const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-between w-16 h-8 p-1 rounded-full cursor-pointer bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/50 transition-colors duration-300 focus:outline-none"
      aria-label="Toggle Dark/Light Mode"
    >
      {/* Icon indicators */}
      <Sun className="w-4 h-4 text-amber-500 ml-1.5" />
      <Moon className="w-4 h-4 text-cyan-400 mr-1.5" />

      {/* Animated Sliding Dot */}
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center border border-slate-300/30"
        animate={{ x: isDark ? 32 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
