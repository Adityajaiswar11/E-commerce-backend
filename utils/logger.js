/**
 * logger.js — Structured logger for local dev + Vercel production
 *
 * - In production (VERCEL=1 or NODE_ENV=production): outputs JSON lines → searchable in Vercel logs
 * - In development: outputs colorized human-readable lines
 *
 * Usage:
 *   const logger = require('../utils/logger');
 *   logger.info('Order created', { order_id: 'order_xxx', amount: 500 });
 *   logger.error('Payment failed', { error: err.message });
 */

const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// ANSI colors for dev
const COLORS = {
  reset: '\x1b[0m',
  error: '\x1b[31m',  // red
  warn:  '\x1b[33m',  // yellow
  info:  '\x1b[36m',  // cyan
  debug: '\x1b[90m',  // grey
};

function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();

  if (isProd) {
    // JSON output → Vercel log explorer can filter/search by field
    const entry = {
      timestamp,
      level,
      message,
      ...meta,
    };
    // error and warn go to stderr so Vercel flags them
    if (level === 'error' || level === 'warn') {
      process.stderr.write(JSON.stringify(entry) + '\n');
    } else {
      process.stdout.write(JSON.stringify(entry) + '\n');
    }
  } else {
    // Pretty colored output for local dev
    const color = COLORS[level] || COLORS.reset;
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    const line = `${color}[${level.toUpperCase()}]${COLORS.reset} ${timestamp}  ${message}${metaStr}`;
    if (level === 'error' || level === 'warn') {
      console.error(line);
    } else {
      console.log(line);
    }
  }
}

const logger = {
  error: (msg, meta)  => log('error', msg, meta),
  warn:  (msg, meta)  => log('warn',  msg, meta),
  info:  (msg, meta)  => log('info',  msg, meta),
  debug: (msg, meta)  => log('debug', msg, meta),
};

module.exports = logger;
