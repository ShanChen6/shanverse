"use client";

import * as React from "react";

import { createRedCliffsWorker } from "./create-worker";
import type { EngineRequest, EngineResponse } from "./engine";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type EngineCall = DistributiveOmit<EngineRequest, "id">;
type Pending = { request: EngineRequest; resolve: (response: EngineResponse) => void };

function onMainThread(request: EngineRequest): Promise<EngineResponse> {
  return import("./engine").then(
    ({ handle }) =>
      new Promise((resolve) => {
        // Let the "working" state paint before the main thread gets busy.
        window.setTimeout(() => resolve(handle(request)), 30);
      }),
  );
}

/**
 * Talks to the board maker and solver in a web worker. If workers are
 * unavailable, the same code runs on the main thread (the page may pause for
 * a moment, but the game still works).
 */
export function useRedCliffsEngine() {
  const worker = React.useRef<Worker | null>(null);
  const pending = React.useRef(new Map<number, Pending>());
  const nextId = React.useRef(1);

  React.useEffect(() => {
    let created: Worker | null = null;
    try {
      created = createRedCliffsWorker();
      created.onmessage = (event: MessageEvent<EngineResponse>) => {
        const entry = pending.current.get(event.data.id);
        if (!entry) return;
        pending.current.delete(event.data.id);
        entry.resolve(event.data);
      };
      created.onerror = (event) => {
        event.preventDefault();
        created?.terminate();
        worker.current = null;
        const waiting = [...pending.current.values()];
        pending.current.clear();
        for (const entry of waiting) void onMainThread(entry.request).then(entry.resolve);
      };
      worker.current = created;
    } catch {
      worker.current = null;
    }
    const waiting = pending.current;
    return () => {
      created?.terminate();
      worker.current = null;
      waiting.clear();
    };
  }, []);

  const call = React.useCallback((body: EngineCall): Promise<EngineResponse> => {
    const request = { ...body, id: nextId.current++ } as EngineRequest;
    const current = worker.current;
    if (!current) return onMainThread(request);
    return new Promise((resolve) => {
      pending.current.set(request.id, { request, resolve });
      current.postMessage(request);
    });
  }, []);

  return call;
}
