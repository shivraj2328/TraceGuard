const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    source: {
      type: String,
      default: 'api-server',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    discordDeliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);