import React, { useState, useEffect, useRef } from 'react';
import { LogOut, User, Settings, ShieldCheck, ChevronDown, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export const Navbar = ({ onMenuClick }) => {
  const { user, logoutUser, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md px-4 py-3 md:px-6 flex items-center justify-between shadow-sm">
      
      {/* Brand Logo or Sidebar drawer trigger */}
      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/20 dark:border-slate-800/20 focus:outline-none lg:hidden cursor-pointer"
            aria-label="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <Link to="/" className="flex items-center gap-2">
          {/* Custom Logo Image */}
          <img 
            src="/logo.png" 
            alt="SmartPhonebook Logo" 
            className="w-8 h-8 object-contain rounded-lg shadow-sm" 
          />
          <span className="text-base md:text-lg font-black tracking-wide text-slate-800 dark:text-white flex items-center">
            SmartPhonebook
          </span>
        </Link>
      </div>

      {/* Control Widgets & Session profiles */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Dynamic theme toggle */}
        <ThemeToggle />

        {isAuthenticated && user ? (
          <div ref={dropdownRef} className="relative">
            {/* Clickable Profile Badge */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors focus:outline-none cursor-pointer"
            >
              {/* Profile Image or Initials representation */}
              {user.profile_picture ? (
                <img 
                  src={user.profile_picture.startsWith('http') ? user.profile_picture : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/${user.profile_picture}`} 
                  alt={user.name} 
                  className="w-7.5 h-7.5 rounded-lg object-cover shadow-sm border border-slate-200/50"
                />
              ) : (
                <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden md:block text-xs font-bold text-slate-700 dark:text-slate-200">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {/* Profile Dropdown Items */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl glass-panel border border-slate-200 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/90 shadow-2xl p-1.5 z-50 backdrop-blur-md animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-900/40 text-left">
                  <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">
                    {user.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {user.email}
                  </span>
                </div>
                
                <div className="mt-1 space-y-0.5 text-left">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    System Settings
                  </Link>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logoutUser();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 text-xs font-bold text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-900/40 text-left"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-1 sm:gap-2">
            <Link
              to="/login"
              className="px-2 sm:px-3.5 py-1.5 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all focus:outline-none"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-cyan-500 hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/10 focus:outline-none"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

    </header>
  );
};

export default Navbar;
