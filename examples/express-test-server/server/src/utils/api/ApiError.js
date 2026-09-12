class ApiError extends Error {
  constructor(name, message, statusCode, errors = []) {
    if (typeof statusCode !== "number") {
      throw new Error("statusCode must be number");
    }
    super(message);
    this.name = name || "ApiError";
    this.message = message;
    this.data = null;
    this.errors = errors;
    this.statusCode = statusCode;
    this.success = false;
  }
}

module.exports = ApiError;
