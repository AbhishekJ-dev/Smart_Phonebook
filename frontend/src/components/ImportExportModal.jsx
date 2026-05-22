import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle2, AlertCircle, Download, UploadCloud, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContacts } from '../context/ContactsContext.jsx';

export const ImportExportModal = ({ isOpen, onClose }) => {
  const { importContactsAction, exportContactsAction } = useContacts();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Import report states
  const [importReport, setImportReport] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileVerification(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileVerification(file);
  };

  const handleFileVerification = (file) => {
    // Check file format extension
    if (!file.name.endsWith('.csv')) {
      toast.error('Only CSV format files are supported.');
      return;
    }
    setSelectedFile(file);
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) return toast.error('Please select a CSV file first.');

    setLoading(true);
    setImportReport(null);

    try {
      const res = await importContactsAction(selectedFile);
      if (res && res.success) {
        setImportReport({
          success: true,
          meta: res.meta,
          errors: res.errors || []
        });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Downloads a template .csv file for references
  const downloadCSVTemplate = () => {
    const csvContent = 'Name,Phone,Email,Company,Address,Tags\r\n' +
                       'Elon Musk,18005550199,elon@spacex.com,SpaceX,Hawthorne California,Work;VIP\r\n' +
                       'Bill Gates,18005550188,bill@gatesfoundation.org,Microsoft,Seattle,Tech;Influencer\r\n' +
                       'Ada Lovelace,18005550100,ada@algorithm.org,Ada Labs,London,Friends;VIP\r\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'phonebook_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Import template downloaded.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
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
            className="relative w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-950 shadow-2xl z-10 flex flex-col max-h-[90vh] text-left"
          >
            {/* Close trigger */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3 mb-4">
              <FileText className="w-5 h-5 text-cyan-500" />
              CSV Import / Export Dashboard
            </h3>

            {/* Modal Body Scroll */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              
              {/* Export Panel Section */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Backup / Export Phonebook
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Download all your contacts in a standard CSV file
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportContactsAction}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-all shadow-md shadow-indigo-500/10 focus:outline-none cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              {/* CSV Upload Area Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Import Contacts Database
                  </h4>
                  <button
                    type="button"
                    onClick={downloadCSVTemplate}
                    className="flex items-center gap-1 text-[10px] font-bold text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 uppercase tracking-wide cursor-pointer focus:outline-none"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download template
                  </button>
                </div>

                {/* Drag and Drop Box */}
                <div
                  onDragOver={handleSearchSubmit => handleDragOver(handleSearchSubmit)}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 min-h-[140px] ${
                    isDragOver
                      ? 'border-cyan-500 bg-cyan-500/5'
                      : selectedFile
                      ? 'border-emerald-500/70 bg-emerald-500/5'
                      : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/10'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                  />
                  
                  <UploadCloud className={`w-10 h-10 mb-2 ${selectedFile ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`} />
                  
                  {selectedFile ? (
                    <div className="text-center">
                      <span className="block text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {selectedFile.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click to swap file
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Drag & Drop CSV file here
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        or click to browse local storage
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm upload button */}
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleImportSubmit}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs md:text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 rounded-xl transition-all shadow-md shadow-cyan-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    ) : (
                      'Execute CSV Data Import'
                    )}
                  </button>
                )}
              </div>

              {/* Import Reports Render Block */}
              {importReport && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10 space-y-3"
                >
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                    Ingestion Report Results
                  </h4>
                  
                  {/* Metric results grids */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-900 shadow-sm">
                      <span className="block text-lg font-bold text-slate-800 dark:text-white">
                        {importReport.meta.totalParsed}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-900 shadow-sm">
                      <span className="block text-lg font-bold text-emerald-500">
                        {importReport.meta.importedCount}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Imported</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-900 shadow-sm">
                      <span className="block text-lg font-bold text-amber-500">
                        {importReport.meta.skippedCount}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Skipped</span>
                    </div>
                  </div>

                  {/* Lines reports alerts */}
                  {importReport.errors.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-amber-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Skipped details
                      </span>
                      <div className="max-h-[140px] overflow-y-auto space-y-1 border border-slate-200/50 dark:border-slate-800/40 rounded-lg p-2 bg-white/70 dark:bg-slate-950/40 text-[10px] md:text-xs">
                        {importReport.errors.map((err, idx) => (
                          <div key={idx} className="flex gap-1.5 items-start text-slate-500 dark:text-slate-400 py-0.5 border-b border-slate-100 dark:border-slate-900/30 last:border-b-0">
                            <ChevronRight className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>
                              Row <span className="font-bold text-slate-700 dark:text-slate-200">{err.line}</span> ({err.name}):{' '}
                              {err.errors.join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImportExportModal;
