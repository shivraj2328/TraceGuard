const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
// Color constants for Discord Embeds (Decimal format)
const SEVERITY_COLORS = {
  info: 3447003,      // Blue
  warning: 16776960,  // Yellow / Amber
  critical: 15158332, // Red
};

/**
 * Dispatches an alert to the configured Discord channel.
 * @param {Object} alert - The alert document from MongoDB
 */
async function sendToDiscord(alert) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
//   console.log(webhookUrl)
  if (!webhookUrl) {
    throw new Error('DISCORD_WEBHOOK_URL environment variable is missing.');
  }

  // Construct Discord Embed payload
  const payload = {
    username: 'Alert Center',
    embeds: [
      {
        title: `🚨 [${alert.severity.toUpperCase()}] ${alert.title}`,
        description: alert.message,
        color: SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.info,
        fields: [
          { name: 'Source', value: alert.source, inline: true },
          { name: 'Severity', value: alert.severity, inline: true },
          {
            name: 'Details',
            value: Object.keys(alert.metadata).length > 0 
              ? `\`\`\`json\n${JSON.stringify(alert.metadata, null, 2)}\n\`\`\`` 
              : 'None',
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: `Alert ID: ${alert._id}`,
        },
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Discord API returned ${response.status}: ${errorBody}`);
  }

  return true;
}

module.exports = { sendToDiscord };