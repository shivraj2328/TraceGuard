require("dotenv").config();
const { init, getConnection, SDKResponse, MetricAgent } = require("tracegaurd"); // Ensure this matches the name in your package.json
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const ENV = require("./utils/env");
const logger = require("./utils/logger");
const authRouter = require("./routes/auth.route");
const connectDB = require("./utils/connection");

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "example express server" });
});
const tracegaurdPkg = require("tracegaurd");
console.log("TRACEGAURD KEYS:", Object.keys(tracegaurdPkg));
console.log("METRIC AGENT TYPE:", typeof tracegaurdPkg.MetricAgent);
console.log("TRACEGAURD RESOLVED TO:", require.resolve("tracegaurd"));
connectDB()
  .then(async () => {
    app.listen(ENV.PORT, () => {
      logger.info("server is listening on http://localhost:" + ENV.PORT);
    });

    await init({
      connection: `${process.env.BASE_MAIN_BACKEND_URL}/api/v1/telemetry/verify`,
      id: "project_test_server",
    });

    const agent = new MetricAgent({
      endpoint: `${process.env.BASE_MAIN_BACKEND_URL}/api/v1/metrics`,
      apiKey: process.env.METRICS_API_KEY,
      serviceName: "test-server",
      intervalMs: 15000,
      onError: (err) => logger.error(`[MetricAgent]: ${err.message}`),
    });

    agent.start();
  })
  .catch((err) => {
    logger.error(err?.message);
    process.exit(1);
  });
