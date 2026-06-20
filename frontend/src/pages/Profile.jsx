import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, ShieldCheck, Save, Eye, EyeOff,
  BookOpen, Star, Tag, Building2, Search, Pencil, Camera, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`p-4 rounded-2xl border bg-white/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 flex items-center gap-4 shadow-sm`}>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="text-left">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
      <span className="text-xl font-black text-slate-800 dark:text-white">{value}</span>
    </div>
  </div>
);

export const Profile = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showCurrPw, setShowCurrPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // New state for profile picture upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);

  const getProfilePicUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/${path}`;
  };

  // Sync form if user context updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setShouldRemoveAvatar(false);
    }
  };

  // Handle image removal
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setShouldRemoveAvatar(true);
    toast.success('Selected image removed. Save changes to finalize.');
  };

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/profile/stats');
        if (res.data.success) setStats(res.data.stats);
      } catch {
        // silently fail stats
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword) {
      if (newPassword.length < 8) return toast.error('New password must be at least 8 characters long.');
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!strongPasswordRegex.test(newPassword)) {
        return toast.error('New password must contain uppercase, lowercase, a number, and a special character.');
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (shouldRemoveAvatar) {
        formData.append('removeAvatar', 'true');
      }

      if (newPassword) {
        formData.append('newPassword', newPassword);
        formData.append('currentPassword', currentPassword);
      }

      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        // Update localStorage to reflect new name/email/photo
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.user }));
        
        // Reset sensitive fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setAvatarFile(null);
        setShouldRemoveAvatar(false);
        
        // Reload page to refresh all context views simply
        window.location.reload();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const avatarInitials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const userAvatarUrl = shouldRemoveAvatar ? null : (avatarPreview || getProfilePicUrl(user?.profile_picture));

  const statCards = stats
    ? [
        { icon: BookOpen, label: 'Total Contacts', value: stats.totalContacts, color: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
        { icon: Star, label: 'Favorites', value: stats.totalFavorites, color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-500' },
        { icon: Tag, label: 'Unique Tags', value: stats.totalTags, color: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400' },
        { icon: Building2, label: 'Companies', value: stats.totalCompanies, color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' },
        { icon: Search, label: 'Searches Made', value: stats.totalSearches, color: 'bg-violet-100 dark:bg-violet-500/10 text-violet-500 dark:text-violet-400' },
      ]
    : [];

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 select-none bg-slate-50 dark:bg-slate-950 transition-colors min-h-[calc(100vh-62px)]">
      
      {/* Profile Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-cyan-900/10 border border-indigo-200/50 dark:border-indigo-800/20 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Avatar Upload Container */}
          <div className="relative group">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0 overflow-hidden border-4 border-white dark:border-slate-900 transition-all duration-300 ${shouldRemoveAvatar ? 'scale-90 opacity-80' : ''}`}>
              {userAvatarUrl ? (
                <img src={userAvatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                avatarInitials
              )}
            </div>
            
            {/* Action Buttons Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl bg-slate-900/60 backdrop-blur-sm gap-3">
              {/* Change/Upload Button */}
              <label className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white cursor-pointer transition-colors" title="Change Photo">
                <Camera className="w-5 h-5" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </label>
              
              {/* Delete Button (Only if user has a photo) */}
              {(userAvatarUrl || user?.profile_picture) && !shouldRemoveAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="p-2 rounded-xl bg-red-500/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  title="Remove Photo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {user?.name || 'Your Profile'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{user?.email}</p>
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20">
                <ShieldCheck className="w-3 h-3" />
                Verified Account
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      {!statsLoading && stats && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {statCards.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </motion.div>
      )}

      {/* Edit Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="glass-panel p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/40 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6 text-left">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Pencil className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 dark:text-white">Edit Profile</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Update your name, email, or password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left max-w-xl">

          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl cyber-input text-sm"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl cyber-input text-sm"
                required
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/50 pt-5 mt-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Change Password <span className="font-normal normal-case text-slate-300 dark:text-slate-600">(optional)</span></p>

            {/* Current Password */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showCurrPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl cyber-input text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrPw(!showCurrPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer focus:outline-none"
                  >
                    {showCurrPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl cyber-input text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer focus:outline-none"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              {newPassword && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl cyber-input text-sm ${
                        confirmPassword && newPassword !== confirmPassword
                          ? 'border-red-400 dark:border-red-500'
                          : confirmPassword && newPassword === confirmPassword
                          ? 'border-emerald-400 dark:border-emerald-500'
                          : ''
                      }`}
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">Passwords do not match</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer focus:outline-none"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Saving…' : 'Save Changes'}
          </button>

        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
