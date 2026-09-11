const { logger } = require("../utils/logger");

const errorHandler = (error, req, res, next) => {
  logger.error({
    msg: "Internal Server Error Occurred",
    message: error?.message || "internal server error",
    stackTrace: error?.stack || "error stack !",
    err: error,
    route: req.originalUrl,
    method: req.method,
    userId: req.body?.userId || req.params?.userId || null,
  });

  // Determine the final error message cleanly in one place
  const errorMessage = error?.error?.description || error?.message || "Internal Server Error";
  const status = typeof error.statusCode === "number" ? error.statusCode : 500;

  return res.status(status).json({
    success: false,
    message: errorMessage,
    errors: error.errors || [],
    data: error.data || null,
  });
};

module.exports = { errorHandler };
