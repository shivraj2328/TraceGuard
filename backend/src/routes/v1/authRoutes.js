const express = require("express");

const {
    register,
    verifyOTP,
    resendOTP,
    login,
    getMe
} = require("../../controllers/authController");

const authenticate = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);

router.get("/me", authenticate, getMe);

module.exports = router;