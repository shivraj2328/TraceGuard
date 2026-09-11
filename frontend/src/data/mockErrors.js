export const MOCK_ERRORS = [
  {
    id: 'ERR-8902',
    title: 'Database connection timeout in auth pool',
    service: 'auth-service',
    severity: 'critical',
    status: 'unresolved',
    timestamp: '2 mins ago',
    stackTrace: `Error: ConnectionTimeoutError: Could not connect to Postgres cluster at 10.0.4.12:5432
    at Pool.connect (/app/node_modules/pg/lib/pool.js:42:11)
    at async authenticateUser (/app/src/controllers/auth.js:18:24)
    at async Express.middleware (/app/src/routes/index.js:89:5)`,
    aiRecommendation: 'Database pool size exhausted due to high traffic. Increase pool limit from 20 to 50 connections in env configuration and retry idle timeout settings.'
  },
  {
    id: 'ERR-8895',
    title: 'Unhandled Promise Rejection: Payment Gateway 502',
    service: 'billing-api',
    severity: 'high',
    status: 'unresolved',
    timestamp: '14 mins ago',
    stackTrace: `FetchError: Invalid HTTP response 502 Bad Gateway from https://api.stripe.com/v1/charges
    at Response.json (/app/node_modules/node-fetch/lib/index.js:272:15)
    at async processPayment (/app/src/services/stripe.js:45:12)`,
    aiRecommendation: 'Upstream gateway failure. Implement exponential backoff retry mechanism (max 3 retries) and add circuit breaker fallback.'
  },
  {
    id: 'ERR-8871',
    title: 'Memory limit exceeded (OOM killed process)',
    service: 'analytics-worker',
    severity: 'medium',
    status: 'resolved',
    timestamp: '1 hour ago',
    stackTrace: `Fatal Error: JavaScript heap out of memory
    at AllocationSite (/app/src/workers/aggregate.js:102:18)
    at Array.forEach (<anonymous>)
    at processBatch (/app/src/workers/aggregate.js:98:20)`,
    aiRecommendation: 'Memory leak detected in stream processing loop. Paginate dataset ingestion instead of loading entire payload into RAM at once.'
  }
];