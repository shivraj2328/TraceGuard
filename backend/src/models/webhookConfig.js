const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); const {
    createWebhook,
    getWebhooks,
    getWebhookById,
    updateWebhook,
    deleteWebhook,
    testWebhook
} = require("../../controllers/webhookController");

// Protect all webhook management routes with authentication
router.use(authMiddleware);

router.post("/", createWebhook);
router.get("/", getWebhooks);
router.get("/:id", getWebhookById);
router.put("/:id", updateWebhook);
router.delete("/:id", deleteWebhook);
router.post("/:id/test", testWebhook);

module.exports = router;