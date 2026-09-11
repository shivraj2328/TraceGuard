const crypto = require("crypto");
const mongoose = require("mongoose");
const { logger } = require("../utils/logger");
const WebhookConfig = require("../models/webhookConfig");

/**
 * Generate HMAC SHA-256 signature for payload verification
 */
const generateSignature = (secret, payloadString) => {
    if (!secret) return null;
    return crypto.createHmac("sha256", secret).update(payloadString).digest("hex");
};

/**
 * Helper delay function for exponential backoff
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Formats color code for Discord embeds based on severity
 */
const getSeverityColor = (severity) => {
    switch ((severity || "").toLowerCase()) {
        case "critical":
            return 15158332; // Red
        case "high":
            return 15105570; // Orange
        case "low":
            return 3447003;  // Blue
        default:
            return 16776960; // Yellow
    }
};

/**
 * Sends a webhook notification with retries, signature signing, and status tracking.
 *
 * @param {Object} webhookConfig - Webhook configuration object or document
 * @param {Object} eventPayload - Event data to deliver
 * @returns {Promise<{ success: boolean, attempts: number, statusCode?: number, error?: string }>}
 */
const sendWebhook = async (webhookConfig, eventPayload) => {
    const timeoutMs = parseInt(process.env.WEBHOOK_TIMEOUT_MS, 10) || 5000;
    const maxRetries = typeof webhookConfig.retryCount === "number" ? Math.min(webhookConfig.retryCount, 5) : 3;

    const deliveryId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const eventType = eventPayload.event_type || "general_alert";
    const severity = (eventPayload.severity || "medium").toLowerCase();
    const serviceName = eventPayload.service_name || "TraceGuard-Core";
    const message = eventPayload.message || "No message provided";

    // Standardized multi-platform envelope (Slack, Discord, and Generic REST)
    const enrichedPayload = {
        event_id: eventPayload.event_id || `evt_${crypto.randomBytes(8).toString("hex")}`,
        event_type: eventType,
        severity,
        service_name: serviceName,
        message,
        // Slack text representation
        text: `🚨 *[TraceGuard ${severity.toUpperCase()}]* ${message} (Service: ${serviceName})`,
        // Discord content & rich embed cards
        content: `🚨 **[TraceGuard ${severity.toUpperCase()}]** ${message} (Service: \`${serviceName}\`)`,
        embeds: [
            {
                title: `TraceGuard Alert: ${eventType}`,
                description: message,
                color: getSeverityColor(severity),
                fields: [
                    { name: "Service", value: serviceName, inline: true },
                    { name: "Severity", value: severity.toUpperCase(), inline: true },
                    { name: "Timestamp", value: eventPayload.timestamp || timestamp, inline: false }
                ]
            }
        ],
        timestamp: eventPayload.timestamp || timestamp,
        metadata: eventPayload.metadata || {},
        dashboard_link: eventPayload.dashboard_link || null
    };

    const payloadString = JSON.stringify(enrichedPayload);

    // Build standard headers
    const headers = {
        "Content-Type": "application/json",
        "User-Agent": "TraceGuard-Webhook-Service/1.0",
        "X-TraceGuard-Event": eventType,
        "X-TraceGuard-Delivery": deliveryId,
        "X-TraceGuard-Timestamp": timestamp
    };

    if (webhookConfig.secret) {
        const signature = generateSignature(webhookConfig.secret, payloadString);
        headers["X-TraceGuard-Signature"] = `sha256=${signature}`;
    }

    let attempt = 0;
    let lastError = null;
    let lastStatusCode = null;
    let isDelivered = false;

    while (attempt <= maxRetries && !isDelivered) {
        attempt++;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            logger.info({
                msg: "Dispatching webhook event",
                webhookId: webhookConfig._id,
                url: webhookConfig.url,
                attempt,
                deliveryId
            });

            const response = await fetch(webhookConfig.url, {
                method: "POST",
                headers,
                body: payloadString,
                signal: controller.signal
            });

            clearTimeout(timer);
            lastStatusCode = response.status;

            // 2xx status codes indicate success
            if (response.ok) {
                isDelivered = true;
                logger.info({
                    msg: "Webhook delivered successfully",
                    webhookId: webhookConfig._id,
                    statusCode: response.status,
                    attempt,
                    deliveryId
                });
                break;
            }

            const responseText = await response.text().catch(() => "");
            lastError = `Target responded with HTTP ${response.status}: ${responseText.slice(0, 200)}`;
            logger.warn({
                msg: "Webhook delivery returned non-2xx status",
                webhookId: webhookConfig._id,
                statusCode: response.status,
                attempt,
                error: lastError
            });
        } catch (err) {
            clearTimeout(timer);
            lastError = err.name === "AbortError" ? `Request timed out after ${timeoutMs}ms` : err.message;
            logger.warn({
                msg: "Webhook delivery attempt failed",
                webhookId: webhookConfig._id,
                attempt,
                error: lastError
            });
        }

        // Exponential backoff before next retry (1s, 2s, 4s...)
        if (attempt <= maxRetries && !isDelivered) {
            const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            await delay(backoffDelay);
        }
    }

    // Persist status updates to MongoDB if connection is active
    if (webhookConfig._id && mongoose.connection.readyState === 1) {
        try {
            await WebhookConfig.findByIdAndUpdate(webhookConfig._id, {
                lastTriggeredAt: new Date(),
                lastStatus: isDelivered ? "success" : "failed"
            });
        } catch (dbErr) {
            logger.error({
                msg: "Failed to update webhook delivery status in DB",
                webhookId: webhookConfig._id,
                error: dbErr.message
            });
        }
    }

    return {
        success: isDelivered,
        attempts: attempt,
        statusCode: lastStatusCode,
        error: isDelivered ? null : lastError
    };
};

module.exports = {
    sendWebhook,
    generateSignature
};