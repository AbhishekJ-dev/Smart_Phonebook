// Premium Server Logging Utility with ANSI Color Formatting

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

const getTimestamp = () => {
  return new Date().toISOString();
};

export const logger = {
  info: (msg, ...args) => {
    console.log(`${colors.cyan}[INFO] [${getTimestamp()}]${colors.reset} ${msg}`, ...args);
  },
  
  success: (msg, ...args) => {
    console.log(`${colors.green}[SUCCESS] [${getTimestamp()}]${colors.reset} ${colors.bright}${msg}${colors.reset}`, ...args);
  },
  
  warn: (msg, ...args) => {
    console.warn(`${colors.yellow}[WARNING] [${getTimestamp()}]${colors.reset} ${msg}`, ...args);
  },
  
  error: (msg, err = '', ...args) => {
    console.error(
      `${colors.red}[ERROR] [${getTimestamp()}]${colors.reset} ${colors.bright}${msg}${colors.reset}`,
      err ? `\nDetails: ${err.stack || err.message || err}` : '',
      ...args
    );
  },

  db: (msg, ...args) => {
    console.log(`${colors.magenta}[DATABASE] [${getTimestamp()}]${colors.reset} ${msg}`, ...args);
  }
};

export default logger;
