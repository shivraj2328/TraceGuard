require("dotenv").config();
const { init, getConnection, SDKResponse } = require("tracegaurd");
const express = require("express");
const ENV = require("./utils/env");
const logger = require("./utils/logger");
const morgan = require("morgan");
const cors = require("cors");
const { default: helmet } = require("helmet");
const authRouter = require("./routes/auth.route");
const connectDB = require("./utils/connection");
const skillRouter = require("./routes/skill.route");
const internshipRouter = require("./routes/internship.route");

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

app.use("/api/auth", authRouter);
app.use("/api/skill", skillRouter);
app.use("/api/internship", internshipRouter);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "example express server" });
});

connectDB()
  .then(async () => {
    await init({
      connection: "http://localhost:3000/api/v1/telemetry/verify",
      id: "project_auth_service",
    });
    app.listen(ENV.PORT, () => {
      logger.info("server is listening on http://localhost:" + ENV.PORT);
    });
  })
  .catch((err) => {
    logger.error(err?.message);
    process.exit(1)
  });

// module.exports = app;
