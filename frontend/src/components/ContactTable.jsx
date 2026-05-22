import React from 'react';
import { Phone, Mail, Building, Star, Edit, Trash2, Eye, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api.js';

export const ContactTable = ({ contacts, onEdit, onDelete, onView }) => {
  const serverUrl = 'http://localhost:5000';

  const handleToggleFavorite = async (contact, e) => {
    e.stopPropagation();
    try {
      // Must send ALL required fields — backend validator requires name & phone on every PUT
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
    <div className="w-full overflow-x-auto rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md">
      <table className="min-w-full divide-y divide-slate-200/30 dark:divide-slate-800/20 text-left">
        <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4.5">Contact</th>
            <th className="px-6 py-4.5">Phone Number</th>
            <th className="px-6 py-4.5">Email Address</th>
            <th className="px-6 py-4.5">Company / Org</th>
            <th className="px-6 py-4.5">Tags</th>
            <th className="px-6 py-4.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/20">
          {contacts.map((contact) => (
            <motion.tr
              key={contact.id}
              onClick={() => onView(contact)}
              className="group hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors duration-150 cursor-pointer"
            >
              {/* Profile and Name */}
              <td className="px-6 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleToggleFavorite(contact, e)}
                    className="p-1 rounded-full text-slate-400 hover:text-amber-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    aria-label="Toggle Favorite"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        contact.favorite 
                          ? 'text-amber-400 fill-amber-400 stroke-amber-400' 
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                  
                  {contact.profile_picture ? (
                    <img
                      src={`${serverUrl}/${contact.profile_picture}`}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getGradient(contact.name)} flex items-center justify-center font-bold text-sm shadow-sm`}>
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="min-w-0">
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      {contact.name}
                    </span>
                  </div>
                </div>
              </td>

              {/* Phone */}
              <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 select-all font-mono tracking-tight">
                {contact.phone}
              </td>

              {/* Email */}
              <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 select-all">
                {contact.email || <span className="text-slate-300 dark:text-slate-800">-</span>}
              </td>

              {/* Company */}
              <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {contact.company ? (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                    <span>{contact.company}</span>
                  </div>
                ) : (
                  <span className="text-slate-300 dark:text-slate-800">-</span>
                )}
              </td>

              {/* Tags */}
              <td className="px-6 py-3.5 whitespace-nowrap">
                <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                  {Array.isArray(contact.tags) && contact.tags.length > 0 ? (
                    contact.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/30"
                      >
                        <Tag className="w-2 h-2" />
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-300 dark:text-slate-800 text-sm">-</span>
                  )}
                </div>
              </td>

              {/* Actions */}
              <td className="px-6 py-3.5 whitespace-nowrap text-right text-sm">
                <div className="flex gap-1.5 justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(contact);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer focus:outline-none"
                    aria-label="View Contact"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(contact);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/10 transition-all cursor-pointer focus:outline-none"
                    aria-label="Edit Contact"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(contact.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all cursor-pointer focus:outline-none"
                    aria-label="Delete Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactTable;
