import React from 'react';

/**
 * Concentric glowing neon spinner for page-level blocking loads
 */
export const Loader = ({ message = 'Loading phonebook...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-6">
      <div className="relative w-16 h-16">
        {/* Glowing concentric outer circle */}
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-cyan-500 animate-spin"></div>
        {/* Glowing concentric inner circle spinning counter-clockwise */}
        <div className="absolute inset-2 rounded-full border-4 border-b-transparent border-l-transparent border-indigo-400 animate-spin-reverse"></div>
      </div>
      <p className="mt-4 text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400 animate-pulse">
        {message}
      </p>
    </div>
  );
};

/**
 * Visual skeleton container for Grid Contacts cards
 */
export const GridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 flex flex-col items-center"
        >
          {/* Avatar sphere */}
          <div className="w-20 h-20 rounded-full skeleton-loader mb-4"></div>
          {/* Name strip */}
          <div className="h-5 w-32 rounded-lg skeleton-loader mb-2"></div>
          {/* Company strip */}
          <div className="h-4 w-24 rounded-lg skeleton-loader mb-4"></div>
          
          <div className="w-full space-y-2 mt-2">
            {/* Phone strip */}
            <div className="h-4 w-full rounded-lg skeleton-loader"></div>
            {/* Email strip */}
            <div className="h-4 w-full rounded-lg skeleton-loader"></div>
          </div>
          
          {/* Action tags */}
          <div className="flex gap-2 mt-4 w-full justify-center">
            <div className="h-8 w-16 rounded-full skeleton-loader"></div>
            <div className="h-8 w-16 rounded-full skeleton-loader"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Visual skeleton container for tabular lists
 */
export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40">
      <div className="min-w-full divide-y divide-slate-200/30 dark:divide-slate-800/20">
        <div className="bg-slate-50/50 dark:bg-slate-900/30 h-12 flex items-center px-6">
          <div className="grid grid-cols-5 w-full gap-4">
            <div className="h-4 w-24 skeleton-loader rounded"></div>
            <div className="h-4 w-24 skeleton-loader rounded"></div>
            <div className="h-4 w-32 skeleton-loader rounded"></div>
            <div className="h-4 w-20 skeleton-loader rounded"></div>
            <div className="h-4 w-16 skeleton-loader rounded justify-self-end"></div>
          </div>
        </div>
        <div className="divide-y divide-slate-200/30 dark:divide-slate-800/20 px-6 py-2">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="h-16 flex items-center">
              <div className="grid grid-cols-5 w-full gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full skeleton-loader"></div>
                  <div className="h-4 w-20 skeleton-loader rounded"></div>
                </div>
                <div className="h-4 w-28 skeleton-loader rounded"></div>
                <div className="h-4 w-36 skeleton-loader rounded"></div>
                <div className="flex gap-1">
                  <div className="h-5 w-12 skeleton-loader rounded-full"></div>
                </div>
                <div className="h-8 w-20 skeleton-loader rounded-full justify-self-end"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;
