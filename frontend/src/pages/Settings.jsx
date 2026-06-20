import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Trash2, Download, RotateCcw, ShieldAlert,
  Moon, Sun, History, Database, AlertTriangle, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useContacts } from '../context/ContactsContext.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../components/ConfirmationDialog.jsx';

const SectionCard = ({ title, description, icon: Icon, iconColor, children }) => (
  <div className="glass-panel p-6 rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
    <div className="flex items-start gap-4 mb-5 text-left">
      <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconColor}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <h3 className="text-sm font-black text-slate-800 dark:text-white">{title}</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
    <div className="text-left">{children}</div>
  </div>
);

export const Settings = () => {
  const { logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { exportContactsAction } = useContacts();

  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleClearHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.delete('/profile/history');
      if (res.data.success) {
        toast.success(res.data.message || 'Search history cleared!');
        // Dispatch event so ContactsContext refetches history
        window.dispatchEvent(new CustomEvent('refresh-contacts-list'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear history.');
    } finally {
      setHistoryLoading(false);
      setClearHistoryOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/profile/account');
      toast.success('Account permanently deleted. Goodbye!');
      logoutUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleteAccountOpen(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    await exportContactsAction();
    setExportLoading(false);
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 select-none bg-slate-50 dark:bg-slate-950 transition-colors min-h-[calc(100vh-62px)]">

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-500/10 via-slate-400/5 to-indigo-500/10 dark:from-slate-800/20 dark:via-slate-900/10 dark:to-indigo-900/10 border border-slate-200/50 dark:border-slate-700/20 shadow-sm"
      >
        <div className="relative flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/30 shadow-sm">
            <SettingsIcon className="w-7 h-7 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              System <span className="animated-gradient-text">Settings</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage your preferences, data, and account options
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionCard
            title="Appearance"
            description="Switch between dark and light mode themes. Your preference is saved automatically."
            icon={theme === 'dark' ? Moon : Sun}
            iconColor="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          >
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/30">
              <div className="flex items-center gap-3">
                {theme === 'dark'
                  ? <Moon className="w-4 h-4 text-indigo-400" />
                  : <Sun className="w-4 h-4 text-amber-400" />}
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${
                  theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </SectionCard>
        </motion.div>

        {/* Export Data */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SectionCard
            title="Export Data"
            description="Download your entire contacts directory as a CSV file for backup or migration purposes."
            icon={Database}
            iconColor="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-all cursor-pointer focus:outline-none disabled:opacity-50"
            >
              {exportLoading
                ? <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                : <Download className="w-4 h-4" />}
              Download CSV Backup
            </button>
          </SectionCard>
        </motion.div>

        {/* Clear Search History */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionCard
            title="Search History"
            description="Clear all saved search queries from your recent history log. This action cannot be undone."
            icon={History}
            iconColor="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            <button
              onClick={() => setClearHistoryOpen(true)}
              className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-xl transition-all cursor-pointer focus:outline-none"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Search History
            </button>
          </SectionCard>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionCard
            title="Danger Zone"
            description="Permanently delete your account and all associated contacts, images, and history. This is irreversible."
            icon={ShieldAlert}
            iconColor="bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
          >
            <div className="space-y-3">
              <button
                onClick={logoutUser}
                className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer focus:outline-none w-full"
              >
                <LogOut className="w-4 h-4" />
                Sign Out of Account
              </button>
              <button
                onClick={() => setDeleteAccountOpen(true)}
                className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all cursor-pointer focus:outline-none w-full"
              >
                <Trash2 className="w-4 h-4" />
                Delete My Account Permanently
              </button>
            </div>
          </SectionCard>
        </motion.div>

      </div>

      {/* Dialogs */}
      <ConfirmationDialog
        isOpen={clearHistoryOpen}
        onConfirm={handleClearHistory}
        onCancel={() => setClearHistoryOpen(false)}
        title="Clear Search History?"
        message="All recent search logs will be permanently erased. Your contacts will not be affected."
        confirmLabel={historyLoading ? 'Clearing…' : 'Clear History'}
      />
      <ConfirmationDialog
        isOpen={deleteAccountOpen}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteAccountOpen(false)}
        title="Delete Account Permanently?"
        message="This will immediately and irreversibly delete your account, all contacts, uploaded images, and search history. There is no undo."
        confirmLabel="Yes, Delete Everything"
      />
    </div>
  );
};

export default Settings;
