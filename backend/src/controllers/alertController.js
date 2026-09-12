const Alert = require('../models/alert');
const { sendToDiscord } = require('../services/discord');

async function createAlert(req, res) {
  // 1. Verify incoming shared secret header
  const authHeader = req.headers['x-webhook-secret'];
  if (authHeader !== process.env.INCOMING_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: invalid secret' });
  }

  const { title, message, severity, source, metadata } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'title and message are required fields.' });
  }

  try {
    // 2. Persist record to database
    const alert = await Alert.create({
      title,
      message,
      severity,
      source,
      metadata,
    });

    // 3. Immediately respond to client so the sender does not timeout
    res.status(202).json({
      success: true,
      message: 'Alert accepted',
      alertId: alert._id,
    });

    // 4. Dispatch to Discord asynchronously
    try {
      await sendToDiscord(alert);
      alert.discordDeliveryStatus = 'sent';
      await alert.save();
    } catch (discordErr) {
      console.error('Failed to deliver alert to Discord:', discordErr.message);
      alert.discordDeliveryStatus = 'failed';
      await alert.save();
    }
  } catch (err) {
    console.error('Database write error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { createAlert };