import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  Star, 
  User, 
  Settings, 
  ChevronRight, 
  X, 
  BookOpen,
  Hash,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContacts } from '../context/ContactsContext.jsx';

export const Sidebar = ({ isOpen, onClose }) => {
  const { contacts, pagination, filters, setFilters, activeTags, activeCompanies } = useContacts();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Users },
    { name: 'Favorites Only', path: '/favorites', icon: Star },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  // Quick select filters helpers
  const handleTagFilterClick = (tag) => {
    setFilters((prev) => ({
      ...prev,
      tag: prev.tag === tag ? '' : tag // Toggle tag
    }));
  };

  const handleCompanyFilterClick = (company) => {
    setFilters((prev) => ({
      ...prev,
      company: prev.company === company ? '' : company // Toggle company
    }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 p-4 border-r border-slate-200/50 dark:border-slate-800/40 select-none">
      
      {/* Metrics Card Widget */}
      <div className="p-4 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 dark:from-cyan-950/20 dark:to-indigo-950/20 border border-cyan-500/10 dark:border-cyan-500/5 shadow-sm text-left mb-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500 text-white shadow-md shadow-cyan-500/10">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Contacts
            </span>
            <span className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {pagination.totalItems || contacts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="space-y-1 text-left">
        <span className="block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </span>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/10 border border-cyan-400/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-cyan-500 dark:group-hover:text-cyan-400'}`} />
                <span>{link.name}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white/70' : 'text-slate-400'}`} />
            </NavLink>
          );
        })}
      </div>

      {/* Dynamic Tag Filters List (Sidebar shortcut integration) */}
      {activeTags.length > 0 && (
        <div className="mt-8 space-y-1.5 text-left flex-1 overflow-y-auto">
          <span className="block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Tags Shortcuts
          </span>
          <div className="flex flex-wrap gap-1 px-3 mt-1">
            {activeTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagFilterClick(tag)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-colors border ${
                  filters.tag === tag
                    ? 'bg-cyan-500 border-cyan-400 text-white'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/30 text-slate-500 dark:text-slate-400 hover:border-cyan-500/40 dark:hover:border-cyan-400/20'
                }`}
              >
                <Hash className="w-2.5 h-2.5" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Company Filters List */}
      {activeCompanies.length > 0 && (
        <div className="mt-6 space-y-1.5 text-left border-t border-slate-100 dark:border-slate-900/40 pt-4 pb-2">
          <span className="block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Quick Companies
          </span>
          <div className="space-y-0.5 mt-1 px-1 max-h-[140px] overflow-y-auto">
            {activeCompanies.slice(0, 4).map((comp) => (
              <button
                key={comp}
                onClick={() => handleCompanyFilterClick(comp)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-semibold truncate text-left transition-colors cursor-pointer ${
                  filters.company === comp
                    ? 'text-cyan-500 dark:text-cyan-400 bg-cyan-500/5 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                <span className="truncate">{comp}</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );

  return (
    <>
      {/* 1. Desktop Mode Sidebar (always visible on lg viewport) */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-62px)] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* 2. Mobile Mode Drawer (slides over using Framer Motion) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            {/* Slider container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 h-full z-10"
            >
              {/* Close Button Inside Drawer */}
              <button
                onClick={onClose}
                className="absolute top-4 right-[-44px] p-2 rounded-xl bg-slate-900/80 backdrop-blur text-white hover:bg-slate-900 border border-slate-700/50 cursor-pointer focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
