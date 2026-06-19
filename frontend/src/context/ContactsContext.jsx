import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { ClientTrie } from '../utils/trie.js';

const ContactsContext = createContext();

export const ContactsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // State Containers
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchSource, setSearchSource] = useState('database'); // 'trie' or 'database_trigram'
  
  // Pagination & Filters States
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10
  });

  const [filters, setFilters] = useState({
    favorite: false,
    tag: '',
    company: ''
  });

  const [sortBy, setSortBy] = useState('name_asc'); // 'name_asc', 'name_desc', 'newest', 'oldest', 'updated'
  
  // Lists for dropdown filters
  const [activeCompanies, setActiveCompanies] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  // Client-Side Trie Instance (persistent across renders)
  const clientTrie = useMemo(() => new ClientTrie(), []);

  // Hydrate lists when authenticated state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts(1, true); // silent=true on initial load to avoid false error toasts
      fetchFiltersMetadata();
      fetchSearchHistory();
    } else {
      setContacts([]);
      setSearchResults([]);
      setSearchQuery('');
      setActiveCompanies([]);
      setActiveTags([]);
      setSearchHistory([]);
      clientTrie.rebuild([]);
    }
  }, [isAuthenticated, filters, sortBy]);

  /**
   * Fetches contacts list from API with sorting, filtering, and pages
   */
  const fetchContacts = async (page = 1, silent = false) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        sortBy,
      };
      
      if (filters.favorite) params.favorite = 'true';
      if (filters.tag) params.tag = filters.tag;
      if (filters.company) params.company = filters.company;

      const res = await api.get('/contacts', { params });
      if (res.data.success) {
        setContacts(res.data.contacts);
        setPagination(res.data.meta);
        
        if (page === 1 && !filters.tag && !filters.company && !filters.favorite) {
          clientTrie.rebuild(res.data.contacts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      if (!silent) {
        toast.error('Failed to load contacts list.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * High performance client-side Trie lookup (autocompletions)
   */
  const suggestLocal = (text) => {
    if (!text.trim()) return [];
    return clientTrie.search(text).slice(0, 8); // Return top 8 local prefix matches
  };

  /**
   * Debounced/Triggered Smart Search querying the API
   */
  const executeSmartSearch = async (queryText) => {
    setSearchQuery(queryText);
    if (!queryText.trim()) {
      setSearchResults([]);
      setSearchSource('trie');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/contacts/search', {
        params: { q: queryText, autocomplete: 'false' }
      });
      if (res.data.success) {
        setSearchResults(res.data.results);
        setSearchSource(res.data.source);
        // Refresh searches history
        fetchSearchHistory();
      }
    } catch (err) {
      console.error('Smart search error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create contact action supporting Multipart image uploads
   */
  const createContactAction = async (formData) => {
    try {
      const res = await api.post('/contacts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Contact added successfully!');
        fetchContacts(1);
        fetchFiltersMetadata();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create contact.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Update contact action supporting Multipart image uploads
   */
  const updateContactAction = async (contactId, formData) => {
    try {
      const res = await api.put(`/contacts/${contactId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Contact updated successfully!');
        fetchContacts(pagination.currentPage);
        if (searchQuery) executeSmartSearch(searchQuery); 
        fetchFiltersMetadata();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update contact details.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Delete contact action unlinking attachments
   */
  const deleteContactAction = async (contactId) => {
    try {
      const res = await api.delete(`/contacts/${contactId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Contact deleted successfully.');
        
        // Re-adjust page offset if last element of the page is deleted
        const remainingOnPage = contacts.length - 1;
        const newPage = remainingOnPage === 0 && pagination.currentPage > 1 
          ? pagination.currentPage - 1 
          : pagination.currentPage;
          
        fetchContacts(newPage);
        fetchFiltersMetadata();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete contact.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Bulk CSV imports with dynamic transactions
   */
  const importContactsAction = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/contacts/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Contacts imported successfully!');
        fetchContacts(1);
        fetchFiltersMetadata();
        return { success: true, meta: res.data.meta, errors: res.data.errors };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to import CSV file.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Export all contacts to CSV triggering browser download
   */
  const exportContactsAction = async () => {
    try {
      const res = await api.get('/contacts/export', { responseType: 'blob' });
      
      // Generate standard binary download link
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `phonebook_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Contacts database exported to CSV successfully!');
    } catch (err) {
      console.error('Failed to export contacts database:', err);
      toast.error('Failed to download CSV export.');
    }
  };

  /**
   * Pull distinct tags and companies lists for search filtering bars
   */
  const fetchFiltersMetadata = async () => {
    try {
      const res = await api.get('/contacts/filters');
      if (res.data.success) {
        setActiveCompanies(res.data.companies);
        setActiveTags(res.data.tags);
      }
    } catch (err) {
      console.error('Failed to load filters lookup lists:', err);
    }
  };

  /**
   * Fetch unique recent search logs
   */
  const fetchSearchHistory = async () => {
    try {
      const res = await api.get('/contacts/history');
      if (res.data.success) {
        setSearchHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load search logs:', err);
    }
  };

  /**
   * Resets entire filters structure
   */
  const clearFilters = () => {
    setFilters({
      favorite: false,
      tag: '',
      company: ''
    });
    setSortBy('name_asc');
    toast.success('Filters cleared.');
  };

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        loading,
        searchQuery,
        searchResults,
        searchSource,
        pagination,
        filters,
        sortBy,
        activeCompanies,
        activeTags,
        searchHistory,
        setFilters,
        setSortBy,
        fetchContacts,
        suggestLocal,
        executeSmartSearch,
        createContactAction,
        updateContactAction,
        deleteContactAction,
        importContactsAction,
        exportContactsAction,
        clearFilters
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
};

export default ContactsContext;
