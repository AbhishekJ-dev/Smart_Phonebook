import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Phone, Mail, Building, Eye, Edit3, Trash2, Heart, Search } from 'lucide-react';
import { useContacts } from '../context/ContactsContext.jsx';
import ContactCard from '../components/ContactCard.jsx';
import ContactTable from '../components/ContactTable.jsx';
import ContactModal from '../components/ContactModal.jsx';
import ConfirmationDialog from '../components/ConfirmationDialog.jsx';
import ContactDetails from './ContactDetails.jsx';
import { GridSkeleton } from '../components/Loader.jsx';

export const Favorites = () => {
  const {
    contacts,
    loading,
    pagination,
    fetchContacts,
    deleteContactAction,
    setFilters,
    filters
  } = useContacts();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [contactIdToDelete, setContactIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Force favorites filter on mount
  useEffect(() => {
    setFilters(prev => ({ ...prev, favorite: true }));
    return () => setFilters(prev => ({ ...prev, favorite: false }));
  }, []);

  useEffect(() => {
    const handleRefresh = () => fetchContacts(pagination.currentPage);
    window.addEventListener('refresh-contacts-list', handleRefresh);
    return () => window.removeEventListener('refresh-contacts-list', handleRefresh);
  }, [pagination.currentPage]);

  const favContacts = contacts.filter(c => c.favorite);
  const displayList = searchTerm
    ? favContacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
      )
    : favContacts;

  const handleEditTrigger = (contact) => {
    setContactToEdit(contact);
    setIsFormOpen(true);
  };
  const handleDeleteTrigger = (contactId) => {
    setContactIdToDelete(contactId);
    setIsDeleteOpen(true);
  };
  const handleViewTrigger = (contact) => {
    setSelectedContact(contact);
    setIsDetailsOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (contactIdToDelete) {
      const res = await deleteContactAction(contactIdToDelete);
      if (res?.success) {
        setIsDeleteOpen(false);
        setContactIdToDelete(null);
      }
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 select-none bg-slate-50 dark:bg-slate-950 transition-colors min-h-[calc(100vh-62px)]">
      
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-pink-500/10 dark:from-amber-500/10 dark:via-orange-900/10 dark:to-pink-900/10 border border-amber-200/50 dark:border-amber-800/20 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/30 dark:border-amber-500/20 shadow-sm">
            <Star className="w-7 h-7 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Starred <span className="text-amber-500">Favorites</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {favContacts.length} contact{favContacts.length !== 1 ? 's' : ''} bookmarked for quick access
            </p>
          </div>
        </div>
      </motion.div>

      {/* Local Search Filter */}
      {favContacts.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl cyber-input text-sm"
          />
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <GridSkeleton />
      ) : displayList.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayList.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteTrigger}
                onView={handleViewTrigger}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-16 glass-panel rounded-3xl border border-dashed border-amber-200 dark:border-amber-800/30 bg-amber-50/20 dark:bg-amber-900/5 text-center min-h-[300px]"
        >
          <div className="p-5 rounded-2xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-5 shadow-sm">
            <Heart className="w-10 h-10 text-amber-400" />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">No favorites yet</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-xs leading-relaxed">
            {searchTerm
              ? 'No favorites match your search filter.'
              : 'Star any contact from the Dashboard to bookmark them here for quick access.'}
          </p>
        </motion.div>
      )}

      {/* Modals */}
      <ContactModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        contactToEdit={contactToEdit}
      />
      <ContactDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        contact={selectedContact}
        onEdit={handleEditTrigger}
        onDelete={handleDeleteTrigger}
      />
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
        title="Delete Favorite Contact?"
        message="This will permanently delete this contact and remove them from your favorites."
        confirmLabel="Delete Contact"
      />
    </div>
  );
};

export default Favorites;
