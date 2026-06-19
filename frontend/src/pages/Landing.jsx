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

      {/* 1. Hero Showcase Section */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Main Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
            alt="Digital Connection" 
            className="w-full h-full object-cover opacity-60 md:opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 text-center flex flex-col items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl space-y-8 glass-panel p-8 md:p-12 rounded-[2.5rem] bg-white/5 dark:bg-slate-900/10 border border-white/10 backdrop-blur-xl shadow-2xl"
          >
            {/* Core Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1]"
            >
              The Smartest <br />
              <span className="text-cyan-400">Phonebook</span> Ever
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base md:text-xl text-slate-200 font-medium max-w-2xl leading-relaxed opacity-90"
            >
              Optimize your directory searches with high-speed in-memory Tries, full-text indexing, and spelling correction engines. Back up, filter, and import in seconds.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4 pt-4"
            >
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white bg-cyan-500 hover:bg-cyan-600 transition-all font-bold text-base md:text-lg shadow-xl shadow-cyan-500/30 active:scale-95 cursor-pointer ring-2 ring-white/20"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
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

      {/* Footer copyright */}
      <footer className="w-full border-t border-slate-100 dark:border-slate-950/40 py-8 text-center text-xs text-slate-400 font-medium bg-white/20 dark:bg-slate-950/20">
        © {new Date().getFullYear()} Smart Phonebook Search Engine. <br />Developed By MCA Students( Twinkle Taleda & Abhishek J ) At Chetan Bussiness School, Hubli.
      </footer>
    </div>
  );
};

export default Landing;
