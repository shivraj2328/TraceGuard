// test-alert.js
require('dotenv').config();
const { sendToDiscord } = require('../src/services/discord'); // Adjust path if needed

async function runTest() {
  console.log('Attempting to send a test alert to Discord...');

  // Mock alert data matching the schema expected by discord.service.js
  const mockAlert = {
    _id: 'test-12345-abcde',
    title: 'Webhook Integration Test',
    message: 'Hello! Your Node.js backend is successfully communicating with Discord.',
    severity: 'info', // Try changing this to 'warning' or 'critical'
    source: 'test-script',
    metadata: {
      environment: 'development',
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    }
  };

  try {
    await sendToDiscord(mockAlert);
    console.log('✅ Success! Check your Discord channel.');
  } catch (error) {
    console.error('❌ Failed to send alert.');
    console.error('Error details:', error.message);
    console.error('Make sure your .env file has the correct DISCORD_WEBHOOK_URL.');
  }
}

runTest();