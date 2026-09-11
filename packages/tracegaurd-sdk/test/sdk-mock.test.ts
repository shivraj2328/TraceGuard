    import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
    import { SDKResponse, type TOrigin } from "../src/utils/response";
    import { init, getConnection } from "../src/init";

    // Mock global fetch for testing init() network calls
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    // Mock the logger to keep test logs silent
    vi.mock("../src/utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
    }));

    describe("SDKResponse", () => {
    const dummyOrigin: TOrigin = {
        endpoint: "/api/v1/auth",
        filePath: "src/auth.ts",
        timestamps: new Date(),
    };

    it("initializes with pending defaults and null status", () => {
        const res = new SDKResponse("EVENT_CREATE", dummyOrigin, null, null);

        expect(res.event).toBe("EVENT_CREATE");
        expect(res.origin).toEqual(dummyOrigin);
        expect(res.statusCode).toBeNull();
        expect(res.message).toBe("");
        expect(res.error).toBeNull();
        expect(res.metadata).toBeNull();
        expect(res.errorType).toBeUndefined();
        expect(res.stack).toBeNull();
        expect(res.breadcrumbs).toEqual([]);
        expect(res.isSuccess()).toBe(false);
        expect(res.isError()).toBe(false);
    });

    describe("stack normalization", () => {
        it("extracts stack string from an Error instance", () => {
        const err = new Error("Database query failed");
        const res = new SDKResponse("DB_ERR", dummyOrigin, 500, err);

        expect(res.stack).toContain("Error: Database query failed");
        });

        it("accepts a raw string as stack trace", () => {
        const customStack = "at functionA (file.ts:1:1)";
        const res = new SDKResponse("TRACE_ERR", dummyOrigin, 500, customStack);

        expect(res.stack).toBe(customStack);
        });

        it("converts unknown truthy objects to string and falsey to null", () => {
        const resWithObj = new SDKResponse("NUM_ERR", dummyOrigin, 500, 12345);
        expect(resWithObj.stack).toBe("12345");

        const resWithNull = new SDKResponse(
            "NULL_ERR",
            dummyOrigin,
            null,
            undefined,
        );
        expect(resWithNull.stack).toBeNull();
        });
    });

    describe("breadcrumbs", () => {
        it("appends breadcrumb items with optional options and data", () => {
        const res = new SDKResponse("STEP_TRACE", dummyOrigin, null, null);

        res.addBreadCrumb("User authenticated", {
            category: "auth",
            level: "info",
            data: { userId: 42 },
        });

        expect(res.breadcrumbs).toHaveLength(1);
        expect(res.breadcrumbs[0].message).toBe("User authenticated");
        expect(res.breadcrumbs[0].category).toBe("auth");
        expect(res.breadcrumbs[0].level).toBe("info");
        expect(res.breadcrumbs[0].data).toEqual({ userId: 42 });
        expect(typeof res.breadcrumbs[0].timestamp).toBe("string");
        });

        it("chains method calls when adding breadcrumbs", () => {
        const res = new SDKResponse("CHAIN_EVENT", dummyOrigin, null, null);

        res
            .addBreadCrumb("Step 1", { category: "validation" })
            .addBreadCrumb("Step 2", { category: "http" });

        expect(res.breadcrumbs).toHaveLength(2);
        expect(res.breadcrumbs[0].message).toBe("Step 1");
        expect(res.breadcrumbs[1].message).toBe("Step 2");
        });
    });

    describe("setSuccess", () => {
        it("sets metadata and success message, clearing error state", () => {
        const res = new SDKResponse("LOGIN_EVENT", dummyOrigin, 200, null);
        const payload = { ...dummyOrigin, endpoint: "/api/v1/dashboard" };

        res.setSuccess(payload, "Login successful");

        expect(res.metadata).toEqual(payload);
        expect(res.message).toBe("Login successful");
        expect(res.error).toBeNull();
        expect(res.errorType).toBeUndefined();
        expect(res.isSuccess()).toBe(true);
        expect(res.isError()).toBe(false);
        });

        it("defaults message to 'Success' if none is passed", () => {
        const res = new SDKResponse("DEFAULT_SUCCESS", dummyOrigin, 200, null);
        res.setSuccess(dummyOrigin);

        expect(res.message).toBe("Success");
        });
    });

    describe("setError", () => {
        it("sets error object, message, and automatically records an error breadcrumb", () => {
        const res = new SDKResponse("FAIL_EVENT", dummyOrigin, 500, null);

        res.setError(
            { message: "Timeout occurred", code: "ETIMEDOUT" },
            "NetworkError",
        );

        expect(res.error).toEqual({
            message: "Timeout occurred",
            code: "ETIMEDOUT",
            raw: { message: "Timeout occurred", code: "ETIMEDOUT" },
        });
        expect(res.errorType).toBe("NetworkError");
        expect(res.message).toBe("Timeout occurred");
        expect(res.metadata).toBeNull();
        expect(res.isError()).toBe(true);
        expect(res.isSuccess()).toBe(false);

        // Verify breadcrumb generation
        const autoBreadcrumb = res.breadcrumbs[res.breadcrumbs.length - 1];
        expect(autoBreadcrumb.message).toBe("Timeout occurred");
        expect(autoBreadcrumb.category).toBe("custom");
        expect(autoBreadcrumb.level).toBe("error");
        expect(autoBreadcrumb.data?.code).toBe("ETIMEDOUT");
        expect(autoBreadcrumb.data?.errorType).toBe("NetworkError");
        });

        it("falls back to default message if none is supplied", () => {
        const res = new SDKResponse("EMPTY_FAIL", dummyOrigin, 500, null);
        res.setError({}, "GenericError");

        expect(res.error?.message).toBe("An error occurred");
        expect(res.message).toBe("An error occurred");
        });
    });

    describe("status evaluation", () => {
        it("identifies 2xx as success and non-2xx/errors as error", () => {
        const okResponse = new SDKResponse("OK", dummyOrigin, 201, null);
        expect(okResponse.isSuccess()).toBe(true);
        expect(okResponse.isError()).toBe(false);

        const badResponse = new SDKResponse("BAD", dummyOrigin, 404, null);
        expect(badResponse.isSuccess()).toBe(false);
        expect(badResponse.isError()).toBe(true);
        });
    });
    });

 describe("Traceguard init & getConnection", () => {
   beforeEach(() => {
     vi.clearAllMocks();
   });

   afterEach(() => {
     vi.restoreAllMocks();
   });

   it("throws error if credentials are missing or empty", async () => {
     // Await the promise rejection because init is async
     await expect(init({ connection: "", id: "" })).rejects.toThrow(
       "connection credentials for traceguard not passed",
     );
   });

   it("throws if getConnection() is invoked before connection is verified", () => {
     expect(() => getConnection()).toThrow("not ready to connect");
   });

   it("sends HEAD request and sets state to connected on resolution", async () => {
     // Include ok: true so res.ok check passes
     mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

     // Await init directly
     await init({
       connection: "https://backend.traceguard.dev",
       id: "app-123",
     });

     expect(mockFetch).toHaveBeenCalledWith("https://backend.traceguard.dev", {
       method: "HEAD",
     });

     const conn = getConnection();
     expect(conn.isConnected).toBe(true);
     expect(conn.connectionUrl).toBe("https://backend.traceguard.dev");
     expect(conn.id).toBe("app-123");
   });

   it("handles fetch rejection and logs error", async () => {
     const networkErr = new Error("Network unreachable");
     mockFetch.mockRejectedValueOnce(networkErr);

     // Await the rejection rather than letting it escape unhandled
     await expect(
       init({ connection: "https://bad-endpoint.internal", id: 999 }),
     ).rejects.toThrow("Network unreachable");

     expect(() => getConnection()).toThrow("not ready to connect");
   });
 });
