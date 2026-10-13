// Web worker that thinks for Tianwu, so the page stays responsive. It also
// downloads (and caches) the neural network when the page asks for it.
import { handle, setNetwork, type EngineRequest, type EngineResponse } from "./engine";
import { Network } from "./katago/network";

const CACHE_NAME = "shanverse-go-net";

const post = (response: EngineResponse) => self.postMessage(response);

async function download(url: string, id: number): Promise<ArrayBuffer> {
  let cache: Cache | null = null;
  try {
    cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(url);
    if (hit) return await hit.arrayBuffer();
  } catch {
    cache = null; // Cache storage can be unavailable (private mode); just download.
  }
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`network download failed (${response.status})`);
  const total = Number(response.headers.get("content-length")) || 0;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  let lastReport = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (loaded - lastReport > 512 * 1024) {
      lastReport = loaded;
      post({ id, kind: "net-progress", loaded, total });
    }
  }
  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  if (cache) {
    try {
      await cache.put(url, new Response(bytes.slice().buffer, { headers: { "content-type": "application/octet-stream" } }));
    } catch {
      // Not cached; it will be downloaded again next visit.
    }
  }
  return bytes.buffer;
}

let loading: Promise<Network> | null = null;

self.onmessage = async (event: MessageEvent<EngineRequest>) => {
  const request = event.data;
  try {
    if (request.kind === "load-net") {
      loading ??= download(request.url, request.id).then((buffer) => Network.load(buffer));
      const net = await loading;
      setNetwork(net);
      post({ id: request.id, kind: "net-ready", name: net.name, simd: net.simd });
      return;
    }
    post(handle(request));
  } catch (error) {
    if (request.kind === "load-net") loading = null;
    post({ id: request.id, kind: "error", message: String(error) });
  }
};
