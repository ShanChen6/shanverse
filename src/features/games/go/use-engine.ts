"use client";

import * as React from "react";

import { createGoWorker } from "./create-worker";
import type { EngineRequest, EngineResponse } from "./engine";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type EngineCall = DistributiveOmit<Exclude<EngineRequest, { kind: "load-net" }>, "id">;
type Pending = { request: EngineRequest; resolve: (response: EngineResponse) => void; onProgress?: (loaded: number, total: number) => void };

function onMainThread(request: EngineRequest): Promise<EngineResponse> {
  if (request.kind === "load-net") return Promise.resolve({ id: request.id, kind: "error", message: "no worker" });
  return import("./engine").then(
    ({ handle }) =>
      new Promise((resolve) => {
        // Let the "thinking" state paint before the main thread gets busy.
        window.setTimeout(() => resolve(handle(request)), 30);
      }),
  );
}

/**
 * Talks to the Go engine in a web worker. If workers are unavailable, the tree
 * search runs on the main thread instead (the page may pause while Tianwu
 * thinks, but the game still works); the neural network needs the worker.
 */
export function useGoEngine() {
  const worker = React.useRef<Worker | null>(null);
  const pending = React.useRef(new Map<number, Pending>());
  const nextId = React.useRef(1);

  React.useEffect(() => {
    let created: Worker | null = null;
    try {
      created = createGoWorker();
      created.onmessage = (event: MessageEvent<EngineResponse>) => {
        const entry = pending.current.get(event.data.id);
        if (!entry) return;
        if (event.data.kind === "net-progress") {
          entry.onProgress?.(event.data.loaded, event.data.total);
          return;
        }
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

  const send = React.useCallback((request: EngineRequest, onProgress?: Pending["onProgress"]): Promise<EngineResponse> => {
    const current = worker.current;
    if (!current) return onMainThread(request);
    return new Promise((resolve) => {
      pending.current.set(request.id, { request, resolve, onProgress });
      current.postMessage(request);
    });
  }, []);

  const call = React.useCallback((body: EngineCall) => send({ ...body, id: nextId.current++ } as EngineRequest), [send]);

  const loadNet = React.useCallback(
    (url: string, onProgress?: (loaded: number, total: number) => void) => send({ id: nextId.current++, kind: "load-net", url }, onProgress),
    [send],
  );

  return { call, loadNet };
}
