const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendOTPEmail = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `"TraceGuard" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "TraceGuard - Email Verification OTP",
            text: `Your TraceGuard verification OTP is ${otp}. It will expire in 10 minutes.`,
            html: `
                <div>
                    <h2>TraceGuard Email Verification</h2>
                    <p>Your verification OTP is:</p>
                    <h1>${otp}</h1>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        });

        return info;
    } catch (error) {
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};

module.exports = {
    sendOTPEmail
};