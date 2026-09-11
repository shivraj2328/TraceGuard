const mongoose = require("mongoose");

const BreadcrumbSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    category: { type: String, default: "custom" },
    level: { type: String, default: "info" },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: {
      type: mongoose.Schema.Types.Mixed,
      default: () => new Date().toISOString(),
    },
  },
  { _id: false },
);

const TelemetryEventSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, index: true },
    event: { type: String, required: true, index: true },
    origin: {
      endpoint: { type: String, default: null },
      filePath: { type: String, default: null },
      timestamps: { type: Date, default: null },
    },
    statusCode: { type: Number, default: null },
    message: { type: String, default: "" },
    error: { type: mongoose.Schema.Types.Mixed, default: null },
    errorType: { type: String, default: null },
    stack: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
    breadcrumbs: [BreadcrumbSchema],
  },
  { timestamps: true },
);

// Fast index for dashboard and project trace lookups
TelemetryEventSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model("TelemetryEvent", TelemetryEventSchema);
