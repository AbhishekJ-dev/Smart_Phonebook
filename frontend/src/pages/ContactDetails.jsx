import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  Star, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag, 
  ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';

export const ContactDetails = ({ isOpen, onClose, contact, onEdit, onDelete }) => {
  if (!contact) return null;
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

  const getProfilePicUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^https?:\/\/localhost:\d+\//, '');
    return `${apiBase}/${cleanPath}`;
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await api.put(`/contacts/${contact.id}`, {
        name: contact.name,
        phone: contact.phone,
        email: contact.email || '',
        company: contact.company || '',
        address: contact.address || '',
        tags: contact.tags || [],
        favorite: !contact.favorite
      });
      if (res.data.success) {
        toast.success(
          contact.favorite 
            ? `Removed ${contact.name} from favorites` 
            : `Added ${contact.name} to favorites`
        );
        window.dispatchEvent(new Event('refresh-contacts-list'));
      }
    } catch (err) {
      toast.error('Failed to update favorite status.');
    }
  };

  const getGradient = (name) => {
    const charCode = name.charCodeAt(0) || 65;
    const index = charCode % 5;
    const gradients = [
      'from-cyan-400 to-blue-500 text-white',
      'from-purple-400 to-indigo-500 text-white',
      'from-emerald-400 to-teal-500 text-white',
      'from-rose-400 to-pink-500 text-white',
      'from-amber-400 to-orange-500 text-white'
    ];
    return gradients[index];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-950 shadow-2xl z-10 flex flex-col text-left"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Favorite toggle floating */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer focus:outline-none"
              aria-label="Toggle Favorite"
            >
              <Star
                className={`w-5 h-5 ${
                  contact.favorite 
                    ? 'text-amber-400 fill-amber-400 stroke-amber-400' 
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            </button>

            {/* Visual Header */}
            <div className="flex flex-col items-center mt-6 text-center">
              {contact.profile_picture ? (
                  <img
                    src={getProfilePicUrl(contact.profile_picture)}
                    alt={contact.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500 shadow-md"
                  />
              ) : (
                <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${getGradient(contact.name)} flex items-center justify-center font-bold text-3xl shadow-md`}>
                  {contact.name.charAt(0).toUpperCase()}
                </div>
              )}

              <h3 className="mt-4 text-xl font-black text-slate-800 dark:text-white">
                {contact.name}
              </h3>
              
              {contact.company && (
                <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <Building className="w-3.5 h-3.5" />
                  {contact.company}
                </div>
              )}
            </div>

            {/* Tags section */}
            {Array.isArray(contact.tags) && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mt-4 w-full">
                {contact.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/30"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Detail rows and linkages */}
            <div className="mt-6 space-y-4 py-4 border-t border-b border-slate-100 dark:border-slate-800/40">
              
              {/* Phone Line link */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100/10 hover:border-cyan-500/20 transition-all">
                <div className="flex gap-3 items-center min-w-0">
                  <Phone className="w-4.5 h-4.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</span>
                    <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200 truncate font-mono select-all">{contact.phone}</span>
                  </div>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="p-2.5 bg-cyan-500 text-white rounded-xl shadow-md shadow-cyan-500/15 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  aria-label="Call Contact"
                >
                  <Phone className="w-4 h-4 text-white" />
                </a>
              </div>

              {/* Email Line link */}
              {contact.email && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100/10 hover:border-cyan-500/20 transition-all">
                  <div className="flex gap-3 items-center min-w-0">
                    <Mail className="w-4.5 h-4.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200 truncate select-all">{contact.email}</span>
                    </div>
                  </div>
                  <a
                    href={`mailto:${contact.email}`}
                    className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/15 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    aria-label="Email Contact"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Location Google Map Link integration */}
              {contact.address && (
                <div className="flex items-start justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100/10 hover:border-cyan-500/20 transition-all">
                  <div className="flex gap-3 items-start min-w-0">
                    <MapPin className="w-4.5 h-4.5 text-slate-400 dark:text-slate-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Location Address</span>
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed font-sans">{contact.address}</span>
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0 ml-2 border border-slate-200/20 dark:border-slate-800/20"
                    aria-label="Map Lookup"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Created Calendar indicator */}
              <div className="flex gap-3 px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Created at {new Date(contact.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  onClose();
                  onDelete(contact.id);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs md:text-sm font-semibold rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors focus:outline-none cursor-pointer border border-transparent hover:border-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(contact);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs md:text-sm font-semibold rounded-xl text-white bg-cyan-500 hover:bg-cyan-600 transition-colors focus:outline-none cursor-pointer shadow-md shadow-cyan-500/15"
              >
                <Edit className="w-4 h-4" />
                Edit Record
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContactDetails;
