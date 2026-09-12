export function formatErrorDetails(rawItem) {
  if (!rawItem) return null;

  // Extract the raw telemetry payload if wrapped inside item.raw
  const data = rawItem.raw || rawItem;

  // Format stack trace into line arrays
  const stackTrace = Array.isArray(data.stackTrace)
    ? data.stackTrace
    : typeof data.stack === 'string'
    ? data.stack.split('\n').map((line) => line.trim())
    : ['No stack trace recorded for this event.'];

  // Map backend breadcrumbs while preserving category, level, and nested context data
  const breadcrumbs = Array.isArray(data.breadcrumbs)
    ? data.breadcrumbs.map((b) => ({
        time:
          b.time ||
          (b.timestamp
            ? new Date(b.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : 'N/A'),
        text:
          b.text ||
          (b.category ? `[${b.category.toUpperCase()}] ${b.message}` : b.message || 'Log captured'),
        isError: b.isError ?? (b.level === 'error' || b.type === 'error'),
        // Retained fields for detailed diagnostic views
        category: b.category || 'general',
        level: b.level || 'info',
        message: b.message || '',
        data: b.data || null,
      }))
    : [];

  // Parse stack trace to extract error line number
  const matchedLine =
    (typeof data.stack === 'string' && data.stack.match(/:(\d+):\d+\)/)?.[1]) || '131';

  return {
    // Basic Identifiers
    id: data._id || data.id || 'ERR-UNKNOWN',
    title: data.message || data.title || data.errorType || data.event || 'Unknown Error',
    environment: data.metadata?.environment || data.environment || 'production',
    
    // Express / Server Diagnostics
    statusCode: data.statusCode || 500,
    errorType: data.errorType || 'General Error',
    projectId: data.projectId || 'N/A',
    event: data.event || 'UNKNOWN_EVENT',

    // File Origin & Route Info
    origin: {
      endpoint: data.origin?.endpoint || 'N/A',
      filePath: data.origin?.filePath || 'N/A',
      timestamp: data.origin?.timestamps || data.createdAt || null,
    },

    // Raw Metadata & Error Payload Objects
    metadata: data.metadata || null,
    errorRaw: data.error || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    rawStack: data.stack || null,

    // AI Analysis & Proposed Patch
    aiAnalysis:
      data.aiAnalysis ||
      `Incident triggered in ${data.origin?.filePath || 'server file'} at endpoint "${
        data.origin?.endpoint || 'N/A'
      }". The operation failed with status code ${data.statusCode || 500} due to "${
        data.errorType || 'Validation/Authentication failure'
      }".`,

    codePatch: data.codePatch || {
      line: matchedLine,
      original: `throw new Error("${data.message || 'Invalid payload'}");`,
      fix: `return res.status(${data.statusCode || 400}).json({ error: "${
        data.message || 'Invalid payload'
      }" });`,
    },

    stackTrace,
    breadcrumbs,
  };
}

export function transformTelemetryData(apiResponse) {
  const rawList = Array.isArray(apiResponse)
    ? apiResponse
    : apiResponse?.data && Array.isArray(apiResponse.data)
    ? apiResponse.data
    : [];

  if (rawList.length === 0) return [];

  return rawList.map((item) => {
    const isCritical = item.statusCode >= 500;
    const isResolved = item.statusCode === 200 || item.status === 'resolved';

    return {
      id: item._id || item.id,
      title: item.message || item.errorType || item.event || 'Telemetry Event',
      service: item.origin?.endpoint || item.projectId || 'API',
      severity: isCritical ? 'critical' : 'warning',
      status: isResolved ? 'resolved' : 'unresolved',
      events: item.breadcrumbs?.length || 1,
      users: item.metadata?.userId ? 1 : 0,
      timestamp: item.createdAt
        ? new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A',
      raw: item, // Preserved for ErrorDetails inspection
    };
  });
}