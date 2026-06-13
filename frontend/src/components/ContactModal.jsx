import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContacts } from '../context/ContactsContext.jsx';

export const ContactModal = ({ isOpen, onClose, contactToEdit = null }) => {
  const { createContactAction, updateContactAction } = useContacts();

  // Basic Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  // Profile picture upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

  const getProfilePicUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^https?:\/\/localhost:\d+\//, '');
    return `${apiBase}/${cleanPath}`;
  };


  // Hydrate fields if editing an existing contact
  useEffect(() => {
    if (isOpen) {
      if (contactToEdit) {
        setName(contactToEdit.name || '');
        setPhone(contactToEdit.phone || '');
        setEmail(contactToEdit.email || '');
        setCompany(contactToEdit.company || '');
        setAddress(contactToEdit.address || '');
        setFavorite(contactToEdit.favorite || false);
        setTags(contactToEdit.tags || []);
        
        if (contactToEdit.profile_picture) {
          setImagePreview(getProfilePicUrl(contactToEdit.profile_picture));
        } else {
          setImagePreview(null);
        }
      } else {
        // Reset form for fresh Add Contact action
        setName('');
        setPhone('');
        setEmail('');
        setCompany('');
        setAddress('');
        setFavorite(false);
        setTags([]);
        setImagePreview(null);
        setSelectedFile(null);
      }
      setTagInput('');
    }
  }, [isOpen, contactToEdit]);

  // Handle image thumbnail generation on selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size cannot exceed 5MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Add individual tag to list
  const handleAddTag = (e) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase().replace(/[^\w]/g, ''); // keep alphanumeric only
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  // Remove tag from list
  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) return toast.error('Contact name is required.');
    if (!phone.trim()) return toast.error('Phone number is required.');

    setLoading(true);

    // Auto-commit any unadded tag in the input field before submission
    let finalTags = [...tags];
    const cleanTag = tagInput.trim().toLowerCase().replace(/[^\w]/g, '');
    if (cleanTag && !finalTags.includes(cleanTag)) {
      finalTags.push(cleanTag);
      setTags(finalTags);
    }

    // Build standard multipart request payload
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('phone', phone.trim());
    formData.append('email', email.trim() || '');
    formData.append('company', company.trim() || '');
    formData.append('address', address.trim() || '');
    formData.append('favorite', favorite ? 'true' : 'false');
    formData.append('tags', JSON.stringify(finalTags));
    
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    try {
      let result;
      if (contactToEdit) {
        result = await updateContactAction(contactToEdit.id, formData);
      } else {
        result = await createContactAction(formData);
      }

      if (result && result.success) {
        onClose(); // Dismiss drawer
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Sliding Side Form Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg h-full glass-panel border-l border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-950 shadow-2xl flex flex-col z-10"
          >
            {/* Header block */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/40">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                {contactToEdit ? 'Edit Contact details' : 'Create new contact'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form contents */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Profile Image Uploader */}
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="relative group w-20 h-20">
                    <img
                      src={imagePreview}
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-cyan-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="w-20 h-20 rounded-full border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 hover:text-cyan-500 dark:hover:text-cyan-400 hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors cursor-pointer"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                  </button>
                )}
                
                <span className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  JPEG, PNG, WEBP max 5MB size limit
                </span>
              </div>

              {/* Text Fields */}
              <div className="space-y-4 text-left">
                {/* Full Name */}
                <div>
                  <label htmlFor="name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl cyber-input text-sm"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl cyber-input text-sm font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl cyber-input text-sm"
                  />
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Company
                  </label>
                  <input
                    id="company-input"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl cyber-input text-sm"
                  />
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="2"
                    className="w-full px-4 py-2.5 rounded-xl cyber-input text-sm"
                  />
                </div>

                {/* Tags builder */}
                <div>
                  <label htmlFor="tag-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Categories / Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="tag-input"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl cyber-input text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/30 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Render added tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/10"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(idx)}
                            className="p-0.5 rounded-full hover:bg-cyan-200 dark:hover:bg-cyan-400/20 text-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Favorite Toggle Switch */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Favorite Status
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      Pin to quick-favorites dashboards
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFavorite(!favorite)}
                    className={`relative w-11 h-6 p-1 rounded-full transition-colors cursor-pointer focus:outline-none ${favorite ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full bg-white shadow-md border border-slate-200/50"
                      animate={{ x: favorite ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </form>

            {/* Bottom Form Action Buttons */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/40 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl shadow-md shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none"
              >
                {loading ? (
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                ) : (
                  <Check className="w-4.5 h-4.5" />
                )}
                {contactToEdit ? 'Save Changes' : 'Create Contact'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
