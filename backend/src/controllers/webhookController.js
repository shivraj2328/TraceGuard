const WebhookConfig = require("../models/webhookConfig");
const { sendWebhook } = require("../services/webhookService");
const { logger } = require("../utils/logger");

/**
 * Validate URL protocol
 */
const isValidUrl = (urlString) => {
    try {
        const parsed = new URL(urlString);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
};

/**
 * Create a new webhook configuration
 * POST /api/v1/webhooks
 */
const createWebhook = async (req, res, next) => {
    try {
        const { name, url, secret, events, retryCount } = req.body;
        const userId = req.user.userId;

        if (!name || !url) {
            return res.status(400).json({
                status: "error",
                message: "Webhook 'name' and 'url' are required"
            });
        }

        const trimmedUrl = url.trim();
        if (!isValidUrl(trimmedUrl)) {
            return res.status(400).json({
                status: "error",
                message: "A valid HTTP or HTTPS URL must be provided"
            });
        }

        const webhook = await WebhookConfig.create({
            userId,
            name: name.trim(),
            url: trimmedUrl,
            secret: secret ? secret.trim() : null,
            events: Array.isArray(events) && events.length > 0 ? events : undefined,
            retryCount: typeof retryCount === "number" ? Math.min(Math.max(retryCount, 0), 5) : 3
        });

        logger.info({
            msg: "Webhook configuration created",
            webhookId: webhook._id,
            userId,
            url: webhook.url
        });

        return res.status(201).json({
            status: "success",
            message: "Webhook configuration created successfully",
            data: webhook
        });
    } catch (error) {
        logger.error({
            msg: "Error creating webhook configuration",
            error: error.message
        });
        next(error);
    }
};

/**
 * Get all webhook configurations for the authenticated user
 * GET /api/v1/webhooks
 */
const getWebhooks = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const webhooks = await WebhookConfig.find({ userId }).sort({ createdAt: -1 }).lean();

        return res.status(200).json({
            status: "success",
            results: webhooks.length,
            data: webhooks
        });
    } catch (error) {
        logger.error({
            msg: "Error fetching webhooks",
            error: error.message
        });
        next(error);
    }
};

/**
 * Get a single webhook configuration by ID
 * GET /api/v1/webhooks/:id
 */
const getWebhookById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const webhook = await WebhookConfig.findOne({ _id: id, userId }).lean();

        if (!webhook) {
            return res.status(404).json({
                status: "error",
                message: "Webhook configuration not found"
            });
        }

        return res.status(200).json({
            status: "success",
            data: webhook
        });
    } catch (error) {
        logger.error({
            msg: "Error fetching webhook by ID",
            error: error.message
        });
        next(error);
    }
};

/**
 * Update an existing webhook configuration
 * PUT /api/v1/webhooks/:id
 */
const updateWebhook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { name, url, secret, events, isActive, retryCount } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (url !== undefined) {
            const trimmedUrl = url.trim();
            if (!isValidUrl(trimmedUrl)) {
                return res.status(400).json({
                    status: "error",
                    message: "A valid HTTP or HTTPS URL must be provided"
                });
            }
            updates.url = trimmedUrl;
        }
        if (secret !== undefined) updates.secret = secret ? secret.trim() : null;
        if (events !== undefined) {
            if (!Array.isArray(events) || events.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Events must be a non-empty array of strings"
                });
            }
            updates.events = events;
        }
        if (isActive !== undefined) updates.isActive = Boolean(isActive);
        if (retryCount !== undefined) updates.retryCount = Math.min(Math.max(Number(retryCount), 0), 5);

        const webhook = await WebhookConfig.findOneAndUpdate(
            { _id: id, userId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!webhook) {
            return res.status(404).json({
                status: "error",
                message: "Webhook configuration not found"
            });
        }

        logger.info({
            msg: "Webhook configuration updated",
            webhookId: webhook._id,
            userId
        });

        return res.status(200).json({
            status: "success",
            message: "Webhook configuration updated successfully",
            data: webhook
        });
    } catch (error) {
        logger.error({
            msg: "Error updating webhook configuration",
            error: error.message
        });
        next(error);
    }
};

/**
 * Delete a webhook configuration
 * DELETE /api/v1/webhooks/:id
 */
const deleteWebhook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const webhook = await WebhookConfig.findOneAndDelete({ _id: id, userId });

        if (!webhook) {
            return res.status(404).json({
                status: "error",
                message: "Webhook configuration not found"
            });
        }

        logger.info({
            msg: "Webhook configuration deleted",
            webhookId: id,
            userId
        });

        return res.status(200).json({
            status: "success",
            message: "Webhook configuration deleted successfully"
        });
    } catch (error) {
        logger.error({
            msg: "Error deleting webhook configuration",
            error: error.message
        });
        next(error);
    }
};

/**
 * Send a test ping payload to verify the webhook target endpoint
 * POST /api/v1/webhooks/:id/test
 */
const testWebhook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const webhook = await WebhookConfig.findOne({ _id: id, userId });

        if (!webhook) {
            return res.status(404).json({
                status: "error",
                message: "Webhook configuration not found"
            });
        }

        const testPayload = {
            event_type: "test_ping",
            severity: "low",
            service_name: "TraceGuard-Test-Service",
            message: "This is a test notification from your TraceGuard monitoring platform. If you see this, your webhook connection is working perfectly!",
            metadata: {
                testTriggeredBy: req.user.email,
                webhookName: webhook.name
            }
        };

        const result = await sendWebhook(webhook, testPayload);

        return res.status(200).json({
            status: result.success ? "success" : "error",
            message: result.success ? "Test ping delivered successfully" : "Test ping delivery failed",
            deliveryDetails: result
        });
    } catch (error) {
        logger.error({
            msg: "Error sending test webhook",
            error: error.message
        });
        next(error);
    }
};

module.exports = {
    createWebhook,
    getWebhooks,
    getWebhookById,
    updateWebhook,
    deleteWebhook,
    testWebhook
};