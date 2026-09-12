const express = require("express");
const authRoutes = require("./authRoutes");
const telemetryRoutes = require("./telemetryRoutes");
const metricsRoutes = require("./metricsRoutes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/telemetry", telemetryRoutes);
router.use("/metrics", metricsRoutes);

module.exports = router;
