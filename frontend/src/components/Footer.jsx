import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-100 dark:border-slate-800/40 py-8 text-center bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm">
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
        © {new Date().getFullYear()} Smart Phonebook Search Engine. <br />
        <span className="opacity-80">Developed By Abhishek J & Twinkle Taleda.</span>
      </p>
      <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 mt-2 uppercase tracking-widest">
        v1.0.0 • Built with Node.js, PostgreSQL & React
      </p>
    </footer>
  );
};

export default Footer;
