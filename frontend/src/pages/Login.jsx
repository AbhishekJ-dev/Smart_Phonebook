import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);
    
    if (result && result.success) {
      navigate('/dashboard'); // Route to secure dashboard panel
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-62px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden select-none">
      
      {/* Decorative vector blooms */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 dark:from-cyan-500/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 dark:from-purple-500/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/40 shadow-2xl relative"
      >
        {/* Back Link */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        {/* Header Title */}
        <div className="text-center mt-6 mb-8">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Welcome <span className="animated-gradient-text">Back</span>
          </h2>
          <p className="mt-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
            Sign in to manage your smart directory
          </p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Email Address */}
          <div>
            <label htmlFor="email-login" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email-login"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl cyber-input text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password-login" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-login"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 rounded-xl cyber-input text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 mt-4 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl shadow-md shadow-cyan-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4.5 h-4.5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer Redirect link */}
        <div className="mt-8 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold hover:underline underline-offset-4 focus:outline-none"
          >
            Create one now
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
