require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const { logger } = require("./utils/logger");

// Importing custom error handler middleware
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//versioning
const v1Routes = require("./routes/v1");
app.use("/api/v1", v1Routes);

// Root endpoint / Health check
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "TraceGuard API is running " });
});

app.use(errorHandler);
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(err);
  });
