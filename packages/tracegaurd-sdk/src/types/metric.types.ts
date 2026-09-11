// types/metric.types.ts
import { TBreadcrumbCategory, IBreadcrumb, TOrigin } from "../utils/response";

export type TMetricCategory =
  "system" | "process" | "network" | "database" | "runtime" | "custom";

export interface ILoadAverage {
  oneMinute: number;
  fiveMinutes: number;
  fifteenMinutes: number;
}

export interface IMemoryMetrics {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  usedPercentage: number;
}

export interface IOsMetricsData {
  loadAverage: ILoadAverage;
  memory: IMemoryMetrics;
  uptimeSeconds: number;
  cpuCount: number;
}

export interface IMetricPoint<T = Record<string, any>> {
  name: string;
  category: TMetricCategory;
  value: number | T;
  unit?: "bytes" | "percentage" | "count" | "ms" | "none";
  timestamp: string;
  tags?: Record<string, string | number | boolean>;
}
