"use client";

import * as React from "react";

import { createBachLinhKyWorker } from "./create-worker";
import type { EngineRequest, EngineResponse } from "./engine";

type Pending = { request: EngineRequest; resolve: (response: EngineResponse) => void };
export type EngineCall = Omit<EngineRequest, "id">;

function onMainThread(request: EngineRequest): Promise<EngineResponse> {
  return import("./engine").then(
    ({ handle }) =>
      new Promise((resolve) => {
        // Let the "Tianwu is thinking" state paint before the main thread gets busy.
        window.setTimeout(() => resolve(handle(request)), 30);
      }),
  );
}

/**
 * Asks Tianwu for a move in a web worker. If workers are unavailable, the
 * search runs on the main thread instead: the page may pause while Tianwu
 * thinks, but the game still works.
 */
export function useBachLinhKyEngine() {
  const worker = React.useRef<Worker | null>(null);
  const pending = React.useRef(new Map<number, Pending>());
  const nextId = React.useRef(1);

  React.useEffect(() => {
    let created: Worker | null = null;
    try {
      created = createBachLinhKyWorker();
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

  return React.useCallback((body: EngineCall): Promise<EngineResponse> => {
    const request = { ...body, id: nextId.current++ } as EngineRequest;
    const current = worker.current;
    if (!current) return onMainThread(request);
    return new Promise((resolve) => {
      pending.current.set(request.id, { request, resolve });
      current.postMessage(request);
    });
  }, []);
}
