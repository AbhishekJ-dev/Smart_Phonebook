import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileSpreadsheet, 
  LayoutGrid, 
  List, 
  Trash, 
  Star, 
  Building,
  Tag,
  BookOpen,
  FilterX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContacts } from '../context/ContactsContext.jsx';
import SearchBar from '../components/SearchBar.jsx';
import ContactCard from '../components/ContactCard.jsx';
import ContactTable from '../components/ContactTable.jsx';
import Pagination from '../components/Pagination.jsx';
import ContactModal from '../components/ContactModal.jsx';
import ImportExportModal from '../components/ImportExportModal.jsx';
import ContactDetails from './ContactDetails.jsx';
import ConfirmationDialog from '../components/ConfirmationDialog.jsx';
import { GridSkeleton, TableSkeleton } from '../components/Loader.jsx';

export const Dashboard = () => {
  const {
    contacts,
    loading,
    searchQuery,
    searchResults,
    pagination,
    filters,
    sortBy,
    activeCompanies,
    activeTags,
    setFilters,
    setSortBy,
    fetchContacts,
    deleteContactAction,
    clearFilters
  } = useContacts();

  // Layout View State: 'grid' or 'list'
  const [viewLayout, setViewLayout] = useState(() => {
    return localStorage.getItem('viewLayout') || 'grid';
  });

  // Modal Open/Close Controls States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected contact data models
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [contactIdToDelete, setContactIdToDelete] = useState(null);

  // Synchronously listen to global refresh events triggered from child stars toggles
  useEffect(() => {
    const handleRefresh = () => {
      fetchContacts(pagination.currentPage);
    };
    window.addEventListener('refresh-contacts-list', handleRefresh);
    return () => window.removeEventListener('refresh-contacts-list', handleRefresh);
  }, [pagination.currentPage]);

  // Persist layout choices
  useEffect(() => {
    localStorage.setItem('viewLayout', viewLayout);
  }, [viewLayout]);

  const handlePageChange = (page) => {
    fetchContacts(page);
  };

  const handleEditTrigger = (contact) => {
    setContactToEdit(contact);
    setIsFormOpen(true);
  };

  const handleAddTrigger = () => {
    setContactToEdit(null);
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
      if (res && res.success) {
        setIsDeleteOpen(false);
        setContactIdToDelete(null);
      }
    }
  };

  // Compile Dynamic Telemetry Stats from standard records list
  const totalContactsCount = pagination.totalItems || contacts.length;
  
  const totalFavoritesCount = contacts.filter(c => c.favorite).length;

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.favorite) count++;
    if (filters.tag) count++;
    if (filters.company) count++;
    if (sortBy !== 'name_asc') count++;
    return count;
  };

  const displayList = searchQuery ? searchResults : contacts;

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 select-none bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* 1. Metrics Analytics Telemetry Row */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Total Directory */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/40 flex items-center gap-3 shadow-sm relative overflow-hidden group">
          <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-cyan-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-300" />
          <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
              Directory Size
            </span>
            <span className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {totalContactsCount}
            </span>
          </div>
        </div>

        {/* Metric 2: Favorite Bookmarks */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/40 flex items-center gap-3 shadow-sm relative overflow-hidden group">
          <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-300" />
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-500 shadow-sm flex-shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
              Starred
            </span>
            <span className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {totalFavoritesCount}
            </span>
          </div>
        </div>

        {/* Metric 3: Unique Tags */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/40 flex items-center gap-3 shadow-sm relative overflow-hidden group">
          <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-300" />
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shadow-sm flex-shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
              Categories
            </span>
            <span className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {activeTags.length}
            </span>
          </div>
        </div>

        {/* Metric 4: Unique Companies */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/40 flex items-center gap-3 shadow-sm relative overflow-hidden group">
          <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-300" />
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm flex-shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
              Companies
            </span>
            <span className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {activeCompanies.length}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Smart Search Row */}
      <section className="w-full">
        <SearchBar onSelectContact={handleViewTrigger} />
      </section>

      {/* 3. Action Toolbar Panel */}
      <section className="glass-panel p-3 md:p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/30 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shadow-sm">
        
        {/* Sorting and Filters */}
        <div className="flex flex-wrap gap-2.5 items-center">
          
          {/* Sort drop box */}
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-0.5 tracking-wider">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none"
            >
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="updated">Updated</option>
            </select>
          </div>

          {/* Company filter */}
          {activeCompanies.length > 0 && (
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-0.5 tracking-wider">Company</span>
              <select
                value={filters.company}
                onChange={(e) => setFilters(p => ({ ...p, company: e.target.value }))}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none max-w-[120px]"
              >
                <option value="">All Companies</option>
                {activeCompanies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters */}
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer focus:outline-none mt-3.5"
            >
              <FilterX className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Layout Swappers and Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Grid / List toggle */}
          <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/30">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${viewLayout === 'grid' ? 'bg-white dark:bg-slate-900 text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${viewLayout === 'list' ? 'bg-white dark:bg-slate-900 text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* CSV Import/Export */}
          <button
            onClick={() => setIsCsvOpen(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/20 dark:border-slate-800/20 transition-all cursor-pointer focus:outline-none"
            aria-label="CSV Panel"
            title="Import / Export CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          {/* Add Contact */}
          <button
            onClick={handleAddTrigger}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-all shadow-md shadow-cyan-500/10 cursor-pointer focus:outline-none whitespace-nowrap"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Add Contact</span>
            <span className="sm:hidden">Add</span>
          </button>

        </div>

      </section>

      {/* 4. Main Content Renderer (List Table or Card Grid) */}
      <section className="w-full relative min-h-[300px]">
        {loading ? (
          // Loading skeletons animations
          viewLayout === 'grid' ? <GridSkeleton /> : <TableSkeleton />
        ) : displayList.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {viewLayout === 'grid' ? (
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
            ) : (
              <ContactTable
                contacts={displayList}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteTrigger}
                onView={handleViewTrigger}
              />
            )}
          </AnimatePresence>
        ) : (
          // Empty State view panel
          <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/10 text-center min-h-[250px]">
            <span className="text-3xl mb-3">📇</span>
            <h4 className="text-base font-bold text-slate-800 dark:text-white">
              No contacts found
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
              {searchQuery 
                ? `No local Trie or database similarity matches found for "${searchQuery}".` 
                : 'Your phonebook is currently empty. Click "Add Contact" or import a CSV file to get started!'}
            </p>
          </div>
        )}
      </section>

      {/* 5. Pagination row element */}
      {!searchQuery && !loading && (
        <section className="w-full">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      )}

      {/* 6. Intersected Sub-Modals drawers */}
      <ContactModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        contactToEdit={contactToEdit}
      />

      <ImportExportModal
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
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
        title="Delete Contact Record?"
        message="Are you absolutely sure you want to delete this contact? Their profile image and indexing cache will be unlinked and purged permanently."
        confirmLabel="Purge Contact"
      />

    </div>
  );
};

export default Dashboard;
