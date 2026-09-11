const { sendToDiscord } = require("../services/discord");
const { logger } = require("../utils/logger");

const errorHandler = async (error, req, res, next) => {
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


  if (!err.statusCode || err.statusCode === 500) {
    await sendToDiscord({
      title: '500 Internal API Error',
      message: err.message,
      severity: 'warning',
      source: `Route: ${req.method} ${req.originalUrl}`,
      metadata: { 
        body: req.body, 
        user: req.user?.id || 'anonymous' 
      }
    }).catch(console.error); 
  }

  return res.status(status).json({
    success: false,
    message: errorMessage,
    errors: error.errors || [],
    data: error.data || null,
  });
};

module.exports = { errorHandler };
