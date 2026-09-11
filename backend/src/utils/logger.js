const pino = require("pino");

exports.logger = pino({
  level: "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
});