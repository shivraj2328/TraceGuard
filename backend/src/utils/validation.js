const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password) => {
    return typeof password === "string" && password.length >= 6;
};

const isValidOTP = (otp) => {
    return /^\d{6}$/.test(otp);
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidOTP
};