"use client";

import * as React from "react";

import { createCvnWorker } from "./create-worker";
import type { EngineRequest, EngineResponse } from "./engine";

type Call = Omit<EngineRequest, "id">;

function onMainThread(request: EngineRequest): Promise<EngineResponse> {
  return import("./engine").then(
    ({ handle }) =>
      new Promise((resolve) => {
        // Let the "thinking" state paint before the main thread gets busy.
        window.setTimeout(() => resolve(handle(request)), 30);
      }),
  );
}

/** Talks to Tianwu in a web worker, or on the main thread if workers are unavailable. */
export function useCvnEngine() {
  const worker = React.useRef<Worker | null>(null);
  const pending = React.useRef(new Map<number, { request: EngineRequest; resolve: (r: EngineResponse) => void }>());
  const nextId = React.useRef(1);

  React.useEffect(() => {
    let created: Worker | null = null;
    try {
      created = createCvnWorker();
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

  return React.useCallback((body: Call): Promise<EngineResponse> => {
    const request = { ...body, id: nextId.current++ } as EngineRequest;
    const current = worker.current;
    if (!current) return onMainThread(request);
    return new Promise((resolve) => {
      pending.current.set(request.id, { request, resolve });
      current.postMessage(request);
    });
  }, []);
}
