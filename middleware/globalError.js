const logger = require("../utils/logger");
const globalErrorMiddleware = (err, req, res, next) => {
  logger.error("GLOBAL ERROR START 🚨");

  logger.error("Time:", new Date().toISOString());
  logger.error("Method:", req.method);
  logger.error("URL:", req.originalUrl);

  logger.error("Headers:", {
    origin: req.headers.origin,
    authorization: req.headers.authorization
  });

  logger.error("Body:", req.body);

  logger.error("Error Message:", err.message);
  logger.error("Stack:", err.stack);

  logger.error("GLOBAL ERROR END ");

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

module.exports = globalErrorMiddleware;