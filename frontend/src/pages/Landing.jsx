import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Cpu,
  ShieldCheck,
  FileSpreadsheet,
  Star,
  Zap,
  Building,
  CheckCircle,
  Phone,
  ArrowRight
} from 'lucide-react';

export const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-[calc(100vh-62px)] flex flex-col items-center select-none bg-slate-50 dark:bg-slate-950 transition-colors">

      {/* 1. Split Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">

        {/* Color-matched background accent glow */}
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-cyan-600/10 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">

          {/* Left: Content Area */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-left space-y-8"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.05]"
            >
              The Smartest <br />
              <span className="text-slate-900 dark:text-white">Phonebook Ever</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-xl leading-relaxed"
            >
              Optimize your directory searches with high-speed in-memory indexing and spelling correction. Manage your contacts with a platform designed for scale and speed.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow-xl shadow-cyan-500/25 transition-all active:scale-95 flex items-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Dedicated Image Showcase Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex relative group w-full max-w-lg mx-auto lg:max-w-none"
          >
            {/* Visual Frame for the image */}
            <div className="relative w-full aspect-[4/3] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl shadow-cyan-500/10">
              <img
                src="/hero-show.jpg"
                alt="Digital Connection Showcase"
                className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {/* Background decorative glow behind image */}
            <div className="absolute -inset-4 bg-cyan-500/10 rounded-[3.5rem] blur-2xl -z-10 group-hover:bg-cyan-500/20 transition-all duration-700"></div>
          </motion.div>

        </div>
      </section>

      {/* 3. Core Tech Showcase Features Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-28">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mb-16">
          Core Features & Capabilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl glass-panel bg-white/50 dark:bg-slate-900/30 text-left border border-slate-200/50 dark:border-slate-800/30">
            <div className="p-3 w-fit rounded-xl bg-cyan-100 dark:bg-cyan-950/30 text-cyan-500 mb-5">
              <Search className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
              Instant Smart Search
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
              Find anyone in milliseconds. Our search understands misspellings, searches across tags, and provides instant dropdown suggestions as you type.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl glass-panel bg-white/50 dark:bg-slate-900/30 text-left border border-slate-200/50 dark:border-slate-800/30">
            <div className="p-3 w-fit rounded-xl bg-purple-100 dark:bg-purple-950/30 text-purple-500 mb-5">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
              Interactive Organization
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
              Categorize contacts with custom tags, assign companies, and toggle them as favorites for lightning-fast quick access.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl glass-panel bg-white/50 dark:bg-slate-900/30 text-left border border-slate-200/50 dark:border-slate-800/30">
            <div className="p-3 w-fit rounded-xl bg-indigo-100 dark:bg-indigo-950/30 text-indigo-500 mb-5">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
              Bulk Imports & Exports
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
              Migrating your data is easy. Seamlessly upload CSV files or export your entire phonebook to a safe local backup instantly.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl glass-panel bg-white/50 dark:bg-slate-900/30 text-left border border-slate-200/50 dark:border-slate-800/30">
            <div className="p-3 w-fit rounded-xl bg-amber-100 dark:bg-amber-950/30 text-amber-500 mb-5">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
              Responsive Design
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
              Enjoy a perfectly tuned experience across desktops, tablets, and mobile phones with dynamic layouts that adapt to your screen size.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl glass-panel bg-white/50 dark:bg-slate-900/30 text-left border border-slate-200/50 dark:border-slate-800/30">
            <div className="p-3 w-fit rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
              Secure Cloud Storage
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
              Your personal data is encrypted and protected with industry-standard security. You remain in complete control of your directory.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl glass-panel bg-white/50 dark:bg-slate-900/30 text-left border border-slate-200/50 dark:border-slate-800/30">
            <div className="p-3 w-fit rounded-xl bg-rose-100 dark:bg-rose-950/30 text-rose-500 mb-5">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
              Premium UI & Dark Mode
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
              High-end glass background blurs, animated gradients, and a beautiful toggleable dark/light mode tailored for your comfort.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
