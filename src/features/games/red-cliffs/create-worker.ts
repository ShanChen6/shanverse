// Kept in its own module so the bundler sees the `new URL(..., import.meta.url)`
// pattern it needs to emit the worker as a separate file.
export function createRedCliffsWorker(): Worker {
  return new Worker(new URL("./red-cliffs.worker.ts", import.meta.url), { type: "module", name: "red-cliffs" });
}
