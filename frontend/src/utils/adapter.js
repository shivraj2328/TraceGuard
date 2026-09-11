export function formatErrorDetails(rawItem) {
  if (!rawItem) return null;

  // Handle both raw API payload and pre-mapped item
  const data = rawItem.raw || rawItem;

  // Format stack trace into line arrays
  const stackTrace = data.stack
    ? data.stack.split('\n').map((line) => line.trim())
    : ['No stack trace recorded for this event.'];

  // Map backend breadcrumbs to UI format
  const breadcrumbs = Array.isArray(data.breadcrumbs)
    ? data.breadcrumbs.map((b) => ({
        time: b.timestamp
          ? new Date(b.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          : 'N/A',
        text: b.category ? `[${b.category.toUpperCase()}] ${b.message}` : b.message,
        isError: b.level === 'error',
      }))
    : [];

  // Parse stack trace to extract error line number
  const matchedLine = data.stack?.match(/:(\d+):\d+\)/)?.[1] || '131';

  return {
    id: data._id || data.id,
    title: data.message || data.errorType || data.event || 'Unknown Error',
    environment: data.metadata?.environment || 'production',
    
    // Fallback AI Analysis derived from telemetry if AI backend isn't attached yet
    aiAnalysis:
      data.aiAnalysis ||
      `Incident triggered in ${data.origin?.filePath || 'server file'} at endpoint "${data.origin?.endpoint || 'N/A'}". ` +
      `The operation failed with status code ${data.statusCode} due to "${data.errorType || 'Validation/Authentication failure'}".`,

    // Proposed code patch structure
    codePatch: data.codePatch || {
      line: matchedLine,
      original: `throw new Error("${data.message || 'Invalid payload'}");`,
      fix: `return res.status(${data.statusCode || 400}).json({ error: "${data.message || 'Invalid payload'}" });`,
    },

    stackTrace,
    breadcrumbs,
  };
}


export function transformTelemetryData(apiResponse) {
  if (!apiResponse?.data || !Array.isArray(apiResponse.data)) return [];

  


  return apiResponse.data.map((item) => {
    const isCritical = item.statusCode >= 500;
    const isResolved = item.statusCode < 400;
    
    return {
      id: item._id,
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
      raw: item, // Preserved for detail modal or payload inspection
    };
  });
}