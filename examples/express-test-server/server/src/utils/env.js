require("dotenv").config();

const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
};

module.exports = ENV;
