// routes/telemetry.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/telemetryController");

// Health check for init()
router.head("/verify", controller.verifyConnection);

// Direct event ingestion
router.post("/events", controller.ingestEvent);

//  Direct breadcrumbs addition
router.post("/events/:eventId/breadcrumbs", controller.appendBreadcrumbs);

// Fetching telemetry responses
router.get("/projects/events", controller.fetchTelemetry);

module.exports = router;
