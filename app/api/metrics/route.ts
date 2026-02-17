import { NextRequest } from 'next/server';
let requestCount = 0;
let errorCount = 0;
let lastLatencyMs = 0;

export async function GET(req: NextRequest) {
  const start = Date.now();
  requestCount++;
  try {
    // Simulate a health check or DB ping if needed
    lastLatencyMs = Date.now() - start;
    return new Response(
      `# HELP dokuntag_requests_total Total requests\n` +
      `dokuntag_requests_total ${requestCount}\n` +
      `# HELP dokuntag_errors_total Total errors\n` +
      `dokuntag_errors_total ${errorCount}\n` +
      `# HELP dokuntag_last_latency_ms Last request latency\n` +
      `dokuntag_last_latency_ms ${lastLatencyMs}\n`,
      { headers: { 'Content-Type': 'text/plain' } }
    );
  } catch (e) {
    errorCount++;
    return new Response(`# ERROR\n`, { status: 500 });
  }
}
