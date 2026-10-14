// Kept in its own module so the bundler sees the `new URL(..., import.meta.url)`
// pattern it needs to emit the worker as a separate file.
export function createBachLinhKyWorker(): Worker {
  return new Worker(new URL("./blk.worker.ts", import.meta.url), { type: "module", name: "tianwu-bach-linh-ky" });
}
