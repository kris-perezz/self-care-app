/**
 * Simple timing helper. Returns a function that logs elapsed ms when called.
 *
 * Server usage:  logs appear in the Next.js terminal
 * Client usage:  logs appear in the browser console
 *
 * const done = perf("[server] getBalance");
 * await doWork();
 * done(); // → [server] getBalance: 72ms
 */
export function perf(label: string): () => void {
  const start = performance.now();
  return () => {
    const ms = (performance.now() - start).toFixed(1);
    console.log(`${label}: ${ms}ms`);
  };
}
