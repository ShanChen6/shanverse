// Kept in its own module so the bundler sees the `new URL(..., import.meta.url)`
// pattern it needs to emit the worker as a separate file.
export function createCvnWorker(): Worker {
  return new Worker(new URL("./cvn.worker.ts", import.meta.url), { type: "module", name: "tianwu-co-viet-nam" });
}
