const mongoose = require("mongoose");
const ENV = require("./env");
const logger = require("./logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    logger.info(
      { host: conn.connection.host },
      "mongodb connected successfully",
    );
  } catch (error) {
    logger.error({ msg: "failed to connect to database", error });
    process.exit(1);
  }
};

module.exports = connectDB;
