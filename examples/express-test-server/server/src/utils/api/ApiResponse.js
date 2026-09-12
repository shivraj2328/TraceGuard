class ApiResponse {
  constructor(name, message, data, statusCode, metadata = undefined) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.name = name;
    this.message = message;
    this.metadata = metadata;
    this.data = data;
  }
}

module.exports = ApiResponse;
