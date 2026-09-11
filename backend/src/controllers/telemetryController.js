/***
 *
 * here we will write api controller related to communication between npm package
 *
 * this is going to be main backend which will provide connectionUrl , projectId , extra details
 *
 * we need to implement breadcrudmbs
 *
 * api controller we need
 * 1. adding all data to database direct
 * 2. adding breadcrumbs to datbase
 * 3. fetching all those responses
 * **/

const TelemetryEvent = require("../models/telemetry");

//  Handshake verification (Satisfies `init()` HEAD request)
exports.verifyConnection = (req, res) => {
  return res.status(200).end();
};

//  Adding all data to database direct (Full SDKResponse payload)
exports.ingestEvent = async (req, res) => {
  try {
    const projectId =
      req.headers["x-project-id"] || req.body.projectId || req.body.id;

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId or id" });
    }

    const {
      event,
      origin,
      statusCode,
      message,
      error,
      errorType,
      stack,
      metadata,
      breadcrumbs,
    } = req.body;

    if (!event) {
      return res.status(400).json({ error: "Missing required 'event' name" });
    }

    const doc = await TelemetryEvent.create({
      projectId,
      event,
      origin,
      statusCode,
      message,
      error,
      errorType,
      stack,
      metadata,
      breadcrumbs: Array.isArray(breadcrumbs) ? breadcrumbs : [],
    });

    return res.status(201).json({
      success: true,
      eventId: doc._id,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to persist event" });
  }
};

//  Adding breadcrumbs to database
exports.appendBreadcrumbs = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { breadcrumbs } = req.body;

    if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
      return res
        .status(400)
        .json({ error: "breadcrumbs must be a non-empty array" });
    }

    const updated = await TelemetryEvent.findByIdAndUpdate(
      eventId,
      { $push: { breadcrumbs: { $each: breadcrumbs } } },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Event record not found" });
    }

    return res.status(200).json({
      success: true,
      totalBreadcrumbs: updated.breadcrumbs.length,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to append breadcrumbs" });
  }
};

//  Fetching all those responses
exports.fetchTelemetry = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, event, errorType } = req.query;

    const filter = { projectId };
    if (event) filter.event = event;
    if (errorType) filter.errorType = errorType;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [records, total] = await Promise.all([
      TelemetryEvent.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      TelemetryEvent.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch responses" });
  }
};
