const mongoose = require("mongoose");
const WebhookConfig = require("../models/webhookConfig");
const { sendWebhook } = require("./webhookService");
const { logger } = require("../utils/logger");

/**
 * Dispatches an event to all matching active webhooks.
 *
 * @param {Object} event - Event descriptor
 * @param {string} event.event_type - e.g. "critical_error", "server_error", "cpu_spike"
 * @param {string} [event.severity="medium"] - "low" | "medium" | "high" | "critical"
 * @param {string} [event.service_name="TraceGuard"] - Source service name
 * @param {string} [event.message=""] - Human-readable alert summary
 * @param {Object} [event.metadata={}] - Detailed event payload / context
 * @param {string} [event.userId] - Optional: target webhooks owned by specific user
 * @returns {Promise<Array<{ webhookId: string, success: boolean, attempts: number, error?: string }>>}
 */
const dispatch = async (event) => {
    try {
        if (!event || !event.event_type) {
            logger.warn({ msg: "Alert dispatcher received event without event_type", event });
            return [];
        }

        // Fast-fail if MongoDB is not connected
        if (mongoose.connection.readyState !== 1) {
            logger.warn({ msg: "Alert dispatcher skipped: database not ready", readyState: mongoose.connection.readyState });
            return [];
        }

        const query = {
            isActive: true,
            events: event.event_type
        };

        if (event.userId) {
            query.userId = event.userId;
        }

        // Optimize query using projection and lean() for low memory footprint
        const matchingWebhooks = await WebhookConfig.find(query)
            .select("_id name url secret retryCount events")
            .lean();

        if (matchingWebhooks.length === 0) {
            logger.debug({
                msg: "No active webhooks subscribed to event",
                event_type: event.event_type
            });
            return [];
        }

        logger.info({
            msg: `Dispatching alert to ${matchingWebhooks.length} webhook(s)`,
            event_type: event.event_type,
            severity: event.severity || "medium"
        });

        // Fire deliveries in parallel via Promise.allSettled
        const deliveryPromises = matchingWebhooks.map(async (webhook) => {
            const result = await sendWebhook(webhook, event);
            return {
                webhookId: webhook._id,
                webhookName: webhook.name,
                ...result
            };
        });

        const settledResults = await Promise.allSettled(deliveryPromises);

        const results = settledResults.map((r, idx) => {
            if (r.status === "fulfilled") {
                return r.value;
            }
            return {
                webhookId: matchingWebhooks[idx]._id,
                webhookName: matchingWebhooks[idx].name,
                success: false,
                attempts: 1,
                error: r.reason ? r.reason.message : "Unknown dispatch error"
            };
        });

        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.length - successCount;

        logger.info({
            msg: "Alert dispatch completed",
            event_type: event.event_type,
            total: results.length,
            success: successCount,
            failures: failureCount
        });

        return results;
    } catch (err) {
        logger.error({
            msg: "Unexpected error inside alertDispatcher.dispatch",
            error: err.message
        });
        return [];
    }
};

module.exports = {
    dispatch
};