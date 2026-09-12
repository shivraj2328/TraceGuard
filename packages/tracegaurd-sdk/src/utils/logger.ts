import pino from "pino";
import { CONSTANTS } from "../config/constants.config";

const logger = pino({
  level: "info",
  timestamp: pino.stdTimeFunctions.isoTime,
});

export { logger };
