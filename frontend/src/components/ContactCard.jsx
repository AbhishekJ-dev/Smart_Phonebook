import React from 'react';
import { Phone, Mail, Building, MapPin, Star, Edit, Trash2, Eye, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api.js';

export const ContactCard = ({ contact, onEdit, onDelete, onView }) => {
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
  
  // Clean up legacy URLs that might be stored in the DB
  const getProfilePicUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/^https?:\/\/localhost:\d+\//, '');
    return `${apiBase}/${cleanPath}`;
  };

  // Toggle favorite state — must send ALL required fields or validator returns 400
  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Stop click-through to open details
    
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
        // Refresh local view through standard fetch contacts in background
        window.dispatchEvent(new Event('refresh-contacts-list'));
      }
    } catch (err) {
      toast.error('Failed to update favorite status.');
    }
  };

  // Generate unique background gradient based on contact name letter
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
    <motion.div
      layout
      whileHover={{ y: -6, scale: 1.01 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, type: 'spring', stiffness: 200 }}
      className="group relative flex flex-col items-center justify-between p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/50 hover:border-cyan-500/30 dark:hover:border-cyan-400/20 hover:shadow-cyan-500/5 transition-all overflow-hidden cursor-pointer"
      onClick={() => onView(contact)}
    >
      {/* Favorite Floating Toggle Button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer"
        aria-label={contact.favorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className={`w-4.5 h-4.5 transition-colors ${
            contact.favorite 
              ? 'text-amber-400 fill-amber-400 stroke-amber-400' 
              : 'text-slate-400 dark:text-slate-500 hover:text-amber-400'
          }`}
        />
      </button>

      {/* Main Avatar and Header */}
      <div className="flex flex-col items-center mt-2 w-full text-center">
        {contact.profile_picture ? (
          <img
            src={getProfilePicUrl(contact.profile_picture)}
            alt={contact.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-800 shadow-md group-hover:border-cyan-500 dark:group-hover:border-cyan-400/50 transition-all duration-300"
          />
        ) : (
          <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${getGradient(contact.name)} flex items-center justify-center font-bold text-2xl shadow-md border-2 border-transparent group-hover:scale-105 transition-transform duration-300`}>
            {contact.name.charAt(0).toUpperCase()}
          </div>
        )}

        <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors w-full px-2">
          {contact.name}
        </h3>
        
        {contact.company ? (
          <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-medium text-slate-400 dark:text-slate-500 w-full px-4 min-w-0">
            <Building className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate min-w-0">{contact.company}</span>
          </div>
        ) : (
          <div className="h-5"></div> /* Maintain layout spacing */
        )}
      </div>

      {/* Content Details Grid */}
      <div className="w-full space-y-2 mt-5 py-2 border-t border-b border-slate-100 dark:border-slate-800/40 text-left min-w-0">
        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 w-full min-w-0">
          <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
          <span className="truncate select-all min-w-0">{contact.phone}</span>
        </div>
        
        {contact.email ? (
          <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 w-full min-w-0">
            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
            <span className="truncate select-all min-w-0">{contact.email}</span>
          </div>
        ) : (
          <div className="h-4"></div> /* Maintain equal card sizes */
        )}

        {/* Tags badge lists */}
        {Array.isArray(contact.tags) && contact.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-3 max-h-[22px] overflow-hidden w-full">
            {contact.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/30 max-w-[80px] min-w-0"
              >
                <Tag className="w-2 h-2 flex-shrink-0" />
                <span className="truncate min-w-0">{tag}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="h-6"></div>
        )}
      </div>

      {/* Action Buttons Drawer */}
      <div className="flex gap-2 mt-4 w-full opacity-90 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(contact);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/20 dark:border-slate-800/20 transition-all cursor-pointer focus:outline-none"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(contact);
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/10 transition-all cursor-pointer focus:outline-none"
          aria-label="Edit Contact"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(contact.id);
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all cursor-pointer focus:outline-none"
          aria-label="Delete Contact"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ContactCard;
