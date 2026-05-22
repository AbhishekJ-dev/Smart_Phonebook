import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, User, Building, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContacts } from '../context/ContactsContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';

export const SearchBar = ({ onSelectContact }) => {
  const { 
    suggestLocal, 
    executeSmartSearch, 
    searchHistory, 
    searchQuery, 
    searchSource 
  } = useContacts();

  const [inputVal, setInputVal] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const containerRef = useRef(null);
  const debouncedQuery = useDebounce(inputVal, 400);

  // Sync state if searchQuery changes externally (e.g. from history click or clear filters)
  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  // Execute smart search automatically as the user types (after debouncing)
  useEffect(() => {
    if (debouncedQuery.trim() !== searchQuery.trim()) {
      executeSmartSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  // Handle live autocomplete predictions from the client-side Trie
  useEffect(() => {
    if (inputVal.trim().length > 0) {
      const matches = suggestLocal(inputVal);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [inputVal]);

  // Handle clicking outside the search component to dismiss suggestions
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    executeSmartSearch(inputVal);
  };

  const handleSuggestionClick = (contact) => {
    setInputVal(contact.name);
    setShowDropdown(false);
    if (onSelectContact) {
      onSelectContact(contact); // Open contact detail card
    } else {
      executeSmartSearch(contact.name);
    }
  };

  const handleHistoryClick = (query) => {
    setInputVal(query);
    setShowDropdown(false);
    executeSmartSearch(query);
  };

  const handleClearSearch = () => {
    setInputVal('');
    executeSmartSearch('');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-30">
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 z-10">
          <Search className="w-5 h-5" />
        </div>

        {/* Search Input field */}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full pl-12 pr-12 py-3 rounded-2xl cyber-input glass-panel text-sm md:text-base font-normal tracking-wide transition-all shadow-lg border border-slate-200 dark:border-slate-800/40 focus:ring-2 focus:ring-cyan-500/20"
        />

        {/* Clear Button */}
        {inputVal && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Telemetry Search Source indicators */}
      {searchQuery && (
        <div className="absolute top-[-24px] right-2 text-[10px] font-mono tracking-wider uppercase text-slate-400">
          Search Index: <span className={searchSource === 'trie' ? 'text-cyan-400 font-bold' : 'text-purple-400 font-bold'}>{searchSource}</span>
        </div>
      )}

      {/* Suggestion & History dropdown menu */}
      <AnimatePresence>
        {showDropdown && (suggestions.length > 0 || searchHistory.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute w-full mt-2 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/90 shadow-2xl overflow-hidden max-h-[380px] overflow-y-auto z-40 backdrop-blur-md"
          >
            {/* 1. Live Autocomplete Suggestions from browser memory Trie */}
            {suggestions.length > 0 && (
              <div className="p-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="block px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-cyan-500 dark:text-cyan-400">
                  Instant suggestions (Trie matches)
                </span>
                <div className="mt-1 space-y-0.5">
                  {suggestions.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => handleSuggestionClick(contact)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer"
                    >
                      {/* Avatar check */}
                      {contact.profile_picture ? (
                        <img
                          src={`http://localhost:5000/${contact.profile_picture}`}
                          alt={contact.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700/50"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {contact.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500 truncate">
                          <span className="truncate">{contact.phone}</span>
                          {contact.company && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                              <span className="flex items-center gap-0.5 truncate">
                                <Building className="w-3 h-3" />
                                {contact.company}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. User's Recent Search History Logs */}
            {searchHistory.length > 0 && !inputVal.trim() && (
              <div className="p-2">
                <span className="block px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Recent searches
                </span>
                <div className="mt-1 space-y-0.5">
                  {searchHistory.map((queryText, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleHistoryClick(queryText)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                    >
                      <Clock className="w-4 h-4 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{queryText}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
