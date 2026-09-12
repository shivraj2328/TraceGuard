import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import os from "os";
import { MetricAgent } from "../src/utils/os-details";

describe("MetricAgent (Vitest)", () => {
  const mockEndpoint = "https://telemetry.example.com/v1/metrics";
  const mockApiKey = "secret-token-123";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Stub global fetch
    vi.stubGlobal("fetch", vi.fn());

    // Spy on OS functions to provide predictable outputs
    vi.spyOn(os, "loadavg").mockReturnValue([1.5, 2.0, 2.5]);
    vi.spyOn(os, "totalmem").mockReturnValue(16_000_000_000);
    vi.spyOn(os, "freemem").mockReturnValue(4_000_000_000);
    vi.spyOn(os, "hostname").mockReturnValue("test-instance-01");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("collectMetrics", () => {
    it("should compute load averages and calculate correct memory percentages", () => {
      const agent = new MetricAgent({
        endpoint: mockEndpoint,
        serviceName: "auth-service",
      });

      const payload = agent.collectMetrics();

      expect(payload.serviceName).toBe("auth-service");
      expect(payload.hostname).toBe("test-instance-01");
      expect(payload.loadAverage).toEqual({
        oneMinute: 1.5,
        fiveMinutes: 2.0,
        fifteenMinutes: 2.5,
      });

      // Total: 16GB, Free: 4GB -> Used: 12GB -> 75%
      expect(payload.memory.totalBytes).toBe(16_000_000_000);
      expect(payload.memory.freeBytes).toBe(4_000_000_000);
      expect(payload.memory.usedPercentage).toBe(75);
      expect(new Date(payload.timestamp).getTime()).not.toBeNaN();
    });

    it("should fallback to 'unknown-service' if serviceName is omitted", () => {
      const agent = new MetricAgent({ endpoint: mockEndpoint });
      const payload = agent.collectMetrics();

      expect(payload.serviceName).toBe("unknown-service");
    });
  });

  describe("sendMetrics", () => {
    it("should dispatch a POST request with correct payload and headers", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 202,
        statusText: "Accepted",
      });
      vi.stubGlobal("fetch", fetchMock);

      const agent = new MetricAgent({
        endpoint: mockEndpoint,
        apiKey: mockApiKey,
        serviceName: "payment-api",
      });

      await agent.sendMetrics();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(mockEndpoint);
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
        Authorization: `Bearer ${mockApiKey}`,
      });

      const body = JSON.parse(options.body);
      expect(body.serviceName).toBe("payment-api");
      expect(body.hostname).toBe("test-instance-01");
      expect(body.memory.usedPercentage).toBe(75);
    });

    it("should omit Authorization header if apiKey is not provided", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", fetchMock);

      const agent = new MetricAgent({ endpoint: mockEndpoint });
      await agent.sendMetrics();

      const [, options] = fetchMock.mock.calls[0];
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
      });
      expect(options.headers.Authorization).toBeUndefined();
    });

    it("should trigger onError callback when server returns non-2xx status", async () => {
      const onErrorMock = vi.fn();
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });
      vi.stubGlobal("fetch", fetchMock);

      const agent = new MetricAgent({
        endpoint: mockEndpoint,
        onError: onErrorMock,
      });

      await agent.sendMetrics();

      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(onErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "HTTP 500: Internal Server Error",
        }),
      );
    });

    it("should catch fetch network failures without throwing to the caller", async () => {
      const onErrorMock = vi.fn();
      const fetchMock = vi
        .fn()
        .mockRejectedValue(new Error("DNS resolution failed"));
      vi.stubGlobal("fetch", fetchMock);

      const agent = new MetricAgent({
        endpoint: mockEndpoint,
        onError: onErrorMock,
      });

      // Must resolve cleanly without unhandled rejection
      await expect(agent.sendMetrics()).resolves.not.toThrow();

      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(onErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "DNS resolution failed",
        }),
      );
    });
  });

  describe("start and stop lifecycle", () => {
    it("should send metrics immediately on start, then repeat at the set interval", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", fetchMock);

      const agent = new MetricAgent({
        endpoint: mockEndpoint,
        intervalMs: 10_000,
      });

      agent.start();

      // 1. Initial invocation (immediate)
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // 2. Advance clock by 10 seconds -> 2nd call
      vi.advanceTimersByTime(10_000);
      expect(fetchMock).toHaveBeenCalledTimes(2);

      // 3. Advance clock by 20 seconds -> 2 more calls
      vi.advanceTimersByTime(20_000);
      expect(fetchMock).toHaveBeenCalledTimes(4);

      agent.stop();

      // 4. Advance clock again; should NOT trigger any new calls
      vi.advanceTimersByTime(20_000);
      expect(fetchMock).toHaveBeenCalledTimes(4);
    });

    it("should prevent duplicate interval timers if start() is called repeatedly", () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", fetchMock);

      const agent = new MetricAgent({ endpoint: mockEndpoint });

      agent.start();
      agent.start(); // Redundant invocation

      expect(fetchMock).toHaveBeenCalledTimes(1);

      agent.stop();
    });
  });
});
