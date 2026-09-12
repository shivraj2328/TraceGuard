import os from "os";

export interface MetricAgentConfig {
  endpoint: string;
  apiKey?: string;
  intervalMs?: number;
  serviceName?: string;
  onError?: (err: Error) => void;
}

export interface OsMetricsPayload {
  serviceName: string;
  hostname: string;
  timestamp: string;
  loadAverage: {
    oneMinute: number;
    fiveMinutes: number;
    fifteenMinutes: number;
  };
  memory: {
    totalBytes: number;
    freeBytes: number;
    usedPercentage: number;
  };
}

export class MetricAgent {
  private timer: NodeJS.Timeout | null = null;
  private readonly endpoint: string;
  private readonly apiKey?: string;
  private readonly intervalMs: number;
  private readonly serviceName: string;
  private readonly onError: (err: Error) => void;

  constructor(config: MetricAgentConfig) {
    this.endpoint = config.endpoint;
    this.apiKey = config.apiKey;
    this.intervalMs = config.intervalMs ?? 20_000;
    this.serviceName = config.serviceName ?? "unknown-service";
    this.onError =
      config.onError ??
      ((err) => console.error("[MetricAgent Error]:", err.message));
  }

  public collectMetrics(): OsMetricsPayload {
    const [oneMinute, fiveMinutes, fifteenMinutes] = os.loadavg();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    return {
      serviceName: this.serviceName,
      hostname: os.hostname(),
      timestamp: new Date().toISOString(),
      loadAverage: { oneMinute, fiveMinutes, fifteenMinutes },
      memory: {
        totalBytes: totalMem,
        freeBytes: freeMem,
        usedPercentage: Number(
          (((totalMem - freeMem) / totalMem) * 100).toFixed(2),
        ),
      },
    };
  }

  public async sendMetrics(): Promise<void> {
    try {
      const payload = this.collectMetrics();

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      this.onError(err as Error);
    }
  }

  public start(): void {
    if (this.timer) return;

    // Send initial snapshot immediately
    void this.sendMetrics();

    this.timer = setInterval(() => {
      void this.sendMetrics();
    }, this.intervalMs);

    // Prevent agent from holding process open if main app wants to exit
    this.timer.unref();
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
