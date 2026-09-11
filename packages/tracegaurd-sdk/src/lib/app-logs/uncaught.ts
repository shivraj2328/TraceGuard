// capture uncaught errors

import fs from "node:fs";
import process from "node:process";

import { logger } from "../../utils/logger";
import { SDKResponse } from "../../utils/response";

process?.on("uncaughtException", (error, origin) => {
  logger.error({
    msg: "error occurred while capturing uncaught errors",
    error,
  });

  logger.info({ msg: "origin details of this uncaught error", origin });
  try {
    fs.writeSync(
      process?.stderr.fd,
      `caught exception : ${error}` + `origin : ${origin}`,
    );

    let ORIGIN = {
      endpoint: "",
      filePath: null,
      timestamps: new Date().toISOString(),
    };

    const successRes = new SDKResponse(error.name, ORIGIN, 200, error.stack);

    return successRes;
  } finally {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});
