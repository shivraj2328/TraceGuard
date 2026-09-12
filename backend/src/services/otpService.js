const bcrypt = require("bcryptjs");

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = async (otp) => {
    return await bcrypt.hash(otp, 10);
};

const getOTPExpiry = () => {
    return new Date(Date.now() + 10 * 60 * 1000);
};

module.exports = {
    generateOTP,
    hashOTP,
    getOTPExpiry
};