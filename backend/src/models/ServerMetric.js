const mongoose = require("mongoose");

const ServerMetricSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    hostname: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    loadAverage: {
      oneMinute: { type: Number, required: true },
      fiveMinutes: { type: Number, required: true },
      fifteenMinutes: { type: Number, required: true },
    },
    memory: {
      totalBytes: { type: Number, required: true },
      freeBytes: { type: Number, required: true },
      usedPercentage: { type: Number, required: true },
    },
  },
  {
    versionKey: false,
  },
);

// Compound index for time-window queries filtered by service
ServerMetricSchema.index({ serviceName: 1, timestamp: -1 });

// TTL Index: Deletes documents automatically after 14 days (1,209,600 seconds)
ServerMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 1209600 });

module.exports = mongoose.model("ServerMetric", ServerMetricSchema);
