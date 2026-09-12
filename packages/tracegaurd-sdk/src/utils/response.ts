export type TBreadcrumbCategory =
  "http" | "auth" | "validation" | "navigation" | "custom";

export interface IBreadcrumb {
  message: string;
  category?: TBreadcrumbCategory;
  level?: "info" | "warning" | "error";
  data?: Record<string, any>;
  timestamp: string;
}

export type TOrigin = {
  endpoint: string | null;
  filePath: string | null;
  timestamps: string | Date;
  connectionUrl?: string;
  sessionId?: string | number;
};

export interface SDKError {
  message: string;
  code?: string;
  raw?: any;
}

// Use Generics for flexible metadata typing
export class SDKResponse<T = TOrigin> {
  event: string;
  message: string;
  error: SDKError | null;
  metadata: T | null;
  statusCode: number | null;
  errorType?: string;
  origin: TOrigin;
  stack: any;
  timestamps: string | Date;
  breadcrumbs: IBreadcrumb[] = [];
  constructor(
    event: string,
    origin: TOrigin, // Moved before optional arg
    statusCode: number | null = null,
    stack: any,
  ) {
    this.event = event;
    this.origin = origin;
    this.statusCode = statusCode;
    this.message = "";
    this.error = null;
    this.metadata = null;
    this.errorType = undefined;
    if (stack instanceof Error) {
      this.stack = stack.stack || stack.message;
    } else if (typeof stack === "string") {
      this.stack = stack;
    } else {
      this.stack = stack ? String(stack) : null;
    }
    this.timestamps = new Date().toISOString();
  }

  /**
   * Append a breadcrumb to record execution history leading to errors/success
   * @reason :  breadcrumbs to find out the why we occurred this error
   */
  addBreadCrumb(
    message: string,
    options: {
      category?: TBreadcrumbCategory;
      level?: "info" | "warning" | "error";
      data?: Record<string, any>;
    } = {},
  ): this {
    this.breadcrumbs.push({
      message,
      category: options.category,
      level: options.level,
      data: options.data,
      timestamp: new Date().toDateString(),
    });
    return this;
  }

  setSuccess(metadata: T, message?: string): this {
    this.metadata = metadata;
    this.message = message || "Success";
    this.error = null;
    this.errorType = undefined;
    return this;
  }

  setError(
    error: Partial<SDKError>,
    errorType: string,
    message?: string,
  ): this {
    // Ensure we always have a valid SDKError object
    this.error = {
      message: error.message || message || "An error occurred",
      code: error.code,
      raw: error,
    };
    this.errorType = errorType;
    this.message = this.error.message;
    this.metadata = null;

    this.addBreadCrumb(this?.error?.message, {
      category: "custom",
      level: "error",
      data: { code: error.code, message, errorType },
    });
    return this;
  }

  isSuccess(): boolean {
    return (
      this.statusCode !== null &&
      this.statusCode >= 200 &&
      this.statusCode < 300
    );
  }

  isError(): boolean {
    return (
      this.error !== null ||
      (this.statusCode !== null &&
        (this.statusCode < 200 || this.statusCode >= 300))
    );
  }
}
