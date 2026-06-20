import React, { useState, useEffect, useRef } from 'react';
import { LogOut, User, Settings, ChevronDown, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export const Navbar = ({ onMenuClick }) => {
  const { user, logoutUser, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getProfilePicUrl = (path) => {
    return path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/${path}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all select-none">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between gap-4">
        
        {/* Left Side: Enhanced Branding */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors mr-1"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            {/* Custom Logo Image (Larger) */}
            <img 
              src="/logo.png" 
              alt="SmartPhonebook Logo" 
              className="w-12 h-12 object-contain rounded-xl shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform" 
            />
            <span className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center transition-colors">
              SmartPhonebook
            </span>
          </Link>
        </div>

        {/* Right Side: Navigation & Actions */}
        <div className="flex items-center gap-4 sm:gap-8 flex-1 justify-end">
          
          {/* Main Nav Links (Visible when not logged in) */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-8 mr-2">
              <Link
                to="/"
                className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-all uppercase tracking-wider"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-all uppercase tracking-wider"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 shadow-xl shadow-cyan-500/20 transition-all active:scale-95 uppercase tracking-wider"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Dynamic theme toggle (Always at the end) */}
          <div className="flex items-center gap-3 sm:gap-5 ml-2 border-l border-slate-200 dark:border-slate-800 pl-4 sm:pl-6">
            <ThemeToggle />

            {/* User Session profile (only if authenticated) */}
            {isAuthenticated && user && (
              <div ref={dropdownRef} className="relative">
                {/* Clickable Profile Badge */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-cyan-500/10 overflow-hidden">
                    {user.profile_picture ? (
                      <img 
                        src={getProfilePicUrl(user.profile_picture)} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter leading-none mb-0.5">Account</p>
                    <p className="text-sm font-black text-slate-700 dark:text-white truncate max-w-[100px]">{user.name.split(' ')[0]}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-900/50">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={logoutUser}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
