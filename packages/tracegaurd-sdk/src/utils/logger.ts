import pino from "pino";
import { CONSTANTS } from "../config/constants.config";

const logger = pino({
  level: CONSTANTS.NODE_ENV === "production" ? "info" : "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
});

export { logger };
