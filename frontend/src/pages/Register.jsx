import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) return toast.error('Full name is required.');
    if (!email.trim()) return toast.error('Email address is required.');
    if (password.length < 6) return toast.error('Password must be at least 6 characters long.');
    if (password !== confirmPassword) return toast.error('Passwords do not match.');

    setLoading(true);
    const result = await registerUser(name.trim(), email.trim(), password);
    setLoading(false);
    
    if (result && result.success) {
      navigate('/login'); // Registration done — go to sign-in
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-62px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden select-none">
      
      {/* Decorative vectors */}
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
        <div className="text-center mt-6 mb-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Create <span className="animated-gradient-text">Account</span>
          </h2>
          <p className="mt-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
            Sign up to get started on your optimized phonebook
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          
          {/* Full Name */}
          <div>
            <label htmlFor="name-register" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                id="name-register"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl cyber-input text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email-register" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email-register"
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
            <label htmlFor="password-register" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-register"
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm-password-register" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm-password-register"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 rounded-xl cyber-input text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 mt-4 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl shadow-md shadow-cyan-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <>
                <UserPlus className="w-4.5 h-4.5" />
                Sign Up
              </>
            )}
          </button>
        </form>

        {/* Redirect Footer */}
        <div className="mt-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold hover:underline underline-offset-4 focus:outline-none"
          >
            Sign in
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;
