// Intercept fetch to suppress external telemetry errors
const originalFetch = window.fetch;

window.fetch = function (...args) {
  const [resource] = args;
  const url = typeof resource === 'string' ? resource : resource?.url;

  // Suppress requests to known telemetry/tracking services
  if (url && (url.includes('useblackbox.io') || url.includes('/tlm'))) {
    console.debug('[Telemetry blocked]', url);
    // Return a resolved promise that looks like a successful fetch but with empty response
    return Promise.resolve(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }

  // Call original fetch for all other requests
  return originalFetch.apply(this, args);
};
