const { getConnection, SDKResponse } = require("@traceops/traceguard-sdk");

const User = require("../models/user.model");
const logger = require("../utils/logger");
const ApiError = require("../utils/api/ApiError");
const ApiResponse = require("../utils/api/ApiResponse");

// Custom Error Classes
class DatabaseConnectionError extends Error {
  constructor(message = "Failed to communicate with primary database cluster") {
    super(message);
    this.name = "DatabaseConnectionError";
    this.code = "DB_CLUSTER_TIMEOUT";
  }
}

class DatabaseIngestionError extends Error {
  constructor(message = "Failed to add data") {
    super(message);
    this.name = "DataIngestionError";
    this.code = "DB_Ingestion";
  }
}

class PaymentRequiredError extends Error {
  constructor(message = "Account suspended due to billing failure") {
    super(message);
    this.name = "PaymentRequiredError";
    this.code = "PAYMENT_OVERDUE";
  }
}

// Helper to push telemetry directly to the backend
async function sendTelemetry(sdkResponse) {
  try {
    const conn = getConnection();

    // Strip '/verify' from connectionUrl so it hits /events
    const baseUrl = conn.connectionUrl.replace(/\/verify\/?$/, "");
    const targetUrl = `${baseUrl}/events`;

    // console.log(`[Telemetry] Sending event to: ${targetUrl}`);
    // fundamental
    // NOTE ; use something better for add data intead of using fetch
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": conn.id,
      },
      body: JSON.stringify(sdkResponse),
    });

    const data = await res.json();
    logger.info({ msg: `[Telemetry] Backend response (${res.status}):`, data });
  } catch (telemetryErr) {
    logger.error({
      msg: "[Telemetry] Failed to post event:",
      error: telemetryErr.message,
    });
  }
}

const signIn = async (req, res) => {
  const origin = {
    endpoint: req.originalUrl || "/signin",
    filePath: "controllers/auth.controller.js",
    timestamps: new Date(),
  };

  const telemetry = new SDKResponse("AUTH_SIGNIN", origin, null, null);

  try {
    // ---------------- PURPOSEFUL BREAK TRIGGERS ----------------
    const forceCrash = req.headers["x-force-crash"] || req.query.crash;

    if (forceCrash === "db") {
      telemetry.addBreadCrumb("Attempting MongoDB cluster discovery", {
        category: "database",
        level: "warning",
      });

      throw new ApiError(
        "DatabaseConnectionError",
        "Replica set member 10.0.0.4 failed to answer heartbeats within 5000ms",
        500,
      );
    }

    // Crash 2: TypeError (calling method on undefined)
    if (forceCrash === "type_error") {
      telemetry.addBreadCrumb("Parsing custom authentication headers", {
        category: "auth_middleware",
        level: "info",
      });
      const uninitializedObject = null;
      uninitializedObject.processToken(); // Throws TypeError: Cannot read properties of null
    }

    // Crash 3: Custom Business Logic Error via payload
    if (req.body?.email === "banned@company.com") {
      telemetry.addBreadCrumb(
        "Verifying account standing with billing provider",
        {
          category: "stripe",
          level: "info",
        },
      );
      //   throw new PaymentRequiredError("User subscription lapsed on 2026-09-01");
      throw new ApiError(
        "PaymentRequiredError",
        "User subscription lapsed on 2026-09-01",
        400,
      );
    }
    // -----------------------------------------------------------

    const { email, password } = req.body;

    telemetry.addBreadCrumb("Received signin payload", {
      category: "request_validation",
      level: "info",
      data: { hasEmail: Boolean(email), hasPassword: Boolean(password) },
    });

    if (!email) {
      telemetry.statusCode = 400;
      telemetry.setError({ message: "email is required" }, "ValidationError");
      await sendTelemetry(telemetry);

      throw new ApiError("invaliEmail", "invalid or email not passed", 400);
    }

    if (!password) {
      telemetry.statusCode = 400;
      telemetry.setError(
        { message: "password is required" },
        "ValidationError",
      );
      await sendTelemetry(telemetry);

      throw new ApiError(
        "passwordIsRequired",
        "invalid or password not passed",
        400,
      );
    }

    telemetry.addBreadCrumb("Querying user record", {
      category: "database",
      level: "info",
      data: { email },
    });

    let user = await User.findOne({ email });

    if (user) {
      console.log("user.password !== password", user.password !== password);
      if (user.password !== password) {
        throw new ApiError("Password error", "invalid password", 400);
      }

      const response = new ApiResponse(
        "userExist",
        "user already exists",
        user,
        200,
      );
      telemetry.setSuccess(
        { userId: user._id.toString(), email: user.email },
        "User logged in successfully",
      );
      return res.status(response.statusCode).json(response);
    }

    if (!user) {
      telemetry.addBreadCrumb("User not found, registering new account", {
        category: "database",
        level: "info",
      });
      user = await User.create({ email, password });
    }

    logger.info({ user }, "user logged in successfully");

    telemetry.statusCode = 200;
    telemetry.setSuccess(
      { userId: user._id.toString(), email: user.email },
      "User logged in successfully",
    );

    await sendTelemetry(telemetry);

    return res.status(200).json({
      message: "user logged in successfully",
      success: true,
      data: { userId: user._id, email: user.email },
    });
  } catch (error) {
    logger.error(error);

    telemetry.statusCode = error.statusCode || 500;
    telemetry.stack = error.stack || String(error);

    // Automatically extracts the custom error name (e.g., DatabaseConnectionError, TypeError)
    telemetry.setError(
      {
        message: error.message || "Internal server error",
        code: error.code || "ERR_UNHANDLED_EXCEPTION",
      },
      error.name || "InternalServerError",
    );

    await sendTelemetry(telemetry);

    return res.status(telemetry.statusCode).json({
      message: error.message || "internal server error",
      success: false,
      data: null,
    });
  }
};

module.exports = { signIn, DatabaseConnectionError, PaymentRequiredError };
