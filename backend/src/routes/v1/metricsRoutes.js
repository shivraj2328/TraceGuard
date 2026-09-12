const express = require("express");
const router = express.Router();
const { verifyApiKey } = require("../../middleware/apiKeyMiddleware");
const {
  ingestMetrics,
  getLatestMetrics,
  getMetricsHistory,
} = require("../../controllers/metricsController");

// Agent pushes payload here
router.post("/", verifyApiKey, ingestMetrics);

// Dashboard/UI fetch endpoints
router.get("/latest", getLatestMetrics);
router.get("/history", getMetricsHistory);

module.exports = router;
