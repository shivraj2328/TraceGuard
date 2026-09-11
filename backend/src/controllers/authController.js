const { logger } = require("../utils/logger");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const OTP = require("../models/otp");

const {
    generateOTP,
    hashOTP,
    getOTPExpiry
} = require("../services/otpService");

const { sendOTPEmail } = require("../services/emailService");

const {
    isValidEmail,
    isValidPassword,
    isValidOTP
} = require("../utils/validation");

// Register + Send OTP
const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword
        });

        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);

        await OTP.deleteMany({ email });

        await OTP.create({
            email,
            otp: hashedOTP,
            expiresAt: getOTPExpiry()
        });

        await sendOTPEmail(email, otp);

        logger.info(`Registration OTP sent to ${email}`);

        return res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to your email.",
            userId: user._id
        });
    } catch (error) {
        next(error);
    }
};

// Verify OTP
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        if (!isValidOTP(otp)) {
            return res.status(400).json({
                success: false,
                message: "OTP must be a 6-digit number"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired"
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });

            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        const isOTPValid = await bcrypt.compare(
            otp,
            otpRecord.otp
        );

        if (!isOTPValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        user.isEmailVerified = true;
        await user.save();

        await OTP.deleteOne({ _id: otpRecord._id });

        logger.info(`Email verified successfully for ${email}`);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Resend OTP
const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);

        await OTP.deleteMany({ email });

        await OTP.create({
            email,
            otp: hashedOTP,
            expiresAt: getOTPExpiry()
        });

        await sendOTPEmail(email, otp);

        logger.info(`OTP resent to ${email}`);

        return res.status(200).json({
            success: true,
            message: "OTP resent successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );

        logger.info(`User logged in successfully: ${email}`);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get Current User
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select(
            "-password"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    verifyOTP,
    resendOTP,
    login,
    getMe
};