export const MOCK_ERRORS = [
  {
    id: 'ERR-8902',
    title: 'TypeError: Cannot read properties of undefined (reading "map")',
    service: 'PAYMENT-GATEWAY',
    environment: 'production',
    severity: 'critical',
    status: 'unresolved',
    timestamp: '2 mins ago',
    events: 342,
    users: 89,
    aiAnalysis: 'The API response payload for `items` returned `null` instead of an empty array when the user cart was emptied during checkout.',
    codePatch: {
      line: 142,
      original: 'return items.map(item => <ItemKey key={item.id} {...item} />);',
      fix: 'return (items || []).map(item => <ItemKey key={item.id} {...item} />);'
    },
    stackTrace: [
      "TypeError: Cannot read properties of undefined (reading 'map')",
      "  at PaymentList (https://traceguard.io/assets/checkout.js:142:23)",
      "  at renderWithHooks (https://traceguard.io/assets/vendor.js:891:14)",
      "  at mountIndeterminateComponent (https://traceguard.io/assets/vendor.js:1024:18)"
    ],
    breadcrumbs: [
      { time: '14:22:01', text: 'User clicked "Checkout"', isError: false },
      { time: '14:22:02', text: 'POST /api/v1/cart/clear -> 200 OK', isError: false },
      { time: '14:22:03', text: 'GET /api/v1/checkout/items -> 200 OK (Data: { items: null })', isError: false },
      { time: '14:22:03', text: 'Uncaught Exception thrown in component <PaymentList>', isError: true }
    ]
  },
  {
    id: 'ERR-8895',
    title: 'MongoServerError: E11000 duplicate key error collection',
    service: 'AUTH-SERVICE',
    environment: 'production',
    severity: 'high',
    status: 'unresolved',
    timestamp: '14 mins ago',
    events: 12,
    users: 4,
    aiAnalysis: 'Concurrent user registration triggers key collisions on the unique index during high traffic bursts.',
    codePatch: {
      line: 88,
      original: 'await User.create(userData);',
      fix: 'await User.findOneAndUpdate({ email: userData.email }, userData, { upsert: true });'
    },
    stackTrace: [
      "MongoServerError: E11000 duplicate key error collection: auth.users index: email_1 dup key",
      "  at processTicksAndRejections (node:internal/process/task_queues:95:5)"
    ],
    breadcrumbs: [
      { time: '14:08:12', text: 'User submitted sign-up form', isError: false },
      { time: '14:08:13', text: 'MongoServerError: Duplicate key exception', isError: true }
    ]
  }
];