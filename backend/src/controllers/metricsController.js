const ServerMetric = require("../models/ServerMetric");

/**
 * Ingestion handler: Receives payload from MetricAgent
 * POST /api/metrics
 */
const ingestMetrics = async (req, res) => {
  try {
    const { serviceName, hostname, timestamp, loadAverage, memory } = req.body;

    // Basic payload shape validation
    if (!serviceName || !hostname || !loadAverage || !memory) {
      return res.status(400).json({
        error:
          "Malformed payload: serviceName, hostname, loadAverage, and memory are required.",
      });
    }

    const metric = new ServerMetric({
      serviceName,
      hostname,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      loadAverage,
      memory,
    });

    await metric.save();

    return res.status(201).json({ success: true, id: metric._id });
  } catch (err) {
    console.error("[Metrics Ingestion Error]:", err.message);
    return res.status(500).json({ error: "Failed to persist metric snapshot" });
  }
};

/**
 * Single latest snapshot for dashboard status badge
 * GET /api/metrics/latest?service=test-server
 */
const getLatestMetrics = async (req, res) => {
  try {
    const { service } = req.query;

    const filter = service ? { serviceName: service } : {};
    const metric = await ServerMetric.findOne(filter)
      .sort({ timestamp: -1 })
      .lean();

    if (!metric) {
      return res
        .status(404)
        .json({ error: "No metrics found for specified service" });
    }

    return res.status(200).json(metric);
  } catch (err) {
    console.error("[Get Latest Metric Error]:", err.message);
    return res.status(500).json({ error: "Failed to fetch latest metric" });
  }
};

/**
 * Historical time-series query for rendering charts
 * GET /api/metrics/history?service=test-server&minutes=60
 */
const getMetricsHistory = async (req, res) => {
  try {
    const { service, minutes = 60, limit = 500 } = req.query;

    const windowMinutes = Math.min(
      Math.max(parseInt(minutes, 10) || 60, 1),
      10080,
    ); // Max 7 days
    const maxRecords = Math.min(parseInt(limit, 10) || 500, 2000);
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    const filter = {
      timestamp: { $gte: since },
      ...(service && { serviceName: service }),
    };

    const metrics = await ServerMetric.find(filter)
      .sort({ timestamp: 1 })
      .limit(maxRecords)
      .lean();

    return res.status(200).json({
      service: service || "all",
      timeframeMinutes: windowMinutes,
      count: metrics.length,
      data: metrics,
    });
  } catch (err) {
    console.error("[Get Metrics History Error]:", err.message);
    return res.status(500).json({ error: "Failed to fetch metrics history" });
  }
};

module.exports = {
  ingestMetrics,
  getLatestMetrics,
  getMetricsHistory,
};
