const pino = require("pino");

// Check if running in production mode
const isProduction = process.env.NODE_ENV === "production";

// Create and configure the Pino logger instance
const logger = pino({
  // Log all 'debug' & higher in development; restrict to 'info' & higher in production for performance
  level: isProduction ? "info" : "debug",
  // Standardize log timestamps to readable ISO-8601 UTC format (e.g., 2026-08-27T20:58:02.924Z)
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = { logger };
