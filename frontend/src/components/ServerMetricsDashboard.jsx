import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Clock, 
  Activity, 
  RefreshCw, 
  Server, 
  AlertCircle 
} from 'lucide-react';
import MetricCard from './MetricCard';

export default function ServerMetricsDashboard() {
  const [service, setService] = useState('test-server');
  const [minutes, setMinutes] = useState(60);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Comprehensive normalizer to catch any variant of backend keys/agent payloads
  const normalizeMetric = (raw) => {
    if (!raw) return null;

    // Check all potential CPU property variants
    let cpuVal = 0;
    if (raw.cpuUsage != null) {
      cpuVal = raw.cpuUsage;
    } else if (raw.cpu != null) {
      cpuVal = typeof raw.cpu === 'object' ? (raw.cpu.usagePercent ?? raw.cpu.load ?? 0) : raw.cpu;
    } else if (Array.isArray(raw.loadAverage) && raw.loadAverage.length > 0) {
      cpuVal = raw.loadAverage[0];
    } else if (typeof raw.loadAverage === 'number') {
      cpuVal = raw.loadAverage;
    } else if (raw.cpuPercent != null) {
      cpuVal = raw.cpuPercent;
    }

    // Check all potential Memory property variants
    let memVal = 0;
    if (raw.memoryUsage != null) {
      memVal = raw.memoryUsage;
    } else if (raw.memoryPercent != null) {
      memVal = raw.memoryPercent;
    } else if (raw.memory) {
      if (typeof raw.memory === 'number') {
        memVal = raw.memory;
      } else if (raw.memory.usagePercent != null) {
        memVal = raw.memory.usagePercent;
      } else if (raw.memory.totalBytes && raw.memory.freeBytes != null) {
        memVal = ((1 - raw.memory.freeBytes / raw.memory.totalBytes) * 100);
      } else if (raw.memory.used && raw.memory.total) {
        memVal = (raw.memory.used / raw.memory.total) * 100;
      }
    }

    // Check Latency & Requests variants
    const latencyVal = raw.latency ?? raw.avgLatency ?? raw.responseTime ?? null;
    const requestsVal = raw.requests ?? raw.requestsPerMin ?? raw.reqCount ?? null;

    return {
      cpuUsage: Number(cpuVal) || 0,
      memoryUsage: Number(memVal) || 0,
      latency: latencyVal,
      requests: requestsVal
    };
  };

  const fetchMetrics = useCallback(async () => {
    try {
      const queryParams = service ? `?service=${encodeURIComponent(service)}` : '';
      const historyParams = `${queryParams ? queryParams + '&' : '?'}minutes=${minutes}&limit=100`;

      const [latestRes, historyRes] = await Promise.all([
        fetch(`http://localhost:5000/api/v1/metrics/latest${queryParams}`),
        fetch(`http://localhost:5000/api/v1/metrics/history${historyParams}`)
      ]);

      if (!latestRes.ok || !historyRes.ok) {
        throw new Error('Failed to synchronize server telemetry');
      }

      const latestData = await latestRes.json();
      const historyData = await historyRes.json();

      const parsedLatest = normalizeMetric(latestData);
      const parsedHistory = (historyData.data || []).map(normalizeMetric);

      setLatest(parsedLatest);
      setHistory(parsedHistory);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [service, minutes]);

  useEffect(() => {
    let isMounted = true;

    const executeFetch = async () => {
      if (isMounted) {
        await fetchMetrics();
      }
    };

    executeFetch();

    if (!autoRefresh) return;
    const interval = setInterval(executeFetch, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchMetrics, autoRefresh]);

  const renderSparkline = (dataKey, strokeColor = '#818cf8') => {
    if (!history.length) return null;

    const values = history.map((item) => item[dataKey] ?? 0);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const width = 300;
    const height = 40;

    const points = values
      .map((val, idx) => {
        const x = (idx / (values.length - 1 || 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-full h-10 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-100 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            System Performance Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Real-time infrastructure & resource metrics
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Filter service..."
            className="bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />

          <select
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
          >
            <option value={15}>15 mins</option>
            <option value={60}>1 hour</option>
            <option value={360}>6 hours</option>
            <option value={1440}>24 hours</option>
          </select>

          <button
            onClick={fetchMetrics}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Load"
          value={latest?.cpuUsage != null ? latest.cpuUsage.toFixed(2) : 'N/A'}
          icon={<Cpu className="w-4 h-4 text-indigo-400" />}
          trend={history.length > 0 ? `Avg: ${(history.reduce((acc, curr) => acc + (curr.cpuUsage || 0), 0) / history.length).toFixed(2)}` : 'No data'}
        />

        <MetricCard
          title="Memory Used"
          value={latest?.memoryUsage != null ? `${latest.memoryUsage.toFixed(1)}%` : 'N/A'}
          icon={<HardDrive className="w-4 h-4 text-emerald-400" />}
          trend={history.length > 0 ? `Peak: ${Math.max(...history.map(h => h.memoryUsage || 0)).toFixed(1)}%` : 'No data'}
        />

        <MetricCard
          title="Avg Latency"
          value={latest?.latency != null ? `${latest.latency} ms` : 'N/A'}
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          trend="Agent metric inactive"
        />

        <MetricCard
          title="Requests / min"
          value={latest?.requests != null ? latest.requests.toLocaleString() : 'N/A'}
          icon={<Activity className="w-4 h-4 text-sky-400" />}
          trend="Agent metric inactive"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            System Activity History ({minutes}M Window)
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Data points: {history.length}
          </span>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>CPU Usage Trend</span>
                <span className="text-indigo-400 font-semibold">{latest?.cpuUsage?.toFixed(2) || 0}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                {renderSparkline('cpuUsage', '#818cf8')}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Memory Allocation Trend</span>
                <span className="text-emerald-400 font-semibold">{latest?.memoryUsage?.toFixed(1) || 0}%</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                {renderSparkline('memoryUsage', '#34d399')}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
            No historical metrics available for service "{service || 'all'}".
          </div>
        )}
      </div>
    </div>
  );
}