const express = require("express");
const authRoutes = require("./authRoutes");
const telemetryRoutes = require("./telemetryRoutes")

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/telemetry", telemetryRoutes);

module.exports = router;
